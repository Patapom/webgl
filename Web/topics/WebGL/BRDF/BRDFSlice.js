/*
 Contains the definition for a BRDF coming from a MERL slice
 */

o3djs.provide( 'BRDF.BRDFSlice' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'BRDF.BRDFBase' );

BRDFSlice = function( _SliceName )
{
	BRDFBase.call( this );	// Call base constructor

	this.name = _SliceName;
}

BRDFSlice.prototype =
{
	// Returns a string uniquely qualifying the BRDF (other types of BRDFs also provide such a hash, it ensures we don't load the same BRDF twice in the list)
	GetHash : function()
	{
		return "Slice_" + this.name;
	}

	// Loads the BRDF slice from disk
	, Init : function( opt_LoadedCallback )
	{
		var	that = this;

		// Load the array of floats
		patapi.helpers.LoadTypedArray( "./Slices/" + this.name + ".slice", function( _URL, _ArrayBuffer )
		{
			// We know the buffer contains 90x90 float RGB samples that we need to transform into RGBA
			that.albedo = vec3.zero();
			var	dThetaH, Temp;

			var	R, G, B;
			var	View = new DataView( _ArrayBuffer );
			that.sliceTexturePixels = new Float32Array( 90 * 90 * 4 );
			for ( var Y=0; Y < 90; Y++ )
				for ( var X=0; X < 90; X++ )
				{
					R = View.getFloat32( 4*(3*(90*Y+X)+0), true );
					G = View.getFloat32( 4*(3*(90*Y+X)+1), true );
					B = View.getFloat32( 4*(3*(90*Y+X)+2), true );

					that.sliceTexturePixels[4*(90*Y+X)+0] = R;
					that.sliceTexturePixels[4*(90*Y+X)+1] = G;
					that.sliceTexturePixels[4*(90*Y+X)+2] = B;
					that.sliceTexturePixels[4*(90*Y+X)+3] = 0.0;

					// Update stats
					that.minReflectance.x = Math.min( that.minReflectance.x, R );
					that.maxReflectance.x = Math.max( that.maxReflectance.x, R );
					that.avgReflectance.x += R;
					that.minReflectance.y = Math.min( that.minReflectance.y, G );
					that.maxReflectance.y = Math.max( that.maxReflectance.y, G );
					that.avgReflectance.y += G;
					that.minReflectance.z = Math.min( that.minReflectance.z, B );
					that.maxReflectance.z = Math.max( that.maxReflectance.z, B );
					that.avgReflectance.z += B;

					// Update albedo integral
					Temp = (X+0.5) / 90.0;								// We need to avoid useless X=0 values... Sample at half a step offset.
					dThetaH = Math.HALFPI * (2*X+1) / (90*90);			// Theta0 = 0²/90², Theta1 = 1²/90², ... ThetaN = N²/90² so dTheta = ((N+1)² - N²)/90² = (2N+1)/90²
					dThetaH *= Math.sin( Temp * Temp * Math.HALFPI );	// Smaller at the top of the hemisphere
					dThetaH *= Math.cos( Temp * Temp * Math.HALFPI );	// Not part of the dThetaH element but helpful factorization

//R = G = B = 1;	// DEBUG => Albedo should equal PI

					that.albedo.x += dThetaH * R;
					that.albedo.y += dThetaH * G;
					that.albedo.z += dThetaH * B;
				}

			// Finalize values
			var	dThetaD = Math.HALFPI / 90;	// Uniform pieces
				dThetaD *= 4.0;				// Not part of the dThetaD element but helpful factorization (remember we integrated only on a quarter of a sphere)
			that.albedo.x *= dThetaD;		// Should yield PI if reflectances were all 1
			that.albedo.y *= dThetaD;
			that.albedo.z *= dThetaD;

			that.avgReflectance.mul( 1.0 / (90*90) );

			// Notify!
			if ( opt_LoadedCallback )
				opt_LoadedCallback( that );
		} );
	}
};

patapi.helpers.Extend( BRDFSlice.prototype, BRDFBase.prototype );	// Inherit from BRDFBase
