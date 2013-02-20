/*
 Hosts the display of properties for POM BRDFs
 */

o3djs.provide( 'BRDF.BRDFPropertiesPainter' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'patapi.ui' );
o3djs.require( 'BRDF.BRDFPainter' );

BRDFPropertiesPainter = function()
{
	BRDFPropertiesBase.call( this, '#BRDFProperties_Painter', '#PropPainter_Viewport' );	// Call base constructor
	this.BRDFList = null;

	//////////////////////////////////////////////////////////////////////////
	// Create our UI elements
	var that = this;
	{
		//////////////////////////////////////////////////////////////////////////
		// Standard widgets
		this.CreateStandardPropertiesWidgets( 'Painter', '#PropPainterUI_StandardWidgets' );
					
		// Create tabs manually since jquery fucks the background!
		this.tabIndex = 0;
		new patapi.ui.LabelRadioButtons( {
			selector : '#PropPainterUI_Radio_Tabs',
			value : 0,
			change : function( value )
			{
				that.tabIndex = value;
				$('#Tab_PainterBrushes').css( 'display', value == 0 ? 'inherit' : 'none' );
				$('#Tab_PainterLayers').css( 'display', value == 1 ? 'inherit' : 'none' );
				$('#Tab_PainterStandard').css( 'display', value == 2 ? 'inherit' : 'none' );
			}
		} );
	}
}

BRDFPropertiesPainter.prototype =
{
	SupportsBRDF__ : function( _BRDF )	{ return _BRDF instanceof BRDFPainter; }

	, UpdateUI__ : function()
	{
		this.UISliderExposure.set( this.BRDF.exposure );
		this.UISliderGamma.set( this.BRDF.gamma );
	}

	, OnBRDFEvent : function( _BRDF, _Event )
	{
		BRDFPropertiesBase.prototype.OnBRDFEvent.call( this, _BRDF, _Event );
	}

	, OnBRDFListEvent : function( _List, _Event )
	{
		BRDFPropertiesBase.prototype.OnBRDFListEvent.call( this, _List, _Event );
	}


};

patapi.helpers.Extend( BRDFPropertiesPainter.prototype, BRDFPropertiesBase.prototype );	// Inherit from BRDFPropertiesBase