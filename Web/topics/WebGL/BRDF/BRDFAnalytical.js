/*
 Contains the definition for a BRDF coming from a MERL slice
 */

o3djs.provide( 'BRDF.BRDFAnalytical' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'BRDF.BRDFBase' );

BRDFAnalytical = function( _Type )
{
	BRDFBase.call( this );	// Call base constructor

	this.type = _Type;
	switch ( this.type )
	{
	case 0:	// Blinn-Phong
		this.name = "Blinn-Phong";
		break;

	case 1:	// Ashikhmin-Shirley
		this.name = "Ashikhmin-Shirley";
		break;

	case 2:	// Cook-Torrance
		this.name = "Cook-Torrance";
		break;

	case 3:	// Walter
		this.name = "Walter";
		break;

	case 4:	// Ward
		this.name = "Ward";
		break;

	default:
		throw "Unsupported Analytical BRDF Type " + _Type;
	}

	this.uniqueID = BRDFAnalytical.uniqueID++;	// Increment unique ID

	// Add some unique qualifier to the name too...
	this.name += " #" + this.uniqueID;

	// Diffuse parameters
	this.diffuseType = 1;	// Oren-Nayar
	this.diffuseReflectance = new vec3( 0.2, 0.35, 0.56 );
	this.roughness = 0.6;	// Oren-Nayar roughness

	// Specular parameters
	this.diffuseOnly = false;	// Also compute specular
	this.useComplexFresnel = true;
	this.lerpDiffuseWithFresnel = true;
	this.fresnelF0 = 0.6;	// Metal
//	this.specularColor = new vec3( 1.0, 0.72, 0.32 ).mul( 0.2 );
	this.specularColor = new vec3( 1.0, 1.0, 1.0 );

	// == Blinn-Phong + Ashikmin-Shirley ==
	this.specularExponent = Math.log( 50.0 ) * Math.LOG10E;

	// == Cook-Torrance & Ward ==
	this.specularRoughness = 0.5;	// Could be the same as diffuse roughness
	this.includeG = true;
	this.useBeckmann = true;
	this.useSimplifiedCookTorrance = false;	// http://www.hungrycat.hu/microfacet.pdf

	// == Walter == (http://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf)
	// I'm experimenting with the generalized Trowbridge-Reitz model as suggested in
	//	the Disney paper http://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_notes_v2.pdf
	//	at §5.4
	// I'm not sure of the normalization factor with exponents different from the standard value 2 though...
	//
	this.generalizedTrowbridgeReitzExponent = 2.0;	// Standard Trowbridge-Reitz
}

BRDFAnalytical.uniqueID = 0;
BRDFAnalytical.prototype =
{
	Destroy : function()
	{
		this.DestroyTextures();
	}

	// Returns a string uniquely qualifying the BRDF (other types of BRDFs also provide such a hash, it ensures we don't load the same BRDF twice in the list)
	, GetHash : function()
	{
		return "Analytical_" + this.name;// Unique ID is already included in the name ! + "_" + this.uniqueID;
	}

	// Initializes the BRDF
	, Init : function( opt_LoadedCallback )
	{
		// Fill initial pixels
		this.NotifyChange();

		// Notify!
		if ( opt_LoadedCallback )
			opt_LoadedCallback( this );
	}

	//////////////////////////////////////////////////////////////////////////
	// Clear the cached textures & rebuild the pixels array
	, __thetaH : 0.0
	, __cosThetaH : 0.0
	, __thetaD : 0.0
	, __cosThetaD : 0.0
	, __toLight : vec3.zero()
	, UpdateTexture : function()
	{
		this.DestroyTextures();

		var	ComputeSpecularFunction = null;
		if ( !this.diffuseOnly )
		{
			switch ( this.type )
			{
			case 0: ComputeSpecularFunction = this.ComputeSpecular_BlinnPhong; this.PrepareBlinnPhong(); break;
			case 1: ComputeSpecularFunction = this.ComputeSpecular_AshikminShirley; this.PrepareAshikminShirley(); break;
			case 2: ComputeSpecularFunction = this.useBeckmann ? this.ComputeSpecular_CookTorrance_Beckmann : this.ComputeSpecular_CookTorrance_Ward; this.PrepareCookTorrance(); break;
			case 3: ComputeSpecularFunction = this.ComputeSpecular_Walter; this.PrepareWalter(); break;
			case 4: ComputeSpecularFunction = this.ComputeSpecular_Ward; this.PrepareWard(); break;
			}
		}
		else
			ComputeSpecularFunction = this.ComputeSpecular_None;

		var	ComputeDiffuseFunction = null;
		switch ( this.diffuseType )
		{
		case 0: ComputeDiffuseFunction = this.ComputeDiffuse_Lambert; this.PrepareLambert(); break;
		case 1: ComputeDiffuseFunction = this.ComputeDiffuse_OrenNayar; this.PrepareOrenNayar(); break;
		case 2: ComputeDiffuseFunction = this.ComputeDiffuse_Metal; break;
		}

		// F0 = ((n2 - n1) / (n2 + n1))²
		// Assuming n1=1 (air)
		// We look for n2 so:
		//	n2 = (1+a)/(1-a) with a = sqrt(F0)
		var	IOR = (1+Math.sqrt(this.fresnelF0)) / (1-Math.sqrt(this.fresnelF0));
		if ( !isFinite( IOR ) )
			IOR = 1e30;	// Simply use a huge number instead...

		var	Pixels = this.sliceTexturePixels;
		this.minReflectance = new vec3( 1e6 );
		this.maxReflectance = new vec3( -1e6 );
		this.avgReflectance = new vec3( 0.0 );

		this.albedo = vec3.zero();
		var	dThetaH, Temp;

		var	Diffuse = vec3.zero();
		var	Specular = vec3.zero();
		var	Offset = 0, R, G, B;
		for ( var Y=0; Y < 90; Y++ )
		{
			this.__thetaD = Y * Math.HALFPI / 90;

			// Prepare Fresnel
			this.__cosThetaD = Math.cos( this.__thetaD );
			var	Fresnel;
			if ( this.useComplexFresnel )
			{	// Use the true Fresnel from Walter's paper §5.1 (http://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf)
				var	c = this.__cosThetaD;
				var	g = Math.sqrt( Math.max( 0.0, IOR*IOR - 1.0 + c*c ) );

				var	a = (g - c) / (g + c);
					a *= a;
				var	b = (c * (g+c) - 1) / (c*(g - c) + 1);
					b = 1 + b*b;

				Fresnel = 0.5 * a * b;
			}
			else
			{	// Use Schlick's approximation
				var	F = 1.0 - this.__cosThetaD;
				var	F5 = F*F;
					F5 *= F5;
					F5 *= F;
				Fresnel = this.fresnelF0 + (1.0 - this.fresnelF0) * F5;
			}
			var	DiffuseFresnel = this.lerpDiffuseWithFresnel ? 1.0 - Fresnel : 1.0;

			for ( var X=0; X < 90; X++ )
			{
				this.__thetaH = Math.HALFPI * X * X / 8100;
				this.__cosThetaH = Math.cos( this.__thetaH );
				this.__sinThetaH = Math.sin( this.__thetaH );
				this.ComputeLightDirection();

				ComputeDiffuseFunction.call( this, Diffuse );
				ComputeSpecularFunction.call( this, Specular );

				R = Specular.x * Fresnel + Diffuse.x * DiffuseFresnel;
				G = Specular.y * Fresnel + Diffuse.y * DiffuseFresnel;
				B = Specular.z * Fresnel + Diffuse.z * DiffuseFresnel;

//R = G = B = Fresnel;

				Pixels[Offset++] = R;
				Pixels[Offset++] = G;
				Pixels[Offset++] = B;
				Pixels[Offset++] = 0.0;

				// Update stats
				this.minReflectance.x = Math.min( this.minReflectance.x, R );
				this.maxReflectance.x = Math.max( this.maxReflectance.x, R );
				this.avgReflectance.x += R;
				this.minReflectance.y = Math.min( this.minReflectance.y, G );
				this.maxReflectance.y = Math.max( this.maxReflectance.y, G );
				this.avgReflectance.y += G;
				this.minReflectance.z = Math.min( this.minReflectance.z, B );
				this.maxReflectance.z = Math.max( this.maxReflectance.z, B );
				this.avgReflectance.z += B;

				// Update albedo integral
				Temp = (X+0.5) / 90.0;								// We need to avoid useless X=0 values... Sample at half a step offset.
				dThetaH = Math.HALFPI * (2*X+1) / (90*90);			// Theta0 = 0²/90², Theta1 = 1²/90², ... ThetaN = N²/90² so dTheta = ((N+1)² - N²)/90² = (2N+1)/90²
				dThetaH *= Math.sin( Temp * Temp * Math.HALFPI );	// Smaller at the top of the hemisphere
				dThetaH *= Math.cos( Temp * Temp * Math.HALFPI );	// Not part of the dThetaH element but helpful factorization

//R = G = B = 1;	// DEBUG => Albedo should equal to PI

				this.albedo.x += dThetaH * R;
				this.albedo.y += dThetaH * G;
				this.albedo.z += dThetaH * B;
			}
		}

		// Finalize values
		var	dThetaD = Math.HALFPI / 90;	// Uniform pieces
			dThetaD *= 4.0;				// Not part of the dThetaD element but helpful factorization (remember we integrated only on a quarter of a sphere)
		this.albedo.x *= dThetaD;		// Should yield 1 if reflectances were all 1
		this.albedo.y *= dThetaD;
		this.albedo.z *= dThetaD;

		this.avgReflectance.mul( 1.0 / (90*90) );

		// Compute diffuse reflectance
		this.MeasureDiffuseReflectance();
	}

	// Computes the current light direction based on ThetaH/ThetaD
	, ComputeLightDirection : function()
	{
		// Tangent is (1,0,0)
		// BiTangent is (0,1,0)
		// Normal is (0,0,1)

		// Rotate away from Tangent/Normal plane
		var	x = 0.0;
		var	y = Math.sin( this.__thetaD );
		var	z = this.__cosThetaD;

		// Rotate vector by ThetaH about bitangent
		var	Cos = this.__cosThetaH;
		var	Sin = this.__sinThetaH;

		this.__toLight.x = x * Cos + z * Sin;
		this.__toLight.y = y;
		this.__toLight.z = z * Cos - x * Sin;
	}

	//////////////////////////////////////////////////////////////////////////
	// Change parameters

	// Diffuse
	, setDiffuseType : function( value )
	{
		if ( value == this.diffuseType )
			return;

		this.diffuseType = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setDiffuseReflectance : function( R, G, B )
	{
		if ( Math.almost( R, this.diffuseReflectance.x ) && Math.almost( G, this.diffuseReflectance.y ) && Math.almost( B, this.diffuseReflectance.z ))
			return;

		this.diffuseReflectance.x = R;
		this.diffuseReflectance.y = G;
		this.diffuseReflectance.z = B;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setRoughness : function( value )
	{
		if ( Math.almost( value, this.roughness ) )
			return;

		this.roughness = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	// Generic Specular
	, setDiffuseOnly : function( value )
	{
		if ( value == this.diffuseOnly )
			return;

		this.diffuseOnly = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setUseComplexFresnel : function( value )
	{
		if ( value == this.useComplexFresnel )
			return;

		this.useComplexFresnel = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setLerpDiffuseWithFresnel : function( value )
	{
		if ( value == this.lerpDiffuseWithFresnel )
			return;

		this.lerpDiffuseWithFresnel = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setFresnelF0 : function( value )
	{
		if ( Math.almost( value, this.fresnelF0 ) )
			return;

		this.fresnelF0 = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setSpecularColor : function( R, G, B )
	{
		if ( Math.almost( R, this.specularColor.x ) && Math.almost( G, this.specularColor.y ) && Math.almost( B, this.specularColor.z ))
			return;

		this.specularColor.x = R;
		this.specularColor.y = G;
		this.specularColor.z = B;
		this.NotifyChange();	// Needs a rebuild !
	}

	// Blinn-Phong + Ashikmin-Shirley
	, setSpecularExponent : function( value )
	{
		if ( Math.almost( value, this.specularExponent ) )
			return;

		this.specularExponent = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	// Cook-Torrance (+ Walter that also uses specular roughness)
	, setSpecularRoughness : function( value )
	{
		if ( Math.almost( value, this.specularRoughness ) )
			return;

		this.specularRoughness = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setIncludeG : function( value )
	{
		if ( value == this.includeG )
			return;

		this.includeG = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setUseBeckmann : function( value )
	{
		if ( value == this.useBeckmann )
			return;

		this.useBeckmann = value;
		this.NotifyChange();	// Needs a rebuild !
	}

	, setUseSimplifiedCookTorrance : function( value )
	{
		if ( value == this.useSimplifiedCookTorrance )
			return;

		this.useSimplifiedCookTorrance = value;
		this.NotifyChange();	// Needs a rebuild !
	}


	// Walter
	, setGeneralizedTrowbridgeReitzExponent : function( value )
	{
		if ( Math.almost( value, this.generalizedTrowbridgeReitzExponent ) )
			return;

		this.generalizedTrowbridgeReitzExponent = value;
		this.NotifyChange();	// Needs a rebuild !
	}


	//////////////////////////////////////////////////////////////////////////
	// Notification system
	, NotifyChange : function( opt_UpdateTexture )
	{
		if ( opt_UpdateTexture === undefined )
			opt_UpdateTexture = true;
		if ( opt_UpdateTexture )
			this.UpdateTexture();

		// Notify subscribers
		BRDFBase.prototype.NotifyChange.call( this );
	}

	//////////////////////////////////////////////////////////////////////////
	// Specular models rendering
	, __tempSF0 : 0.0      // Temp specular floats
	, __tempSF1	: 0.0
	, __tempSV0 : new vec3()  // Temp specular vectors
	, __tempSV1 : new vec3()
	, ComputeSpecular_None : function()	{}

	, PrepareBlinnPhong : function()
	{
		var	N = Math.pow( 10.0, this.specularExponent );	// Compute actual specular exponent
		this.__tempSF0 = N;
//		this.__tempSF1 = (this.__tempSF0 + 2) * Math.INV2PI;						// (n+2)/2PI (for Phong)
		this.__tempSF1 = (N+2)*(N+4)/(8.0*Math.PI*(Math.pow( 2.0, -0.5*N ) + N));	// From http://www.farbrausch.de/~fg/stuff/phong.pdf
	}
	, ComputeSpecular_BlinnPhong : function( _Color )
	{
		var	Specular = this.__tempSF1 * Math.pow( this.__cosThetaH, this.__tempSF0 );
		_Color.x = Specular * this.specularColor.x;
		_Color.y = Specular * this.specularColor.y;
		_Color.z = Specular * this.specularColor.z;
	}

	, PrepareAshikminShirley : function()
	{
		var	N = Math.pow( 10.0, this.specularExponent );	// Compute actual specular exponent
		this.__tempSF0 = N;

//		this.__tempSF1 = Math.sqrt( (nu+1)*((isotropic ? nu : nv) + 1 )) / (8.0*Math.PI);
		this.__tempSF1 = (this.specularExponent+1) / (8.0*Math.PI);
	}
	, ComputeSpecular_AshikminShirley : function( _Color )
	{
// From Disney BRDF Explorer
// We can't support anisotropy with our model so it simplifies a lot
//
//  float HdotV = dot(H,V);
//  float HdotT = dot(H,T);
//  float HdotB = dot(H,B);
//  float NdotH = dot(N,H);
//  float NdotV = dot(N,V);
//  float NdotL = dot(N,L);
//  
//  float norm_s = sqrt((nu+1)*((isotropic?nu:nv)+1))/(8*PI);
//  float n = isotropic ? nu : (nu*sqr(HdotT) + nv*sqr(HdotB))/(1-sqr(NdotH));
//  float rho_s = norm_s * F * pow(max(NdotH,0), n) / (HdotV * max(NdotV, NdotL));
// 
// Diffuse part that we can ignore
//  float rho_d = 28/(23*PI) * Rd * (1-pow(1-NdotV/2, 5)) * (1-pow(1-NdotL/2, 5));
//  if (coupled_diffuse) rho_d *= (1-Rs);   // No 1-Fresnel involved??
// 
//  return vec3(rho_s + rho_d);

		var	NdotH = this.__cosThetaH;
		var	NdotL = this.__toLight.z;	// = NdotV
		var	HdotL = this.__cosThetaD;	// = HdotV

		var	Specular = this.__tempSF1 * Math.pow( NdotH, this.__tempSF0 ) / (HdotL*NdotL);
		_Color.x = Specular * this.specularColor.x;
		_Color.y = Specular * this.specularColor.y;
		_Color.z = Specular * this.specularColor.z;
	}

	// Cook-Torrance
	, PrepareCookTorrance : function()
	{
// If we don't want to use roughness but build m from the specular exponent
// 		var	N = Math.pow( 10.0, this.specularExponent );	// Compute actual specular exponent
// 		var	m = Math.sqrt( 2.0 / (2.0 + N ) );				// From http://www.altdevblogaday.com/2011/12/19/microfacet-brdf/

//		var	m = 1.0 / this.specularRoughness;
		var	m = Math.lerp( 1e-3, 1.0, this.specularRoughness );
		this.__tempSF0 = m*m;

// 		if ( this.useBeckmann )
// 			this.__tempSF1 = 1.0 / (m*m);	// Beckmann distribution
// 		else
			this.__tempSF1 = 1.0 / (m*m);	// Ward distribution
	}
	, ComputeSpecular_CookTorrance_Beckmann : function( _Color )
	{
// From Disney BRDF Explorer
// The computation simplifies a lot in half-vector space...
//
//  float NdotH = dot(N, H);
//  float VdotH = dot(V, H);
//  float NdotL = dot(N, L);
//  float NdotV = dot(N, V);
//  float oneOverNdotV = 1.0 / NdotV;
// 
//  float D = Beckmann(m, NdotH);
//  float F = Fresnel(f0, VdotH);
// 
//  NdotH = NdotH + NdotH;
//  float G = (NdotV < NdotL) ? 
//			((NdotV*NdotH < VdotH) ? NdotH / VdotH : oneOverNdotV)
//			:
//			((NdotL*NdotH < VdotH) ? NdotH*NdotL / (VdotH*NdotV) : oneOverNdotV);
// 
//  if (include_G) G = oneOverNdotV;
//  float val = D * G ;
//  if (include_F) val *= F;

		var	NdotH = this.__cosThetaH;
		var	NdotL = this.__toLight.z;	// = NdotV
		var	HdotL = this.__cosThetaD;	// = HdotV

		// Compute Beckmann distribution
		var	CosAlpha2 = this.__cosThetaH*this.__cosThetaH;	// (N.H)²
		var	Exponent = (CosAlpha2-1) / (CosAlpha2 * this.__tempSF0);
		var	D = this.__tempSF1 * Math.exp( Exponent ) / (CosAlpha2*CosAlpha2);

		// Compute Cook-Torrance geometric term
		var	G = this.includeG ?
		 (this.useSimplifiedCookTorrance ? 1.0 / (4.0 * HdotL*HdotL) : NdotH / HdotL)
		  : 1.0;

		var	Specular = this.__tempSF1 * G * D;
		_Color.x = Specular * this.specularColor.x;
		_Color.y = Specular * this.specularColor.y;
		_Color.z = Specular * this.specularColor.z;
	}
	, ComputeSpecular_CookTorrance_Ward : function( _Color )
	{
		var	NdotH = this.__cosThetaH;
		var	NdotL = this.__toLight.z;	// = NdotV
		var	HdotL = this.__cosThetaD;	// = HdotV

		var	G = this.includeG ? NdotH / HdotL : 1.0;

		// Compute Ward distribution
		var	CosAlpha2 = this.__cosThetaH*this.__cosThetaH;	// (N.H)²
		var	Exponent = (1.0-CosAlpha2) / (CosAlpha2 * this.__tempSF0);
		var	D = this.__tempSF1 * Math.exp( -Exponent ) / (CosAlpha2*this.__cosThetaH);

		var	Specular = this.__tempSF1 * G * D;
		_Color.x = Specular * this.specularColor.x;
		_Color.y = Specular * this.specularColor.y;
		_Color.z = Specular * this.specularColor.z;
	}

	// Walter
	, PrepareWalter : function()
	{
// If we don't want to use roughness but build m from the specular exponent
// 		var	N = Math.pow( 10.0, this.specularExponent );	// Compute actual specular exponent
// 		var	m = Math.sqrt( 2.0 / (2.0 + N ) );				// From http://www.altdevblogaday.com/2011/12/19/microfacet-brdf/

//		var	m = 1.0 / this.specularRoughness;
		var	m = Math.lerp( 1e-3, 1.0, this.specularRoughness );
		this.__tempSF0 = m*m;	// Alpha is advised to be m² by Disney (from http://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_notes_v2.pdf)
								// §5.4: "For roughness, we found that mapping alpha = roughness2 results in a more perceptually linear change in the roughness"
	}
	, ComputeSpecular_Walter : function( _Color )
	{
// From Disney BRDF Explorer
// 
// float GGX(float NdotH, float alphaG)
// {
//		return alphaG*alphaG / (PI * sqr(NdotH*NdotH*(alphaG*alphaG-1) + 1));
// }
// 
// float smithG_GGX(float Ndotv, float alphaG)
// {
//		return 2/(1 + sqrt(1 + alphaG*alphaG * (1-Ndotv*Ndotv)/(Ndotv*Ndotv)));
// }
// 
// vec3 BRDF( vec3 L, vec3 V, vec3 N, vec3 X, vec3 Y )
// {
//	float NdotL = dot(N, L);
//	float NdotV = dot(N, V);
//	if (NdotL < 0 || NdotV < 0) return vec3(0);
//	
//	vec3 H = normalize(L+V);
//	float NdotH = dot(N, H);
//	float VdotH = dot(V, H);
//	
//	float D = GGX(NdotH, alphaG);
//	float G = smithG_GGX(NdotL, alphaG) * smithG_GGX(NdotV, alphaG);
//	
//	// fresnel
//	float c = VdotH;
//	float g = sqrt(ior*ior + c*c - 1);
//	float F = useFresnel ? 0.5 * pow(g-c,2) / pow(g+c,2) * (1 + pow(c*(g+c)-1,2) / pow(c*(g-c)+1,2)) : 1.0;
//	
//	float val = Kd/PI + Ks * D * G * F / (4 * NdotL * NdotV);
//	return vec3(val);
// }

		var	NdotH = this.__cosThetaH;
		var	NdotL = this.__toLight.z;	// = NdotV
		var	HdotL = this.__cosThetaD;	// = HdotV

		var	alphaG = this.__tempSF0;

		// Compute GGX distribution (modified Trowbridge-Reitz)
		var	a = NdotH*NdotH*(alphaG*alphaG-1) + 1;	// = alpha²*cos²(ThetaH) + sin²(ThetaH)
//		var	D = alphaG*alphaG / (Math.PI * Math.pow( a, this.generalizedTrowbridgeReitzExponent ));
		var	D = Math.pow( alphaG / a, this.generalizedTrowbridgeReitzExponent ) / Math.PI;	// Experi-pom at normalization, need to actually integrate this!

		// Compute Smith's geometric factor
		var	SmithG_GGX = 2.0 / (1.0 + Math.sqrt( 1 + alphaG*alphaG * (1-NdotL*NdotL) / (NdotL*NdotL) ));
		var	G = SmithG_GGX*SmithG_GGX;	// Normally should be the product of G(NdotL).G(NdotV) but since NdotL==NdotV...

		// Here, the actual Fresnel term used by the model is much more complex than the Schlick model but let's assume we're not using it...
		var	Specular = D * G / (4.0 * HdotL*NdotL);
		_Color.x = Specular * this.specularColor.x;
		_Color.y = Specular * this.specularColor.y;
		_Color.z = Specular * this.specularColor.z;
	}

	// Ward
 // I'm using the new bounded albedo reflectance model from http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.169.9908&rep=rep1&type=pdf
 //
	, PrepareWard : function()
	{
//		var	m = Math.lerp( 1e-3, 1.0, this.specularRoughness );
		var	m = this.specularRoughness;
		this.__tempSF0 = m*m;	// Alpha is advised to be m² by Disney (from http://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_notes_v2.pdf)
								// §5.4: "For roughness, we found that mapping alpha = roughness2 results in a more perceptually linear change in the roughness"
		this.__tempSF0 = Math.max( 1e-3, this.__tempSF0 );

		this.__tempSF1 = 1.0 / this.__tempSF0;
		this.__tempSF1 *= this.__tempSF1;	// 1/m²
	}
	, ComputeSpecular_Ward : function( _Color )
	{
		// Compute H = Light + View
		this.__tempDV0.set( this.__sinThetaH, 0.0, this.__cosThetaH );  // Normalized H
		var LdotH = this.__tempDV0.dot( this.__toLight );				// Denormalization factor
		this.__tempDV0.mul( LdotH );

		var	HdotH = this.__tempDV0.dot( this.__tempDV0 );
		var	HdotT = this.__sinThetaH;
		var	HdotN = this.__cosThetaH;

		var	SquareTanThetaH = HdotT / HdotN;
			SquareTanThetaH *= SquareTanThetaH;
		var	Exponent = -SquareTanThetaH * this.__tempSF1;
		var Specular = this.__tempSF1 * Math.exp( Exponent ) * HdotH / (HdotN*HdotN*HdotN*HdotN);

		Specular *= Math.INVPI;	// So albedo is never > 1

		_Color.x = Specular * this.specularColor.x;
		_Color.y = Specular * this.specularColor.y;
		_Color.z = Specular * this.specularColor.z;
	}


	//////////////////////////////////////////////////////////////////////////
	// Diffuse models rendering
	, __tempDF0 : 0.0
	, __tempDF1	: 0.0
	, __tempDF2	: 0.0
	, __tempDV0 : new vec3()
	, __tempDV1 : new vec3()
	, PrepareLambert : function()
	{
	}
	, ComputeDiffuse_Lambert : function( _Color )
	{
		_Color.x = Math.INVPI * this.diffuseReflectance.x;
		_Color.y = Math.INVPI * this.diffuseReflectance.y;
		_Color.z = Math.INVPI * this.diffuseReflectance.z;
	}
	
	// I'm using the Oren Nayar model found in the Disney BRDF explorer although I have no idea where they found it!
	// It has one more constant than the original model on wikipedia (http://en.wikipedia.org/wiki/Oren%E2%80%93Nayar_reflectance_model)
	//	and seems to have 2 orders of precision... (??)
	//
	, PrepareOrenNayar : function()
	{
	}
	, ComputeDiffuse_OrenNayar : function( _Color )
	{
// From Disney BRDF Explorer
// float VdotN = dot(V,N);
// float LdotN = dot(L,N);
// float theta_r = acos (VdotN);
// float sigma2 = pow(sigma*PI/180,2);
// 
// float cos_phi_diff = dot( normalize(V-N*(VdotN)), normalize(L - N*(LdotN)) );
// float theta_i = acos (LdotN);
// float alpha = max (theta_i, theta_r);
// float beta = min (theta_i, theta_r);
// if (alpha > PI/2) return vec3(0);
// 
// float A = 1 - 0.5 * sigma2 / (sigma2 + 0.33);
// float B = 0.45 * sigma2 / (sigma2 + 0.09);
// 	
// if (cos_phi_diff >= 0) B *= sin(alpha);
// else B *= (sin(alpha) - pow(2*beta/PI,3));
// 	
// float C = 0.125 * sigma2 / (sigma2+0.09) * pow ((4*alpha*beta)/(PI*PI),2);
// 	
// float L1 = rho/PI * (A + cos_phi_diff * B * tan(beta) + (1 - abs(cos_phi_diff)) * C * tan((alpha+beta)/2));
// float L2 = 0.17 * rho*rho / PI * sigma2/(sigma2+0.13) * (1 - cos_phi_diff*(4*beta*beta)/(PI*PI));
// 	
// return vec3(L1 + L2);

		var	NdotL = this.__toLight.z;	// = NdotV

		var	PhiI = Math.atan2( this.__toLight.y, this.__toLight.x );
		var	CosPhiDiff = Math.cos( 2 * PhiI );
		var	ThetaI = Math.acos(NdotL);
		var	SigmaSq = Math.pow( this.roughness * Math.HALFPI, 2.0 );

		var	alpha = ThetaI;
		var	beta = ThetaI;

		var	A = 1.0 - 0.5 * SigmaSq / (SigmaSq + 0.33);
		var	B = 0.45 * SigmaSq / (SigmaSq + 0.09);
		var	C = 0.125 * SigmaSq / (SigmaSq + 0.09);
		var	c = (4*alpha*beta)*Math.INVPI*Math.INVPI;
			C *= c*c;

		B *= CosPhiDiff > 0
			? Math.sin(alpha)
			: (Math.sin(alpha) - Math.pow( 2*beta*Math.INVPI, 3 ));

		var	L1 = A + (CosPhiDiff * B + (1 - Math.abs(CosPhiDiff)) * C) * Math.tan(beta);
			L1 = Math.max( 0, L1 );

		var	L2 = 0.17 * SigmaSq/(SigmaSq+0.13) * (1.0 - CosPhiDiff*(4*beta*beta)*Math.INVPI*Math.INVPI);

		_Color.x = (this.diffuseReflectance.x * (L1 + this.diffuseReflectance.x * L2)) * Math.INVPI;
		_Color.y = (this.diffuseReflectance.y * (L1 + this.diffuseReflectance.y * L2)) * Math.INVPI;
		_Color.z = (this.diffuseReflectance.z * (L1 + this.diffuseReflectance.z * L2)) * Math.INVPI;
	}

	, ComputeDiffuse_Metal : function( _Color )	{}	// Metals simply have no diffuse
};

patapi.helpers.Extend( BRDFAnalytical.prototype, BRDFBase.prototype );	// Inherit from BRDFBase
