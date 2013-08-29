/*
 Hosts the display of properties for slice BRDFs
 */

o3djs.provide( 'BRDF.BRDFPropertiesEigen' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'patapi.ui' );
o3djs.require( 'BRDF.BRDFEigen' );

BRDFPropertiesEigen = function()
{
	BRDFPropertiesBase.call( this, '#BRDFProperties_Eigens', '#PropEigen_Viewport' );	// Call base constructor

	//////////////////////////////////////////////////////////////////////////
	// Create our UI elements
	this.CreateStandardPropertiesWidgets( 'Eigen', '#PropEigenUI_StandardWidgets' );

	// Simulate resize, which should also trigger a render
	this.OnResize();
}

BRDFPropertiesEigen.prototype =
{
	SupportsBRDF__ : function( _BRDF )	{ return _BRDF instanceof BRDFEigen; }

	, UpdateUI__ : function()
	{
		this.UISliderExposure.set( this.BRDF.exposure );
		this.UISliderGamma.set( this.BRDF.gamma );
	}
};

patapi.helpers.Extend( BRDFPropertiesEigen.prototype, BRDFPropertiesBase.prototype );	// Inherit from BRDFPropertiesBase
    