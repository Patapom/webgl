/*
 Contains the definition for a Pom BRDF
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

}

BRDFPainter.uniqueID = 0;
BRDFPainter.prototype =
{
	Destroy : function ()
	{
		this.DestroyTexures();
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

		var	that = this;

		for ( var Y=0; Y < 90; Y++ )
			for ( var X=0; X < 90; X++ )	
			{
					that.sliceTexturePixels[4*(90*Y+X)+0] = Y/90 * 255;
					that.sliceTexturePixels[4*(90*Y+X)+1] = X/90 * 255;
					that.sliceTexturePixels[4*(90*Y+X)+2] = 0.;
					that.sliceTexturePixels[4*(90*Y+X)+3] = 0.0;

						// Update stats
					that.minReflectance.x = 0;
					that.maxReflectance.x = 255;
					that.avgReflectance.x = 128;
					that.minReflectance.y = 0;
					that.maxReflectance.y = 255;
					that.avgReflectance.y = 128;
					that.minReflectance.z = 0;
					that.maxReflectance.z = 0;
					that.avgReflectance.z = 1;
			}
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

	, UpdateTexture : function()
	{

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

patapi.helpers.Extend( BRDFPainter.prototype, BRDFBase.prototype );	// Inherit from BRDFBase
