/*
 Hosts the display of properties for slice BRDFs
 */

o3djs.provide( 'BRDF.BRDFPropertiesSlice' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'patapi.ui' );
o3djs.require( 'BRDF.BRDFSlice' );

BRDFPropertiesSlice = function()
{
	BRDFPropertiesBase.call( this, '#BRDFProperties_Slices', '#PropSlice_Viewport' );	// Call base constructor

	//////////////////////////////////////////////////////////////////////////
	// Create our UI elements
	this.CreateStandardPropertiesWidgets( 'Slice', '#PropSliceUI_StandardWidgets' );

	// Simulate resize, which should also trigger a render
	this.OnResize();
}

BRDFPropertiesSlice.prototype =
{
	SupportsBRDF__ : function( _BRDF )	{ return _BRDF instanceof BRDFSlice; }

	, UpdateUI__ : function()
	{
		this.UISliderExposure.set( this.BRDF.exposure );
		this.UISliderGamma.set( this.BRDF.gamma );
		this.UICheckBoxShowDiffuseSamplingArea.set( this.BRDF.showDiffuseSamplingArea );
		this.UISliderSamplingStart.set( this.BRDF.diffuseSamplingStart );
	}
};

patapi.helpers.Extend( BRDFPropertiesSlice.prototype, BRDFPropertiesBase.prototype );	// Inherit from BRDFPropertiesBase
