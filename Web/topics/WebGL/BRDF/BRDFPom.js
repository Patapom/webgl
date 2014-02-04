/*
 Contains the definition for a Pom BRDF
 */

o3djs.provide( 'BRDF.BRDFPom' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'BRDF.BRDFBase' );

BRDFPom = function()
{
	BRDFBase.call( this );	// Call base constructor

	this.uniqueID = BRDFPom.uniqueID++;	// Increment unique ID
	this.name = "Pom #" + this.uniqueID;

	// Reference BRDF for fitting
	this.referenceBRDF = null;
	this.referenceBRDFDirty = true;
	this.displayType = 0;	// This BRDF


	// Special display of renderer 3D's sampling area
	this.showRenderer3DSamplingArea = false;
	this.renderer3DLightTheta = 0.25 * Math.PI;


	// Specular parameters
	this.soloX = false;
	this.amplitudeX = 100.0;
	this.falloffX = 0.3;
	this.exponentX = 0.4;
	this.offsetX = 0.0;
	this.chromaSpecular = vec3.one();

	this.soloY = false;
	this.amplitudeY = 1.0;
	this.falloffY = 1.0;
	this.exponentY = 0.8;
	this.offsetY = 0.0;
	this.chromaFresnel = vec3.one();

	// Diffuse parameters
	this.soloDiffuse = false;
	this.diffuseReflectance = 0.1;
	this.diffuseRoughness = 1.0;
	this.chromaDiffuse = vec3.one();
	this.chromaRetroDiffuse = vec3.one();


	//////////////////////////////////////////////////////////////////////////
	// Dynamic parameters
	this.useDynamicParameters = false;
	this.dynGlossinessBias = 0.0;
	this.dynRoughnessBias = 0.0;

// 	// Disney model
// 	this.soloX = false;
// 	this.amplitudeX = 0.01;	// Specular reflectance
// 	this.falloffX = 2.0;	// Fresnel exponent
// 	this.exponentX = 1.0;	// GGX exponent
// 	this.offsetX = 1.0;		// Roughness = 1
// 
// 	this.soloY = false;
// 	this.amplitudeY = 0.0;	// Retro-reflection amplitude
// 	this.falloffY = 2.0;	// Retro-reflection Fresnel exponent
// 	this.exponentY = 0.0;	// Not used
// 	this.offsetY = 0.2;		// Diffuse albedo

}

BRDFPom.uniqueID = 0;
BRDFPom.prototype =
{
	Destroy : function()
	{
		this.DestroyTextures();
	}

	// Returns a string uniquely qualifying the BRDF (other types of BRDFs also provide such a hash, it ensures we don't load the same BRDF twice in the list)
	, GetHash : function()
	{
		return "Pom_" + this.name;
	}

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
	, __sinThetaH : 0.0
	, __thetaD : 0.0
	, __cosThetaD : 0.0
	, __sinThetaD : 0.0
	, __toLight : vec3.zero()
	, UpdateTexture : function()
	{
		this.DestroyTextures();

		// F0 = ((n2 - n1) / (n2 + n1))²
		// Assuming n1=1 (air)
		// We look for n2 so:
		//	n2 = (1+a)/(1-a) with a = sqrt(F0)
		var	IOR = (1+Math.sqrt(this.fresnelF0)) / (1-Math.sqrt(this.fresnelF0));
		if ( !isFinite( IOR ) )
			IOR = 1e30;	// Simply use a huge number instead...

		this.Prepare();

		var	RefBRDFReflectance = vec3.zero();
		var	bSampleRef = false;
		if ( this.referenceBRDF && this.displayType > 0 )
			bSampleRef = true;

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
			this.__sinThetaD = Math.sin( this.__thetaD );

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

				if ( bSampleRef )
					RefBRDFReflectance = this.referenceBRDF.sample( X, Y );

				this.ComputeDiffuse( Diffuse );
				this.ComputeSpecular( Specular );

// 				R = Specular.x * Fresnel + Diffuse.x * DiffuseFresnel;
// 				G = Specular.y * Fresnel + Diffuse.y * DiffuseFresnel;
// 				B = Specular.z * Fresnel + Diffuse.z * DiffuseFresnel;

				if ( this.soloX || this.soloY )
				{
					R = Specular.x;
					G = Specular.y;
					B = Specular.z;
				}
				else if ( this.soloDiffuse )
				{
					R = Diffuse.x;
					G = Diffuse.y;
					B = Diffuse.z;
				}
				else
				{
					R = Specular.x + Diffuse.x;
					G = Specular.y + Diffuse.y;
					B = Specular.z + Diffuse.z;
				}

				// Change display
				switch ( this.displayType )
				{
				case 0:	// Show POM
					break;

				case 1:	// Show reference only
					R = RefBRDFReflectance.x;
					G = RefBRDFReflectance.y;
					B = RefBRDFReflectance.z;
					break;

				case 2:	// Show diff luminance
					var	LumPom = 0.2126 * R + 0.7152 * G + 0.0722 * B;
					var	LumRef = 0.2126 * RefBRDFReflectance.x + 0.7152 * RefBRDFReflectance.y + 0.0722 * RefBRDFReflectance.z;
					var	Diff = LumPom - LumRef;
					if ( Diff > 0 )	{ R = Diff; G = B = 0; }
					else			{ B = -Diff; R = G = 0; }
					break;

				case 3:	// Show log10 of diff luminance
					var	LumPom = 0.2126 * R + 0.7152 * G + 0.0722 * B;
					var	LumRef = 0.2126 * RefBRDFReflectance.x + 0.7152 * RefBRDFReflectance.y + 0.0722 * RefBRDFReflectance.z;
					var	Diff = LumPom - LumRef;
					if ( Diff > 0 )	{ R = Math.LOG10E * Math.log( 1 + Diff ); G = B = 0; }
					else			{ B = Math.LOG10E * Math.log( 1 - Diff ); R = G = 0; }
					break;
				}

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

				this.albedo.x += dThetaH * R;
				this.albedo.y += dThetaH * G;
				this.albedo.z += dThetaH * B;
			}
		}

		// Finalize values
		var	dThetaD = Math.HALFPI / 90;	// Uniform pieces
			dThetaD *= 4.0;				// Not part of the dThetaD element but helpful factorization (remember we integrated only on a quarter of a sphere)
		this.albedo.x *= dThetaD;		// Should yield PI if reflectances were all 1
		this.albedo.y *= dThetaD;
		this.albedo.z *= dThetaD;

		this.avgReflectance.mul( 1.0 / (90*90) );

		// Compute diffuse reflectance
// 		// This is computed by integrating along the diagonal for ThetaH = ThetaD < PI/4
// 		{
// 			this.measuredDiffuseReflectance = vec4.zero();
// 			for ( var i=0; i < 45; i++ )
// 			{
// 				var	theta = Math.HALFPI * (i + 0.5) / 45.0;
// 				var	value = this.sample( i, i );
// 
// 				var	dTheta = Math.cos( theta ) * Math.sin( theta );
// 				value.mul( dTheta );
// 
// 				this.measuredDiffuseReflectance.add( value );
// 			}
// 
// 			// Finalize
// 			this.measuredDiffuseReflectance.mul( (Math.HALFPI / 45.0) * 2.0 * Math.PI );
// 		}
		this.MeasureDiffuseReflectance();


		// Post-process by adding smudges where the view angles are sampling for a given light orientation
		if ( !this.showRenderer3DSamplingArea )
			return;

		var	LightTS = new vec3( Math.sin( this.renderer3DLightTheta ), 0.0, Math.cos( this.renderer3DLightTheta ) );
//		var	LightTS = new vec3( 0.0, Math.sin( this.renderer3DLightTheta ), Math.cos( this.renderer3DLightTheta ) );
		var	ViewTS = new vec3( 0 );


var	CheckHalfMaxDiscrepancy = new vec3();
var	CheckViewMaxDiscrepancy = new vec3();
var	CheckMaxThetaV = 0.0;

		var	COUNT_Y = 400;
		var	COUNT_X = 200;
		for ( var Y=0; Y < COUNT_Y; Y++ )
		{
			var	PhiV = Math.PI * (Y / COUNT_Y - 0.5);
			var	CosPhiV = Math.cos( PhiV );
			var	SinPhiV = Math.sin( PhiV );

			for ( var X=0; X < COUNT_X; X++ )
			{
				var	ThetaV = Math.HALFPI * X / COUNT_X;
				var	CosThetaV = Math.cos( ThetaV );
				var	SinThetaV = Math.sin( ThetaV );

				ViewTS.x = SinThetaV * SinPhiV;
				ViewTS.y = SinThetaV * CosPhiV;
				ViewTS.z = CosThetaV;

				var	Half = ViewTS.add_( LightTS ).normalize();

				var	ThetaH = Math.acos( Half.z );
				var	ThetaD = Math.acos( ViewTS.dot( Half ) );

				 
// Compute diff vector
// var	PhiH = Math.atan2( Half.y, Half.x );
// var	Temp = LightTS.rotate( vec3.unitZ(), -PhiH );	// Rotate back in Tangent^Normal plane
// var	Diff = Temp.rotate( vec3.unitY(), -ThetaH );	// Realign H with normal
// 
// var	ThetaD_Confirm = Math.acos( Diff.z );			// ThetaD is the half angle between view and light
// var	PhiD = Math.atan2( Diff.y, Diff.x );			// PhiD is the angle between the Light and the Normal^Half Vector plane
// if ( PhiD < 0.0 )
// 	PhiD += Math.PI;	// Make sure we're always in [0,PI]
// 
// // CHECK
// var	ViewTS_Check = new vec3( Math.cos( ThetaD ) * Math.sin( ThetaH ), Math.sin( ThetaD ), Math.cos( ThetaD ) * Math.cos( ThetaH ));



// Here we know only:
//	ThetaL, the angle of the light with the normal
//	ThetaH, the half angle
//	ThetaD, the difference angle
//
// From http://en.wikipedia.org/wiki/Solution_of_triangles#Three_sides_given, we know the 3 sides of the triangle
//	and we need only a single angle to find the longitude of the half vector from the source light/normal vector planes
//
var	CosThetaL = LightTS.z;
var	SinThetaL = Math.sqrt( 1.0 - LightTS.z*LightTS.z );
var	CosAlpha = (Math.cos( ThetaD ) - CosThetaL * Math.cos( ThetaH )) / (SinThetaL * Math.sin( ThetaH ));
if ( isNaN( CosAlpha ) )
	CosAlpha = (Math.cos( ThetaD ) - CosThetaL * Math.cos( ThetaH )) / Math.max( 1e-6, SinThetaL * Math.sin( ThetaH ) );

var	Alpha = Math.acos( Math.clamp( CosAlpha, -1, +1 ) );
if ( isNaN( Alpha ) )
	throw "SHIT!";

var	ProjectedLight = new vec3( LightTS.xy(), 0 );
var	ProjectedLightSize = ProjectedLight.length();
if ( ProjectedLightSize > 1e-6 )
	ProjectedLight.div( ProjectedLightSize );
else
	ProjectedLight = vec3.unitX();

var	ProjectedOrtho = new vec3( ProjectedLight.y, -ProjectedLight.x, 0 );

var	HalfVectorDir = ProjectedLight.mul_( Math.cos( Alpha ) ).add( ProjectedOrtho.mul_( Math.sin( Alpha ) ) );

var	Half_Check = vec3.unitZ().mul_( Math.cos( ThetaH ) ).add( HalfVectorDir.mul_( Math.sin( ThetaH ) ) );	// Should already be equal to Half!

CheckHalfMaxDiscrepancy.x = Math.max( CheckHalfMaxDiscrepancy.x, Math.abs( Half_Check.x - Half.x ) );
CheckHalfMaxDiscrepancy.y = Math.max( CheckHalfMaxDiscrepancy.x, Math.abs( Half_Check.y - Half.y ) );
CheckHalfMaxDiscrepancy.z = Math.max( CheckHalfMaxDiscrepancy.x, Math.abs( Half_Check.z - Half.z ) );

var	ViewTS_Check = LightTS.mirror( Half_Check );

CheckViewMaxDiscrepancy.x = Math.max( CheckViewMaxDiscrepancy.x, Math.abs( ViewTS_Check.x - ViewTS.x ) );
CheckViewMaxDiscrepancy.y = Math.max( CheckViewMaxDiscrepancy.x, Math.abs( ViewTS_Check.y - ViewTS.y ) );
CheckViewMaxDiscrepancy.z = Math.max( CheckViewMaxDiscrepancy.x, Math.abs( ViewTS_Check.z - ViewTS.z ) );


var	ProjectedView = new vec3( ViewTS.xy(), 1e-12 ).normalized();
var	CheckAlpha = Math.acos( ProjectedView.dot( HalfVectorDir ) );   // ThetaD?



// After a mega computation with angles everywhere, I finally got a "tractable" formula for the view theta!
// var	Theta0 = ThetaH - ThetaD;	// Should be in [-ThetaV,+ThetaV]
// var	Theta = ThetaD;
// var	CosThetaV2 = CosThetaL * (Math.cos(Theta)*Math.cos(Theta) - 1) + (Math.cos(2*Theta+Theta0) - Math.cos(Theta0)) / 2;
// var	CosThetaVSum = CosThetaV + CosThetaV2;
var	ThetaL = this.renderer3DLightTheta;
var	CosGamma = (Math.cos(ThetaH) - CosThetaL*Math.cos(ThetaD)) / (SinThetaL*Math.sin(ThetaD));
var	CosThetaV2 = CosThetaL*Math.cos(2*ThetaD) + SinThetaL*Math.sin(2*ThetaD)*CosGamma;
var	CosThetaVDiff = CosThetaV - CosThetaV2;



				var	PixelX = Math.min( 89, Math.floor( 90 * Math.sqrt( ThetaH / Math.HALFPI ) ) ) | 0;
				var	PixelY = Math.min( 89, Math.floor( 90 * ThetaD / Math.HALFPI ) ) | 0;
				Pixels[4 * (90*PixelY + PixelX) + 3] += 0.0125;		// Only paint alpha...

//				Pixels[4 * (90*PixelY + PixelX) + 3] = ViewTS.z;	// Paint cos(N.V) importance
//				Pixels[4 * (90*PixelY + PixelX) + 3] = 10.0 * Math.abs( ViewTS.z - Math.cos( ThetaH ) * Math.cos( ThetaD ) );	// Paint cos(N.V) importance
//				Pixels[4 * (90*PixelY + PixelX) + 3] = Math.max( ViewTS.z );	// Paint cos(N.V) importance
// 				Pixels[4 * (90*PixelY + PixelX) + 3] = Pixels[4 * (90*PixelY + PixelX) + 3] > 0.0 ? Math.min( Pixels[4 * (90*PixelY + PixelX) + 3], ViewTS.z ) : ViewTS.z;	// Paint cos(N.V) importance
			}
		}
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

		// Normally
// 		this.__toLight.x = x * Cos + z * Sin;
// 		this.__toLight.y = y;
// 		this.__toLight.z = z * Cos - x * Sin;

		// Simplifies due to x=0
		this.__toLight.x = z * Sin;
		this.__toLight.y = y;
		this.__toLight.z = z * Cos;
	}

	//////////////////////////////////////////////////////////////////////////
	// Main computation
	, __tempS0 : 0.0
	, __tempS1 : 0.0

	, __tempAmplitudeX : 0.0
	, __tempExponentX : 0.0
	, __tempAmplitudeY : 0.0
	, __tempExponentY : 0.0

	, __tempDiffuse : 0.0
	, __tempDiffuseRoughness : 0.0

	, Prepare : function()
	{
		var	AmplitudeX = this.amplitudeX;
		var	ExponentX = this.exponentX;
		var	FallOffX = this.falloffX;
		var	AmplitudeY = this.amplitudeY;
		var	ExponentY = this.exponentY;
		var	FallOffY = this.falloffY;
		var	Diffuse = this.diffuseReflectance;
		var	DiffuseRoughness = this.diffuseRoughness;

		if ( this.useDynamicParameters )
		{	// Modify physical parameters based on dynamic parameters...

			// Glossiness 
			if ( this.dynGlossinessBias < 0.0 )
			{	// Double falloff and halve amplitude
//				FallOffX *= 1.0 - 3.0 * this.dynGlossinessBias;		// Quadruple falloff
//				AmplitudeX *= 1.0 + 0.75 * this.dynGlossinessBias;	// Quarter of amplitude

				FallOffX *= 1.0 - 7.0 * this.dynGlossinessBias;		// x8 falloff
				AmplitudeX *= Math.pow( 10.0, 2.0 * this.dynGlossinessBias );	// 1/100th of amplitude
			}
			else
			{
				FallOffX /= 1.0 + 1.0 * this.dynGlossinessBias;		// /2 falloff
				AmplitudeX *= Math.pow( 10.0, 0.5 * this.dynGlossinessBias );	// xN amplitude
				Diffuse *= 1.0 - 0.75 * this.dynGlossinessBias;		// /4 diffuse
			}

			// Roughness
			if ( this.dynRoughnessBias < 0.0 )
			{	// Double falloff and halve amplitude
				FallOffY /= 1.0 - 1.0 * this.dynRoughnessBias;		// /2 falloff
//				AmplitudeX *= Math.pow( 10.0, -0.5 * this.dynGlossinessBias );	// xN amplitude
				AmplitudeY *= Math.pow( 10.0, -1.0 * this.dynRoughnessBias );	// x10 amplitude
//				ExponentY /= 1.0 - 1.0 * this.dynRoughnessBias;	// /2 exponent
				DiffuseRoughness /= 1.0 - 3.0 * this.dynRoughnessBias;		// /4 diffuse roughness
			}
			else
			{
//				FallOffX *= 1.0 + 3.0 * this.dynRoughnessBias;		// x4 falloff
				FallOffY *= 1.0 + 1.0 * this.dynRoughnessBias;		// x2 falloff
				AmplitudeY *= Math.pow( 10.0, 0.5 * this.dynRoughnessBias );	// xN amplitude
				AmplitudeX *= Math.pow( 10.0, -2.6 * this.dynRoughnessBias );	// 1/400th of amplitude
				ExponentX /= 1.0 + 1.0 * this.dynRoughnessBias;	// /2 exponent
				ExponentY *= 1.0 + 0.5 * this.dynRoughnessBias;	// x1.5 exponent
				DiffuseRoughness *= 1.0 + 3.0 * this.dynRoughnessBias;		// x4 diffuse roughness
			}
		}

		this.__tempAmplitudeX = AmplitudeX;
		this.__tempExponentX = ExponentX;
		this.__tempAmplitudeY = AmplitudeY;
		this.__tempExponentY = ExponentY;
		this.__tempDiffuse = Diffuse;
		this.__tempDiffuseRoughness = DiffuseRoughness;

		var	Goal = 0.01;
		var	x = Math.pow( Math.max( 1e-4, FallOffX ), ExponentX );	// We must reach the goal at this position
		this.__tempS0 = Math.log( Goal / Math.max( 1e-3, AmplitudeX ) ) / x;

		var	y = Math.pow( Math.max( 1e-4, FallOffY ), ExponentY );	// We must reach the goal at this position
		this.__tempS1 = Math.log( Goal / Math.max( 1e-3, AmplitudeY ) ) / y;
	}

	, ComputeDiffuse : function( _Reflectance )
	{
		// I borrowed the diffuse term from §5.3 of http://disney-animation.s3.amazonaws.com/library/s2012_pbs_disney_brdf_notes_v2.pdf
		var	Fd90 = 0.5 + this.__tempDiffuseRoughness * this.__cosThetaD*this.__cosThetaD;
//		var	Fd90 = this.__tempDiffuseRoughness * this.__cosThetaD*this.__cosThetaD;
		var	a = 1 - this.__toLight.z;	// 1-cos(ThetaL) = 1-cos(ThetaV)
		var	Cos5 = a * a;
			Cos5 *= Cos5 * a;
		var	Diffuse = 1 + (Fd90-1)*Cos5;
			Diffuse *= Diffuse;	// Diffuse uses double Fresnel from both ThetaV and ThetaL

		var	RetroDiffuse = Math.max( 0, Diffuse-1 );	// Retro-reflection starts above 1
//		Diffuse = Math.lerp( Diffuse, 0, Math.min( 1, RetroDiffuse ) );	// Retro-reflection makes diffuse lower...

		Diffuse = Math.min( 1, Diffuse );				// Clamp diffuse to avoid double-counting retro-reflection...


		// Finally multiply by base color
		var	Fact = this.__tempDiffuse * Math.INVPI;

		_Reflectance.x = Fact * (Diffuse * this.chromaDiffuse.x + RetroDiffuse * this.chromaRetroDiffuse.x);
		_Reflectance.y = Fact * (Diffuse * this.chromaDiffuse.y + RetroDiffuse * this.chromaRetroDiffuse.y);
		_Reflectance.z = Fact * (Diffuse * this.chromaDiffuse.z + RetroDiffuse * this.chromaRetroDiffuse.z);
// 		_Reflectance.x = Fact * this.chromaDiffuse.x;
// 		_Reflectance.y = Fact * this.chromaDiffuse.y;
// 		_Reflectance.z = Fact * this.chromaDiffuse.z;
	}

	, ComputeSpecular : function( _Reflectance )
	{
//*

		var	u = this.__thetaH / Math.HALFPI;
//		var	Cx = this.offsetX + this.__tempAmplitudeX * Math.exp( this.__tempS0 * Math.pow( u, this.__tempExponentX ) );
//		var	Cx = this.diffuseReflectance + this.__tempAmplitudeX * Math.exp( this.__tempS0 * Math.pow( u, this.__tempExponentX ) );
		var	Cx = this.offsetX + this.__tempAmplitudeX * Math.exp( this.__tempS0 * Math.pow( u, this.__tempExponentX ) );	// Both exponentials now use the same OffsetX


		var	v = 1.0 - this.__thetaD / Math.HALFPI;
//		var	Cy = this.offsetY + this.amplitudeY * Math.exp( this.__tempS1 * Math.pow( v, this.exponentY ) );
//		var	Cy = this.diffuseReflectance + this.amplitudeY * Math.exp( this.__tempS1 * Math.pow( v, this.exponentY ) );
		var	Cy = this.offsetX + this.__tempAmplitudeY * Math.exp( this.__tempS1 * Math.pow( v, this.__tempExponentY ) );

		if ( this.soloX )
		{
			_Reflectance.x = Cx * this.chromaSpecular.x;
			_Reflectance.y = Cx * this.chromaSpecular.y;
			_Reflectance.z = Cx * this.chromaSpecular.z;
		}
		else if ( this.soloY )
		{
			_Reflectance.x = Cy * this.chromaFresnel.x;
			_Reflectance.y = Cy * this.chromaFresnel.y;
			_Reflectance.z = Cy * this.chromaFresnel.z;
		}
		else
		{	// Complete model
// 			_Reflectance.x = Cx * this.chromaSpecular.x * Cy * this.chromaFresnel.x;
// 			_Reflectance.y = Cx * this.chromaSpecular.y * Cy * this.chromaFresnel.y;
// 			_Reflectance.z = Cx * this.chromaSpecular.z * Cy * this.chromaFresnel.z;

// 			_Reflectance.x = (Cx * Cy - this.diffuseReflectance*this.diffuseReflectance) * this.chromaSpecular.x;
// 			_Reflectance.y = (Cx * Cy - this.diffuseReflectance*this.diffuseReflectance) * this.chromaSpecular.y;
// 			_Reflectance.z = (Cx * Cy - this.diffuseReflectance*this.diffuseReflectance) * this.chromaSpecular.z;

			_Reflectance.x = (Cx * Cy - this.offsetX*this.offsetX) * this.chromaSpecular.x;
			_Reflectance.y = (Cx * Cy - this.offsetX*this.offsetX) * this.chromaSpecular.y;
			_Reflectance.z = (Cx * Cy - this.offsetX*this.offsetX) * this.chromaSpecular.z;
		}

//		C = Cx * Cy - this.offsetX * this.offsetY;

//*/
/*		// Test with a simple Phong model
		var	N = this.amplitudeX;
		var	Fact = (N+2)*(N+4)/(8.0*Math.PI*(Math.pow( 2.0, -0.5*N ) + N));	// From http://www.farbrausch.de/~fg/stuff/phong.pdf
		var	C = Fact * Math.pow( this.__cosThetaH, N );
		_Reflectance.x = C;
		_Reflectance.y = C;
		_Reflectance.z = C;
*/
	}

// 	// Try Disney model
// 	, ComputeSpecular : function( _Reflectance )
// 	{
// 		var	BaseColor = this.amplitudeX;
// 		var	Roughness = this.offsetX;		// [0,1]
// 		var	RoughnessBoost = this.falloffX;
// 		var	RetroReflection = this.offsetY;	// [0,1]
// 		var	RetroReflectionBoost = this.falloffY;
// 
// 		// Specular is using generalized GGX
// // 		var	alpha = Roughness*Roughness;
// // 		var	NormalDistribution = this.amplitudeX / Math.pow( alpha*this.__cosThetaH*this.__cosThetaH + this.__sinThetaH*this.__sinThetaH, this.exponentX );
// // 		var	Specular = NormalDistribution;
// 
// 		// Diffuse uses double Fresnel
// 		var	Fd90 = 0.5 + RoughnessBoost * this.__cosThetaD*this.__cosThetaD * Roughness;
// 		var	a = 1 - this.__toLight.z;	// 1-cos(ThetaL) = 1-cos(ThetaV)
// 		var	Cos5 = a * a;
// 			Cos5 *= Cos5 * a;
// 		var	Diffuse = 1 + (Fd90-1)*Cos5;
// 			Diffuse *= Diffuse;	// Account for both ThetaV and ThetaL
// 
// 		// Add another fresnel for retro-reflection
// 		var	Fd90 = 0.5 + RetroReflectionBoost * Math.pow( this.__cosThetaH, this.exponentY ) * RetroReflection;
// 		var	a = 1 - this.__sinThetaD;	// 1-cos(ThetaL) = 1-cos(ThetaV)
// 		var	Cos5 = a * a;
// 			Cos5 *= Cos5 * a;
// 		var	RetroReflection = 1 + (Fd90-1)*Cos5;
// 			RetroReflection *= RetroReflection;	// Account for both ThetaV and ThetaL
// 
// 		Diffuse *= RetroReflection;
// 
// 		// Finally multiply by base color
// 		Diffuse *= BaseColor / Math.PI;
// 
// 		var	C = Diffuse;// + Specular;
// 
// 		_Reflectance.x = C;
// 		_Reflectance.y = C;
// 		_Reflectance.z = C;
// 	}

	//////////////////////////////////////////////////////////////////////////
	// Properties
	, setReferenceBRDF : function( value )
	{
		if ( value == this )
			value = null;	// Can't assign THIS or beware the infinite loop!

		if ( value == this.referenceBRDF )
			return;	// No change...

		if ( this.referenceBRDF )
			this.referenceBRDF.UnSubscribe( this );

		this.referenceBRDF = value;

		if ( this.referenceBRDF )
			this.referenceBRDF.Subscribe( this, this.OnBRDFEvent );

		this.NotifyChange();
	}
	, setDisplayType : function( value )
	{
		if ( value == this.displayType )
			return;

		this.displayType = value;
		this.NotifyChange();
	}

	// ========== Specular parameters ==========
	, setSoloX : function( value )
	{
		if ( value == this.soloX )
			return;

		this.soloX = value;
		if ( value )
		{	// Can only solo one!
			this.setSoloY( false );
			this.setSoloDiffuse( false );
		}
		this.NotifyChange();
	}
	, setExponentX : function( value )
	{
		if ( Math.almost( value, this.exponentX ) )
			return;

		this.exponentX = value;
		this.NotifyChange();
	}
	, setFalloffX : function( value )
	{
		if ( Math.almost( value, this.falloffX ) )
			return;

		this.falloffX = value;
		this.NotifyChange();
	}
	, setAmplitudeX : function( value )
	{
		if ( Math.almost( value, this.amplitudeX ) )
			return;

		this.amplitudeX = value;
		this.NotifyChange();
	}
	, setOffsetX : function( value )
	{
		if ( Math.almost( value, this.offsetX ) )
			return;

		this.offsetX = value;
		this.NotifyChange();
	}
	, setChromaSpecular : function( R, G, B )
	{
		if ( Math.almost( R, this.chromaSpecular.x ) && Math.almost( G, this.chromaSpecular.y ) && Math.almost( B, this.chromaSpecular.z ))
			return;

		this.chromaSpecular.x = R;
		this.chromaSpecular.y = G;
		this.chromaSpecular.z = B;
		this.NotifyChange();	// Needs a rebuild !
	}

	// ========== Fresnel parameters ==========
	, setSoloY : function( value )
	{
		if ( value == this.soloY )
			return;

		this.soloY = value;
		if ( value )
		{	// Can only solo one!
			this.setSoloX( false );
			this.setSoloDiffuse( false );
		}
		this.NotifyChange();
	}
	, setExponentY : function( value )
	{
		if ( Math.almost( value, this.exponentY ) )
			return;

		this.exponentY = value;
		this.NotifyChange();
	}
	, setFalloffY : function( value )
	{
		if ( Math.almost( value, this.falloffY ) )
			return;

		this.falloffY = value;
		this.NotifyChange();
	}
	, setAmplitudeY : function( value )
	{
		if ( Math.almost( value, this.amplitudeY ) )
			return;

		this.amplitudeY = value;
		this.NotifyChange();
	}
	, setOffsetY : function( value )
	{
		if ( Math.almost( value, this.offsetY ) )
			return;

		this.offsetY = value;
		this.NotifyChange();
	}
	, setChromaFresnel : function( R, G, B )
	{
		if ( Math.almost( R, this.chromaFresnel.x ) && Math.almost( G, this.chromaFresnel.y ) && Math.almost( B, this.chromaFresnel.z ))
			return;

		this.chromaFresnel.x = R;
		this.chromaFresnel.y = G;
		this.chromaFresnel.z = B;
		this.NotifyChange();	// Needs a rebuild !
	}

	// ========== Diffuse parameters ==========
	, setSoloDiffuse : function( value )
	{
		if ( value == this.soloDiffuse )
			return;

		this.soloDiffuse = value;
		if ( value )
		{	// Can only solo one!
			this.setSoloX( false );
			this.setSoloY( false );
		}
		this.NotifyChange();
	}
	, setDiffuseReflectance : function( value )
	{
		if ( Math.almost( value, this.diffuseReflectance ) )
			return;

		this.diffuseReflectance = value;
		this.NotifyChange();
	}
	, setDiffuseRoughness : function( value )
	{
		if ( Math.almost( value, this.diffuseRoughness ) )
			return;

		this.diffuseRoughness = value;
		this.NotifyChange();
	}
	, setChromaDiffuse : function( R, G, B )
	{
		if ( Math.almost( R, this.chromaDiffuse.x ) && Math.almost( G, this.chromaDiffuse.y ) && Math.almost( B, this.chromaDiffuse.z ))
			return;

		this.chromaDiffuse.x = R;
		this.chromaDiffuse.y = G;
		this.chromaDiffuse.z = B;
		this.NotifyChange();	// Needs a rebuild !
	}
	, setChromaRetroDiffuse : function( R, G, B )
	{
		if ( Math.almost( R, this.chromaRetroDiffuse.x ) && Math.almost( G, this.chromaRetroDiffuse.y ) && Math.almost( B, this.chromaRetroDiffuse.z ))
			return;

		this.chromaRetroDiffuse.x = R;
		this.chromaRetroDiffuse.y = G;
		this.chromaRetroDiffuse.z = B;
		this.NotifyChange();	// Needs a rebuild !
	}

	// ========== Dynamic parameters ==========
	, setUseDynamicParameters : function( value )
	{
		if ( value == this.useDynamicParameters )
			return;

		this.useDynamicParameters = value;
		this.NotifyChange();
	}

	// This parameter will bias the glossiness toward totally not glossy (-1) to twice more glossy (+1)
	, setDynGlossinessBias : function( value )
	{
		if ( Math.almost( value, this.dynGlossinessBias ) )
			return;

		this.setUseDynamicParameters( true );	// Authorize using dynamic parameters if we're modifying the parameter...

		this.dynGlossinessBias = value;
		this.NotifyChange();
	}

	// This parameter will bias the roughness toward totally not rough (-1) to twice more rough (+1)
	, setDynRoughnessBias : function( value )
	{
		if ( Math.almost( value, this.dynRoughnessBias ) )
			return;

		this.setUseDynamicParameters( true );	// Authorize using dynamic parameters if we're modifying the parameter...

		this.dynRoughnessBias = value;
		this.NotifyChange();
	}


	// ========== Special Informative Parameter ==========
	, setShowRenderer3DSamplingArea : function( value )
	{
		if ( value == this.showRenderer3DSamplingArea )
			return;

		this.showRenderer3DSamplingArea = value;
		this.NotifyChange();
	}

	, setRenderer3DLightTheta : function( value )
	{
		if ( Math.almost( value, this.renderer3DLightTheta ) )
			return;

		this.renderer3DLightTheta = value;
		if ( this.showRenderer3DSamplingArea )
			this.NotifyChange();	// Only render if we're actually showing it!
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
	// Event handlers
	, OnBRDFEvent : function( _BRDF, _Event )
	{
		if ( _Event.type == "destroy" )
		{	// Remove it
			this.setReferenceBRDF( null );
			return;
		}

		// Simple parameter change
		this.referenceBRDFDirty = true;
		this.NotifyChange();
	}

	, OnResize : function()
	{
		this.Render();
	}
};

patapi.helpers.Extend( BRDFPom.prototype, BRDFBase.prototype );	// Inherit from BRDFBase
