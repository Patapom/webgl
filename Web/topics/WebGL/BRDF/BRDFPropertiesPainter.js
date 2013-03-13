/*
 Hosts the display of properties for Painter BRDFs
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
		

		
		
		// Brush 
		
		this.UISlider_BrushExponent = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPainterUI_Slider_Exponent .t0 span",
			selector : "#PropPainterUI_Slider_Exponent .t1",
			sliderParams : { min: 0.0, max : 4.0, value: 0.0 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setBrushExponent( value );

				return _OriginalText + " (" + value.toFixed( 4 ) + ")";	// Update text
			}
		 } );
		
		
		this.UIColorPicker_Brush = $('#PropPainterUI_BrushColor');
		this.UIColorPicker_Brush.ColorPicker( {
			color: '#ffffff',
			onShow: function( colpkr ) {
				$(colpkr).fadeIn(100);
				return false;
			},
			onHide: function( colpkr ) {
				$(colpkr).fadeOut(250);
				return false;
			},
			onChange: function( hsb, hex, rgb ) {
				
				if ( that.BRDF )
				{
					var	Color = that.ColorTovec3( rgb );
					that.BRDF.setBrushChroma( Color.x, Color.y, Color.z );
				}

				$('#PropPainterUI_ColorPicker_Brush').css( 'backgroundColor', '#' + hex );
			}
		});
		
		$('#PropPainterUI_Button_Brush').button().click( function() {
			that.pickingColor = true;
			that.pickColorType = 0;
		} );
		
		this.UISlider_BrushSize = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPainterUI_Slider_Size .t0 span",
			selector : "#PropPainterUI_Slider_Size .t1",
			sliderParams : { min: 0.0, max : 10.0, value: 0.0 },
			step : 0.5,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setBrushSize( value );

				return _OriginalText + " (" + value.toFixed( 4 ) + ")";	// Update text
			}
		 } );
		
		
		$('#PropPainterUI_Button_Brush').button().click( function() {
			that.pickingColor = true;
			that.pickColorType = 0;
		} );	
	}
	
	this.b_draw = false;
	
	// Create events to manage dropping & dragging of the marker
	this.canvas.mousedown( function( e ) {
		that.b_draw = true;
	} );
	this.canvas.mouseup( function( e ) {
		that.b_draw = false;
	} );
	this.canvas.mousemove( function( e ) {
		that.draw();
	} );
	
	
	// Simulate resize, which should also trigger a render
	this.OnResize();
}

BRDFPropertiesPainter.prototype =
{
	SupportsBRDF__ : function( _BRDF )	{ return _BRDF instanceof BRDFPainter; }

	// Tools : Maybe factorization is a good idea
	, vec3ToColor : function( v )
	{
		return { r : (255 * v.x) | 0, g : (255 * v.y) | 0, b : (255 * v.z) | 0 };
	}
	, ColorTovec3 : function( rgb )
	{
		return new vec3( rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0 );
	}


	, UpdateUI__ : function()
	{
		// Brush
		this.UISliderExposure.set( this.BRDF.exposure );
		var Color = this.vec3ToColor( this.BRDF.brushChroma );
		this.UIColorPicker_Brush.ColorPickerSetColor( Color );
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
	
	, draw : function()
	{
		if(this.b_draw)
		{
		  this.BRDF.draw( this.hoveredSliceX, this.hoveredSliceY );
		  this.OnResize();
		}
	}

};

patapi.helpers.Extend( BRDFPropertiesPainter.prototype, BRDFPropertiesBase.prototype );	// Inherit from BRDFPropertiesBase