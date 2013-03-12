/*
 Contains the definition for a Pom BRDF
Try access with atlantis
*/

o3djs.provide( 'BRDF.BRDFPainter' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'BRDF.BRDFBase' );

BRDFPainter = function()
{
	BRDFBase.call( this ); // Base Ctor

	this.uniqueID = BRDFPainter.uniqueID++;
	this.name = "Painter #" + this.uniqueID;
	
	// Reference for layer
	this.referenceBRDF = null;
	
	// Brush parameter
	this.brushExponent = .5;
	this.brushChroma = vec3.one();
	this.brushSize = 1.;
	
	this.layer = new Float32Array( 90*90 * 4 );
	var Offset = 0;
	for ( var Y=0; Y < 90; Y++ )
	{
		for ( var X=0; X < 90; X++ )
		{
			this.layer[Offset++] = 1e6;
			this.layer[Offset++] = 1e6;
			this.layer[Offset++] = 0.0;
			this.layer[Offset++] = 0.0;
		}
	}
	

}

BRDFPainter.uniqueID = 0;
BRDFPainter.prototype =
{
	// Set the layer to yellow
	ClearMyLayer : function ()
	{
		var Offset = 0;
		for ( var Y=0; Y < 90; Y++ )
		{
			for ( var X=0; X < 90; X++ )
			{
				this.layer[Offset++] = 1e6;
				this.layer[Offset++] = 1e6;
				this.layer[Offset++] = 0.0;
				this.layer[Offset++] = 0.0;
			}
		}
	}
  
	, Destroy : function ()
	{
		this.DestroyTextures();
	}

	, GetHash : function()
	{
		return "Painter_" + this.name;
	}

	, Init : function( opt_LoadedCallback )
	{
		this.NotifyChange();

		if( opt_LoadedCallback )
			opt_LoadedCallback( this );
		
		// Create layer
		// this.ClearMyLayer();
	} 
	
	, UpdateTexture : function()
	{
	  	this.DestroyTextures();

		var	Pixels = this.sliceTexturePixels;
		this.minReflectance = new vec3( 1e6 );
		this.maxReflectance = new vec3( -1e6 );
		this.avgReflectance = new vec3( 0.0 );

		this.albedo = vec3.zero();
		var	dThetaH, Temp;

		var	Offset = 0, R, G, B;
		for ( var Y=0; Y < 90; Y++ )
		{
			for ( var X=0; X < 90; X++ )
			{
				
				//R = G = B = Fresnel;
				R = this.layer[Offset];
				Pixels[Offset++] = R ;
				G = this.layer[Offset];
				Pixels[Offset++] = G;
				B = this.layer[Offset];
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
				Temp = (X+0.5) / 90.0;					// We need to avoid useless X=0 values... Sample at half a step offset.
				dThetaH = Math.HALFPI * (2*X+1) / (90*90);		// Theta0 = 0²/90², Theta1 = 1²/90², ... ThetaN = N²/90² so dTheta = ((N+1)² - N²)/90² = (2N+1)/90²
				dThetaH *= Math.sin( Temp * Temp * Math.HALFPI );	// Smaller at the top of the hemisphere
				dThetaH *= Math.cos( Temp * Temp * Math.HALFPI );	// Not part of the dThetaH element but helpful factorization

				//R = G = B = 1;	// DEBUG => Albedo should equal PI

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
	}

	, DestroyTextures : function()
	{
		for ( var TextureName in this.sliceTextures )
		{
			var	Texture = this.sliceTextures[TextureName];
			Texture.gl.deleteTexture( Texture );
		}
		this.sliceTextures = {};
	}
	
	/////////////////////////////////////////////////////////////////////////
	// Model's Methods
	// x : mouse.x
	// y : mouse.y
	, draw : function(x, y)
	{ 
	  
		for ( var Y=0; Y < 90; Y++ )
		{
			for ( var X=0; X < 90; X++ )
			{
				tmp_x = X - x;
				tmp_y = Y - y;
			    
				if( Math.sqrt(tmp_x*tmp_x - tmp_y*tmp_y) < 10. )
				{
				    this.layer[4*(Y*90+X)]   = 0;
				    this.layer[4*(Y*90+X)+1] = 0;
				    this.layer[4*(Y*90+X)+2] = 1e6;
				    this.layer[4*(Y*90+X)+3] = 0;
				}
			}
		}
		
		this.NotifyChange();
	}
	

	/////////////////////////////////////////////////////////////////////////
	// Accessors
	, setBrushChroma : function( R, G, B)
	{
		if ( Math.almost( R, this.brushChroma.x ) && Math.almost( G, this.brushChroma.y ) && Math.almost( B, this.brushChroma.z ))
		return;

		this.brushChroma.x = R;
		this.brushChroma.y = G;
		this.brushChroma.z = B;
		this.NotifyChange();	// Needs a rebuild !
	}
	
	, setBrushSize : function( value )
	{
		if( value < 0. ) 
		    return ; // We have never seen a negativ size; 
		this.brushSize = ( value > 10.)? 10. : value; // clamp
		this.NotifyChange();
	}
	
	, setBrushExponent : function( value )
	{
		this.brushExponent = value;
		this.NotifyChange();
	}
	

	/////////////////////////////////////////////////////////////////////////
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

patapi.helpers.Extend( BRDFPainter.prototype, BRDFBase.prototype );	// Inherit from BRDFBase
