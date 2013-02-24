/*
 Contains the base class for BRDFs
 */

o3djs.provide( 'BRDF.BRDFBase' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );

BRDFBase = function()
{
	this.sliceTextures = {};		// A hash linking a GL context and the slice texture
	this.subscribers = [];

	this.sliceTexturePixels = new Float32Array( 90*90 * 4 );	// Our internal array of RGBA pixels (normally 90x90 x 4 floats allocated as Float32Array)

	this.minReflectance = new vec3( 1e6 );
	this.maxReflectance = new vec3( -1e6 );
	this.avgReflectance = new vec3( 0.0 );
	this.albedo = vec3.zero();

	this.exposure = 0.0;
	this.gamma = 2.2;
}

BRDFBase.prototype =
{
	Destroy : function()
	{
		// Notify of our destruction so nay reference has a chance to clean up
		this.Notify( { type: "destroy" } );

		// Destroy the textures
		for ( var TextureName in this.sliceTextures )
		{
			var	Texture = this.sliceTextures[TextureName];
			Texture.gl.deleteTexture( Texture );
		}
	}

	// PURE VIRTUAL
	// Returns a string uniquely qualifying the BRDF (other types of BRDFs also provide such a hash, it ensures we don't load the same BRDF twice in the list)
 	, GetHash : function()	{ throw "OVERRIDE!"; }

	// PURE VIRTUAL
	// Initializes the BRDF and calls the callback when done
	, Init : function( opt_LoadedCallback )	{ throw "OVERRIDE!"; }

	// Returns the ThetaH/ThetaD characteristic slice texture
	, getSliceTextureForViewport : function( _Viewport )
	{
		var	Texture = this.sliceTextures[_Viewport.name];
		if ( Texture )
			return Texture;	// Already exists!

		var	gl = _Viewport.gl;

		// Restore context first (in theory, it SHOULD already be restored by the caller)
		patapi.webgl.RestoreRenderingContext( gl.renderContext );

		// Create a new texture for that context
		Texture = patapi.webgl.CreateTextureFromArray( "Slice", this.sliceTexturePixels, 90, 90, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.LINEAR, true );
		Texture.gl = gl;	// Associate context for easy deletion

		this.sliceTextures[_Viewport.name] = Texture;	// Now exists for that context!

		return Texture;
	}

	// Bilinearly samples the BRDF
	//	_ThetaH/D € [0,89]
	// Returns a vec4 (because we sometimes need the alpha value for additional infos)
	//
	, sample : function( _ThetaH, _ThetaD )
	{
		var	X0 = Math.floor( _ThetaH );
		var	x = _ThetaH - X0;
			X0 = Math.clamp( X0, 0, 89 );
		var	X1 = Math.clamp( X0+1, 0, 89 );

		var	Y0 = Math.floor( _ThetaD );
		var	y = _ThetaD - Y0;
			Y0 = Math.clamp( Y0, 0, 89 );
		var	Y1 = Math.clamp( Y0+1, 0, 89 );

		var	V00 = new vec4( this.sliceTexturePixels[4*(90*Y0+X0)+0], this.sliceTexturePixels[4*(90*Y0+X0)+1], this.sliceTexturePixels[4*(90*Y0+X0)+2], this.sliceTexturePixels[4*(90*Y0+X0)+3] );
		var	V01 = new vec4( this.sliceTexturePixels[4*(90*Y0+X1)+0], this.sliceTexturePixels[4*(90*Y0+X1)+1], this.sliceTexturePixels[4*(90*Y0+X1)+2], this.sliceTexturePixels[4*(90*Y0+X1)+3] );
		var	V10 = new vec4( this.sliceTexturePixels[4*(90*Y1+X0)+0], this.sliceTexturePixels[4*(90*Y1+X0)+1], this.sliceTexturePixels[4*(90*Y1+X0)+2], this.sliceTexturePixels[4*(90*Y1+X0)+3] );
		var	V11 = new vec4( this.sliceTexturePixels[4*(90*Y1+X1)+0], this.sliceTexturePixels[4*(90*Y1+X1)+1], this.sliceTexturePixels[4*(90*Y1+X1)+2], this.sliceTexturePixels[4*(90*Y1+X1)+3] );

		var	V0 = V00.mul( 1.0-x ).add( V01.mul( x ) );
		var	V1 = V10.mul( 1.0-x ).add( V11.mul( x ) );
		var	V = V0.mul( 1.0-y ).add( V1.mul( y ) );
		return V;
	}

	//////////////////////////////////////////////////////////////////////////
	// Change parameters
	, setExposure : function( value )
	{
		this.exposure = value;
		this.NotifyChange();
	}
	, setGamma : function( value )
	{
		this.gamma = value;
		this.NotifyChange();
	}

	//////////////////////////////////////////////////////////////////////////
	// Notification system
	, Subscribe : function( _This, _Callback )
	{
		this.subscribers.push( { This : _This, Callback : _Callback } );
	}

	, UnSubscribe : function( _Callback )
	{
		for ( var Key in this.subscribers )
		{
			var	Value = this.subscribers[Key];
			if ( Value.This == _Callback )
			{	// Remove that subscriber
				this.subscribers.splice( Key, 1 );
				return;
			}
		}
	}

	// Notifies the BRDF changed so subscribers have a chance to redraw their appearance
	, NotifyChange : function()	{ this.Notify( { type: "parametersChanged" } ); }

	, Notify : function( _Event )
	{
		var	TempSubscribers = patapi.helpers.Copy( this.subscribers );
		for ( var SubscriberIndex=0; SubscriberIndex < TempSubscribers.length; SubscriberIndex++ )
		{
			var	Value = TempSubscribers[SubscriberIndex];
			Value.Callback.call( Value.This, this, _Event );
		}
	}
};
