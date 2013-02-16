/*
 Hosts the display of properties for POM BRDFs
 */

o3djs.provide( 'BRDF.BRDFPropertiesPom' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'patapi.ui' );
o3djs.require( 'BRDF.BRDFPom' );
o3djs.require( 'BRDF.FittingBFGS' );
o3djs.require( 'BRDF.FittingLM' );

BRDFPropertiesPom = function()
{
	BRDFPropertiesBase.call( this, '#BRDFProperties_Pom', '#PropPom_Viewport' );	// Call base constructor

	// No list at the moment, provided manually from the main page
	this.BRDFList = null;


this.showIsolines = true;


	//////////////////////////////////////////////////////////////////////////
	// Fitting Presets
	this.fittingPresets = {

		// X Exp Fall Amp Off
		// Y Exp Fall Amp Off
		// Diff Rough

		// Measured from beige fabric
		fabric : /*[	0.19, 1.0, 0.001, 0,
					1.081, 0.85, 1.0471285480508996, 0,
					0.26, 1.42 ],*/
[5.11,0.651,0.02754228703338166,0,0.941,1,21.87761623949553,0,0.27,1.62],

		// Measured from aluminium
		metal : /*[	0.51, 0.251, 490.0, 0,
					0.721, 1, 3.1622776601683795, 0,
					0.01, 0.3 ],*/
[0.47,0.281,1047.1285480508996,0.01,0.561,0.9999997247431525,3.2359365692962827,0,0.01,0.33],

		// Measured from blue acrylic
		acrylic : /*[	0.32, 0.171, 1318.2567385564075, 0,
					1.331, 0.52, 0.72443596007499, 0,
					0.07, 0.52 ],*/
[0.42,0.151,1513.5612484362086,0.02,1.531,0.44,1.62181009735893,0,0.11,0.03],

		// Measured from blue metalic paint
		matte_metallic_paint :/* [	0.56, 0.331, 1318.2567385564075, 0,
								1.451, 0.35, 0.831763771102671, 0,
								0.02, 0 ],*/
[0.94,0.711,5.011872336272722,0.05,1.111,0.7,1.1220184543019633,0,0,1.28],

		// Measured from blue metalic paint 2
		specular_metallic_paint :/* [	1.37, 0.531, 5.248074602497725, 0,
							0.461, 1.0, 4.677351412871983, 0,
							0.05,0 ],*/
[0.49,0.401,1479.1083881682073,0.01,0.681,0.62,3.890451449942806,0,0.03,0],

		// Measured from pearl paint
		paint : /*[	0.86, 1.00, 4.168693834703354, 0,
					0.801, 0.61, 2.290867652767773, 0,
					0.08, 2.28 ],*/
[0.85,1.001,10.232929922807541,0.03,0.741,0.53,2.2387211385683394,0,0.17,1.08],

		// Measured from gray plastic
		plastic : /*[	0.38, 0.261, 177.82794100389228, 0,
					1.781, 0.54, 0.7762471166286917, 0,
					0.06, 0.9 ],*/
[0.44,0.261,407.3802778041126,0.01,1.291,0.51,2.1877616239495525,0,0.11,0.32],

		// Measured from red specular plastic
		specular_plastic : /*[	0.33, 0.191, 630.957344480193, 0,
								0.471, 0.92, 7.079457843841379, 0,
								0.1, 0.79 ],*/
[0.44,0.161,1000,0.01,0.721,0.54,20.892961308540396,0,0.23,0.08],

		// Measured from yellow matte plastic
		matte_plastic : /*[	0.35, 0.841, 43.65158322401658, 0,
							0.651, 0.64, 10, 0,
							0.08, 1.67 ],*/
[0.56,0.251,87.09635899560806,0.01,0.781,0.52,49.99999999999999,0,0.31,0.1],

		// Measured from blue rubber
		rubber : /*[	1.18, 0.791, 1.7378008287493754, 0,
					0.841, 0.52, 7.943282347242816, 0,
					0.05, 2.71 ],*/
[0.95,0.541,2.6302679918953817,0.01,0.891,0.48,15.13561248436208,0,0.16,0.79],

		// Measured from cherry
		wood : /*[	0.88, 0.471, 3.2359365692962827, 0,
					1.051, 0.53, 5.7543993733715695, 0,
					0.03, 1.69 ],*/
[0.87,0.471,3.9810717055349722,0.02,1.041,0.52,6.309573444801933,0,0.04,1.3],

		// Measured from green latex
		latex : /*[	2.1, 1.0, 0.5888436553555889, 0,
					0.861, 0.54, 1.4125375446227544, 0,
					0.06, 1.92 ],*/
[1.79,1.001,0.6918309709189365,0.03,0.851,0.53,1.5135612484362082,0,0.09,1.25],

		// Measured from red phenolic
		phenolic : /*[	0.28, 0.421, 676.0829753919819, 0,
						0.791, 0.77, 4.265795188015927, 0,
						0.08, 0.87 ],*/
[0.35,0.321,1230.268770812381,0.01,0.941,0.5,7.413102413009175,0,0.15,0.02],

		// Measured from white marble
		marble : /*[	0.36, 0.261, 389.04514499428046, 0,
					1.291, 0.59, 1.202264434617413, 0,
					0.12, 0.74 ],*/
[0.49,0.191,812.8305161640995,0.01,1.031,0.52,4.36515832240166,0,0.23,0.14],
	};


	//////////////////////////////////////////////////////////////////////////
	// Create our UI elements
	var that = this;
	{
		//////////////////////////////////////////////////////////////////////////
		// Standard widgets
		this.CreateStandardPropertiesWidgets( 'Pom', '#PropPomUI_StandardWidgets' );

		// Create tabs manually since jquery fucks my background!
		this.tabIndex = 0;
		new patapi.ui.LabelRadioButtons( {
			selector : '#PropPomUI_Radio_Tabs',
			value : 0,
			change : function( value )
			{
				that.tabIndex = value;
				$('#Tab_PomSpecular').css( 'display', value == 0 ? 'inherit' : 'none' );
				$('#Tab_PomColors').css( 'display', value == 1 ? 'inherit' : 'none' );
				$('#Tab_PomFitting').css( 'display', value == 2 ? 'inherit' : 'none' );
				$('#Tab_PomStandard').css( 'display', value == 3 ? 'inherit' : 'none' );
			}
		} );


		//////////////////////////////////////////////////////////////////////////
		// Reference BRDF
		this.UIComboBox_ReferenceBRDF = new patapi.ui.LabelComboBox( {
			labelSelector : "#PropPomUI_ComboBox_ReferenceBRDF .t0 span",
			selector : "#PropPomUI_ComboBox_ReferenceBRDF .t1 select",
		} );
		this.BRDF_UIs = [];
		this.BRDF2UI = {};

		this.UIRadio_ShowReferenceBRDF = new patapi.ui.LabelRadioButtons( {
			selector : '#PropPomUI_Radio_Display',
			value : 0,
			change : function( value )
			{
				if ( that.BRDF )
					that.BRDF.setDisplayType( value );
			}
		} );


		//////////////////////////////////////////////////////////////////////////
		// Specular widgets
		this.UICheckBox_SoloX = new patapi.ui.LabelCheckBox( {
			selector : "#PropPomUI_CheckBox_SoloX span",
			change : function( value )
			{
				if ( !that.BRDF )
					return;

				that.BRDF.setSoloX( value );
				if ( !that.BRDF.soloY )
					that.UICheckBox_SoloY.set( that.BRDF.soloY );	// May have been toggled off
				if ( !that.BRDF.soloDiffuse )
					that.UICheckBox_SoloDiffuse.set( that.BRDF.soloDiffuse );	// May have been toggled off
			}
		} );		

		this.UISliderAmplitudeX = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_AmplitudeX .t0 span",
			selector : "#PropPomUI_Slider_AmplitudeX .t1",
			sliderParams : { min: -3.0, max : 4.0, value: 0.0 },
			change : function( value, _OriginalText )
			{
				value = Math.pow( 10.0, value );
				if ( that.BRDF )
					that.BRDF.setAmplitudeX( value );

				return _OriginalText + " (" + value.toFixed( 2 ) + ")";	// Update text
			}
		 } );

		this.UISliderExponentX = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_ExponentX .t0 span",
			selector : "#PropPomUI_Slider_ExponentX .t1",
			sliderParams : { min: 0.0, max : 8.0, value: 1.0 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setExponentX( value );

				return _OriginalText + " (" + value.toFixed( 3 ) + ")";	// Update text
			}
		 } );

		this.UISliderFalloffX = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_FalloffX .t0 span",
			selector : "#PropPomUI_Slider_FalloffX .t1",
			sliderParams : { min: 1e-3, max : 10.0, value: 0.1 },
			step : 0.0001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setFalloffX( value );

				return _OriginalText + " (" + value.toFixed( 4 ) + ")";	// Update text
			}
		 } );

		this.UISliderOffsetX = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_OffsetX .t0 span",
			selector : "#PropPomUI_Slider_OffsetX .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.0 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setOffsetX( value );

				return _OriginalText + " (" + value.toFixed( 3 ) + ")";	// Update text
			}
		 } );


		// ===========================================
		this.UICheckBox_SoloY = new patapi.ui.LabelCheckBox( {
			selector : "#PropPomUI_CheckBox_SoloY span",
			change : function( value )
			{
				if ( !that.BRDF )
					return;

				that.BRDF.setSoloY( value );
				if ( !that.BRDF.soloX )
					that.UICheckBox_SoloX.set( that.BRDF.soloX );	// May have been toggled off
				if ( !that.BRDF.soloDiffuse )
					that.UICheckBox_SoloDiffuse.set( that.BRDF.soloDiffuse );	// May have been toggled off
			}
		} );		

		this.UISliderAmplitudeY = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_AmplitudeY .t0 span",
			selector : "#PropPomUI_Slider_AmplitudeY .t1",
			sliderParams : { min: -3.0, max : 1.6989700043360188047862611052755, value: 0.1 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				value = Math.pow( 10.0, value );
				if ( that.BRDF )
					that.BRDF.setAmplitudeY( value );

				return _OriginalText + " (" + value.toFixed( 3 ) + ")";	// Update text
			}
		 } );

		this.UISliderExponentY = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_ExponentY .t0 span",
			selector : "#PropPomUI_Slider_ExponentY .t1",
			sliderParams : { min: 1e-3, max : 8.0, value: 1.0 },
			step : 0.0001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setExponentY( value );

				return _OriginalText + " (" + value.toFixed( 3 ) + ")";	// Update text
			}
		 } );

		this.UISliderFalloffY = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_FalloffY .t0 span",
			selector : "#PropPomUI_Slider_FalloffY .t1",
			sliderParams : { min: 0.0, max : 10.0, value: 0.0 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setFalloffY( value );

				return _OriginalText + " (" + value.toFixed( 4 ) + ")";	// Update text
			}
		 } );

		this.UISliderOffsetY = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_OffsetY .t0 span",
			selector : "#PropPomUI_Slider_OffsetY .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.0 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setOffsetY( value );

				return _OriginalText + " (" + value.toFixed( 3 ) + ")";	// Update text
			}
		 } );


		// ===========================================
		this.UICheckBox_SoloDiffuse = new patapi.ui.LabelCheckBox( {
			selector : "#PropPomUI_CheckBox_SoloDiffuse span",
			change : function( value )
			{
				if ( !that.BRDF )
					return;

				that.BRDF.setSoloDiffuse( value );
				if ( !that.BRDF.soloX )
					that.UICheckBox_SoloX.set( that.BRDF.soloX );	// May have been toggled off
				if ( !that.BRDF.soloY )
					that.UICheckBox_SoloY.set( that.BRDF.soloY );	// May have been toggled off
			}
		} );		

		this.UISliderDiffuseReflectance = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_DiffuseReflectance .t0 span",
			selector : "#PropPomUI_Slider_DiffuseReflectance .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.01 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setDiffuseReflectance( value );

				return _OriginalText + " (" + value.toFixed( 4 ) + ")";	// Update text
			}
		 } );

		this.UISliderDiffuseRoughness = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_DiffuseRoughness .t0 span",
			selector : "#PropPomUI_Slider_DiffuseRoughness .t1",
			sliderParams : { min: 0.0, max : 4.0, value: 0.0 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setDiffuseRoughness( value );

				return _OriginalText + " (" + value.toFixed( 4 ) + ")";	// Update text
			}
		 } );


		$('#PropPomUI_Button_CopyToClipboard').button().click( function() {

			var	Parameters = [
				// Specular parameters
				that.BRDF.exponentX,
				that.BRDF.falloffX,
				that.BRDF.amplitudeX,
				that.BRDF.offsetX,

				that.BRDF.exponentY,
				that.BRDF.falloffY,
				that.BRDF.amplitudeY,
				that.BRDF.offsetY,

				// Diffuse parameters
				that.BRDF.diffuseReflectance,
				that.BRDF.diffuseRoughness,
			];
//			var	Text = JSON.stringify( Parameters, null, '\t' );
			var	Text = JSON.stringify( Parameters );	// Single line only :(

			window.prompt ("Copy to clipboard: Ctrl+C, Enter", Text );
		} );


		//////////////////////////////////////////////////////////////////////////
		// Color Picking widgets
		this.pickingColor = false;
		this.pickColorType = -1;
		this.canvas.mousedown( function( e ) {
			if ( !that.pickingColor )
				return true;	// Don't intercept
			
			// Intercept button down and pick color at position
			var	Reflectance = that.BRDF.sample( that.hoveredThetaH, that.hoveredThetaD );

			// We need chroma = RGB/max(max(R,G),B)
			var	Chroma = Reflectance.div_( Reflectance.max() );

			switch ( that.pickColorType )
			{
			case 0: that.BRDF.setChromaSpecular( Chroma.x, Chroma.y, Chroma.z ); break;
			case 1: that.BRDF.setChromaFresnel( Chroma.x, Chroma.y, Chroma.z ); break;
			case 2: that.BRDF.setChromaDiffuse( Chroma.x, Chroma.y, Chroma.z ); break;
			case 3: that.BRDF.setChromaRetroDiffuse( Chroma.x, Chroma.y, Chroma.z ); break;
			}

			that.UpdateUI__();

			return false;
		} );


		this.UIColorPicker_Specular = $('#PropPomUI_ColorPicker_Specular');
		this.UIColorPicker_Specular.ColorPicker( {
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
					that.BRDF.setChromaSpecular( Color.x, Color.y, Color.z );
				}

				$('#PropPomUI_ColorPicker_Specular').css( 'backgroundColor', '#' + hex );
			}
		});
		
		$('#PropPomUI_Button_PickSpecular').button().click( function() {
			that.pickingColor = true;
			that.pickColorType = 0;
		} );

		this.UIColorPicker_Fresnel = $('#PropPomUI_ColorPicker_Fresnel');
		this.UIColorPicker_Fresnel.ColorPicker( {
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
					that.BRDF.setChromaFresnel( Color.x, Color.y, Color.z );
				}

				$('#PropPomUI_ColorPicker_Fresnel').css( 'backgroundColor', '#' + hex );
			}
		});
		
		$('#PropPomUI_Button_PickFresnel').button().click( function() {
			that.pickingColor = true;
			that.pickColorType = 1;
		} );

		this.UIColorPicker_Diffuse = $('#PropPomUI_ColorPicker_Diffuse');
		this.UIColorPicker_Diffuse.ColorPicker( {
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
					that.BRDF.setChromaDiffuse( Color.x, Color.y, Color.z );
				}

				$('#PropPomUI_ColorPicker_Diffuse').css( 'backgroundColor', '#' + hex );
			}
		});
		
		$('#PropPomUI_Button_PickDiffuse').button().click( function() {
			that.pickingColor = true;
			that.pickColorType = 2;
		} );

		this.UIColorPicker_RetroDiffuse = $('#PropPomUI_ColorPicker_RetroDiffuse');
		this.UIColorPicker_RetroDiffuse.ColorPicker( {
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
					that.BRDF.setChromaRetroDiffuse( Color.x, Color.y, Color.z );
				}

				$('#PropPomUI_ColorPicker_RetroDiffuse').css( 'backgroundColor', '#' + hex );
			}
		});
		
		$('#PropPomUI_Button_PickRetroDiffuse').button().click( function() {
			that.pickingColor = true;
			that.pickColorType = 3;
		} );


		//////////////////////////////////////////////////////////////////////////
		// Fitting widgets

		// Presets
		function ClickPreset( i )
		{
			var	PresetParams = null;
			switch ( i )
			{
			case 0: PresetParams = that.fittingPresets['plastic']; break;
			case 1: PresetParams = that.fittingPresets['specular_plastic']; break;
			case 2: PresetParams = that.fittingPresets['matte_plastic']; break;
			case 3: PresetParams = that.fittingPresets['paint']; break;
			case 4: PresetParams = that.fittingPresets['specular_metallic_paint']; break;
			case 5: PresetParams = that.fittingPresets['matte_metallic_paint']; break;
			case 6: PresetParams = that.fittingPresets['phenolic']; break;

			case 7: PresetParams = that.fittingPresets['metal']; break;
			case 8: PresetParams = that.fittingPresets['fabric']; break;
			case 9: PresetParams = that.fittingPresets['latex']; break;
			case 10: PresetParams = that.fittingPresets['rubber']; break;
			case 11: PresetParams = that.fittingPresets['acrylic']; break;
			case 12: PresetParams = that.fittingPresets['wood']; break;
			case 13: PresetParams = that.fittingPresets['marble']; break;
			}
			if ( !PresetParams )
				throw "Unrecognized preset!";

			return function() {
				// Update specular parameters
				that.BRDF.exponentX = PresetParams[0];
				that.BRDF.falloffX = PresetParams[1];
				that.BRDF.amplitudeX = PresetParams[2];
				that.BRDF.offsetX = PresetParams[3];

				that.BRDF.exponentY = PresetParams[4];
				that.BRDF.falloffY = PresetParams[5];
				that.BRDF.amplitudeY = PresetParams[6];
				that.BRDF.offsetY = PresetParams[7];

				// Update diffuse parameters
				that.BRDF.diffuseReflectance = PresetParams[8];
				that.BRDF.diffuseRoughness = PresetParams[9];

				that.BRDF.NotifyChange.call( that.BRDF );	// So the BRDF gets updated...
			}
		}
		for ( var i=0; i < 14; i++ )
		{
			var	ButtonPreset = $('#PropPomUI_Presets > div:nth-child(' + (i+1) + ')');
			ButtonPreset.click( ClickPreset( i ) )
		}

		// Fitting method
		this.fittingMethod = 0;	// BFGS
		new patapi.ui.LabelRadioButtons( {
			selector : '#PropPomUI_Radio_FittingMethod',
			value : this.fittingMethod,
			change : function( value )
			{
				that.fittingMethod = value;
			}
		} );


		this.UIButton_Fit = $('#PropPomUI_Button_Fitting');
		this.UIButton_Fit.button().click( function() {
			that.PerformFitting();
		} );
		this.UIButton_Fit.button( "disable" );

		this.UIResult_Fitting = $('#PropPomUI_Result_Fitting');
		this.UIResult_Fitting.width( '100%' );
		this.UIResult_Fitting.height( 'auto' );
	}

	// Simulate resize, which should also trigger a render
	this.OnResize();
}

BRDFPropertiesPom.prototype =
{
	SupportsBRDF__ : function( _BRDF )	{ return _BRDF instanceof BRDFPom; }

	//////////////////////////////////////////////////////////////////////////
	// BRDF Fitting algorithm using BFGS optimization algorithm
	, lastRMS : 0.0
	, fitterBFGS : null
	, fitterLM : null
	, maskingArray : null
	, PerformFitting : function()
	{
		if ( !this.BRDF )
			return;

		var	that = this;

		if ( !this.fitterBFGS )
			this.fitterBFGS = new FittingBFGS();
		if ( !this.fitterLM )
			this.fitterLM = new FittingLM();

		//////////////////////////////////////////////////////////////////////////
		// POM MODEL
		// Prepare parameters for model evaluation
		var	InitialParameters = [

			// Specular parameters
			this.BRDF.exponentX,
			this.BRDF.falloffX,
			this.BRDF.amplitudeX,
			this.BRDF.offsetX,

			this.BRDF.exponentY,
			this.BRDF.falloffY,
			this.BRDF.amplitudeY,
			this.BRDF.offsetY,

			// Diffuse parameters
			this.BRDF.diffuseReflectance,
			this.BRDF.diffuseRoughness,
		];

		function	ApplyConstraints( _Params )
		{
			// Specular parameters
			_Params[0] = Math.clamp( _Params[0], 1e-3, 8.0 );	// Exponents can't go negative
			_Params[4] = Math.clamp( _Params[4], 1e-3, 8.0 );

// _Params[0] = _Params[4] = 1

			_Params[1] = Math.clamp( _Params[1], 1e-2, 1.0 );	// Falloff neither
			_Params[5] = Math.clamp( _Params[5], 1e-2, 1.0 );
			_Params[2] = Math.max( 0.0, _Params[2] );			// Nor amplitudes
			_Params[6] = Math.max( 0.0, _Params[6] );
			_Params[3] = Math.clamp( _Params[3], 0.0, 1.0 );	// Offsets are in [0,1]
			_Params[7] = Math.clamp( _Params[7], 0.0, 1.0 );

			// Diffuse parameters
			_Params[8] = Math.clamp( _Params[8], 0.0, 1.0 );	// Reflectance can't go higher than 1
			_Params[9] = Math.clamp( _Params[9], 0.0, 4.0 );	// Let's clamp roughness to 4
		}

// From the time 
// 		var	Goal = 0.01;
// 		var	kx, ky;
// 		function	PrepareEvalModel( _Params )
// 		{
// 			var	x = Math.pow( _Params[1], _Params[0] );	// We must reach the goal at this position
// 			kx = Math.log( Goal / Math.max( Goal, _Params[2] ) ) / x;
// 
// 			var	y = Math.pow( _Params[5], _Params[4] );	// We must reach the goal at this position
// 			ky = Math.log( Goal / Math.max( Goal, _Params[6] ) ) / y;
// 		}
// 
// 		function	EvalModel( _Params, X, Y )
// 		{
// 			var	v = 1.0 - Y / 90.0;
// 			var	Cy = _Params[7] + _Params[6] * Math.exp( ky * Math.pow( v, _Params[4] ) );
// 
// 			var	u = X*X / 8100.0;
// 			var	Cx = _Params[3] + _Params[2] * Math.exp( kx * Math.pow( u, _Params[0] ) );
// 			var	C = Cx * Cy - _Params[3] * _Params[7];
// 
// 			return C;
// 		}

		// Generic re-use of the BRDF's own eval functions
		// Slower but at least I don't have to do the job of writing model eval twice (once in the BRDF and once here)!
		var	Diffuse = new vec3();
		var	Specular = new vec3();
		var	Luma = 0;
		function	PrepareEvalModel( _Params )
		{
			// Update specular parameters
			that.BRDF.exponentX = _Params[0];
			that.BRDF.falloffX = _Params[1];
			that.BRDF.amplitudeX = _Params[2];
			that.BRDF.offsetX = _Params[3];

			that.BRDF.exponentY = _Params[4];
			that.BRDF.falloffY = _Params[5];
			that.BRDF.amplitudeY = _Params[6];
			that.BRDF.offsetY = _Params[7];

			// Update diffuse parameters
			that.BRDF.diffuseReflectance = _Params[8];
			that.BRDF.diffuseRoughness = _Params[9];

			// Prepare eval
			that.BRDF.Prepare.call( that.BRDF );
		}
		function	EvalModel( _Params, X, Y )
		{
			// Prepare angles and stuff as the BRDF would do in UpdateTexture()
			var	ThetaD = Y * Math.HALFPI / 90;
			var	ThetaH = Math.HALFPI * X * X / 8100;
			that.BRDF.__thetaD = ThetaD;
			that.BRDF.__thetaH = ThetaH;
			that.BRDF.__cosThetaD = Math.cos( ThetaD );
			that.BRDF.__sinThetaD = Math.sin( ThetaD );
			that.BRDF.__cosThetaH = Math.cos( ThetaH );
			that.BRDF.__sinThetaH = Math.sin( ThetaH );
			that.BRDF.ComputeLightDirection.call( that.BRDF );

			// Eval diffuse & specular
			that.BRDF.ComputeDiffuse.call( that.BRDF, Diffuse );
			that.BRDF.ComputeSpecular.call( that.BRDF, Specular );

			Luma = 0.2126 * (Diffuse.x + Specular.x) + 0.7152 * (Diffuse.y + Specular.y) + 0.0722 * (Diffuse.z + Specular.z);

			return Luma;
		}

		function	UpdateParams( _Params )
		{
			PrepareEvalModel( _Params );
			that.BRDF.NotifyChange.call( that.BRDF );	// So the BRDF gets updated...
		}

		//////////////////////////////////////////////////////////////////////////
		// Start fitting
		var	RMS = 0/0;
		var	IterationsCount = 0;
		if ( this.fittingMethod == 1 )
		{	// Levenberg-Marquard fitting
 			this.fitterLM.PerformFitting( this.BRDF.referenceBRDF, this.BRDF, InitialParameters, ApplyConstraints, PrepareEvalModel, EvalModel, UpdateParams );
			RMS = Math.sqrt( this.fitterLM._sqSum );
			IterationsCount = this.fitterLM._iterationsCount;
		}
		else if ( this.fittingMethod == 0 )
 		{	// BFGS Fitting
			this.fitterBFGS.PerformFitting( this.BRDF.referenceBRDF, this.BRDF, InitialParameters, ApplyConstraints, PrepareEvalModel, EvalModel, UpdateParams );
			RMS = Math.sqrt( this.fitterBFGS._functionMinimum );
			IterationsCount = this.fitterBFGS._iterationsCount;
		}

		// Parameters have changed!
		this.UpdateUI__();

		this.UIResult_Fitting.html(
			'<br/><strong>Last RMS: ' + this.lastRMS + '<br/>' +
			'New RMS: ' + RMS + '<br/>' + 
			'Difference: ' + (RMS- this.lastRMS).toFixed( 3 ) + ' (' + (100 * (RMS / this.lastRMS - 1)).toFixed(1) + '%)<br/>' + 
			'Iterations: ' + IterationsCount + '<br/>' + 
			'</strong>' );
		this.lastRMS = RMS;
	}

	//////////////////////////////////////////////////////////////////////////
	// Event handlers
	, UpdateUI__ : function()
 	{
		this.UISliderExposure.set( this.BRDF.exposure );
		this.UISliderGamma.set( this.BRDF.gamma );

		// Specular parameters
		this.UICheckBox_SoloX.set( this.BRDF.soloX );
		this.UISliderAmplitudeX.set( Math.LOG10E * Math.log( this.BRDF.amplitudeX ) );
		this.UISliderFalloffX.set( this.BRDF.falloffX );
		this.UISliderExponentX.set( this.BRDF.exponentX );
		this.UISliderOffsetX.set( this.BRDF.offsetX );

		this.UICheckBox_SoloY.set( this.BRDF.soloY );
		this.UISliderAmplitudeY.set( Math.LOG10E * Math.log( this.BRDF.amplitudeY ) );
		this.UISliderFalloffY.set( this.BRDF.falloffY );
		this.UISliderExponentY.set( this.BRDF.exponentY );
		this.UISliderOffsetY.set( this.BRDF.offsetY );

		// Diffuse
		this.UISliderDiffuseReflectance.set( this.BRDF.diffuseReflectance );
		this.UISliderDiffuseRoughness.set( this.BRDF.diffuseRoughness );

		// Colors
		var	Color = this.vec3ToColor( this.BRDF.chromaSpecular );
		this.UIColorPicker_Specular.ColorPickerSetColor( Color );
			Color = this.vec3ToColor( this.BRDF.chromaFresnel );
		this.UIColorPicker_Fresnel.ColorPickerSetColor( Color );
			Color = this.vec3ToColor( this.BRDF.chromaDiffuse );
		this.UIColorPicker_Diffuse.ColorPickerSetColor( Color );
			Color = this.vec3ToColor( this.BRDF.chromaRetroDiffuse );
		this.UIColorPicker_RetroDiffuse.ColorPickerSetColor( Color );

		// Fitting
		if ( this.BRDF.referenceBRDF )
			this.UIComboBox_ReferenceBRDF.set( this.BRDF2UI[this.BRDF.referenceBRDF] );
		this.UIRadio_ShowReferenceBRDF.set( this.BRDF.displayType );
 	}

	, vec3ToColor : function( v )
	{
		return { r : (255 * v.x) | 0, g : (255 * v.y) | 0, b : (255 * v.z) | 0 };
	}
	, ColorTovec3 : function( rgb )
	{
		return new vec3( rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0 );
	}

	// Refreshes slice view if the BRDF changed its appearance
	, OnBRDFEvent : function( _BRDF, _Event )
	{
		BRDFPropertiesBase.prototype.OnBRDFEvent.call( this, _BRDF, _Event );

// 		if ( _Event.type != "parametersChanged" )
// 			return;

		// Update the status of our UI button based on the existence of a valid reference BRDF
		this.UIButton_Fit.button( _BRDF.referenceBRDF ? "enable" : "disable" );
	}

	, OnBRDFListEvent : function( _List, _Event )
	{
		BRDFPropertiesBase.prototype.OnBRDFListEvent.call( this, _List, _Event );

		var	that = this;

//		if ( _Event.type == "listChanged" )
		{	// Rebuild list of selectables
			var	combo = this.UIComboBox_ReferenceBRDF.comboBox;

			function	SetBRDF( _BRDF ) { return function() {
				that.BRDF.setReferenceBRDF( _BRDF );
			} }

			combo.html( '' );
			this.BRDF_UIs = [];
			this.BRDF2UI = {};

			var	BRDFIndex = 0;
			for ( var BRDFHash in _List.BRDFs )
			{
				var	BRDF = _List.BRDFs[BRDFHash];
				if ( BRDF == this.BRDF )
					continue;	// We mustn't be able to select ourselves...

				combo.append( '<option>' + BRDF.name + '</option>' );
				var	UI = $( "option:nth-child(" + (BRDFIndex+1) +")", combo );

				UI.BRDF = BRDF;
				UI.click( SetBRDF( BRDF ) );

				this.BRDF_UIs[BRDFIndex++] = UI;
				this.BRDF2UI[BRDF] = UI;
			}
		}

// 		if ( _Event.type == "selection" )
// 		{	// Update combo box elements' visibility
// 			for ( var i=0; i < this.BRDF_UIs.length; i++ )
// 			{
// 				var	UI = this.BRDF_UIs[i];
// 				UI.css( 'display', UI.BRDF == this.BRDF ? 'none' : 'inherit' );	// Hide our currently selected BRDF so it can't reference itself! DOESNT WORK!!
// 			}
// 		}
	}
};

patapi.helpers.Extend( BRDFPropertiesPom.prototype, BRDFPropertiesBase.prototype );	// Inherit from BRDFPropertiesBase
