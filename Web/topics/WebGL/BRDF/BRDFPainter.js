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
	
	// 
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
