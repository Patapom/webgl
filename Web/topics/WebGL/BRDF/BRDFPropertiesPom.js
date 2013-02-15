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
	// Create our UI elements
	var that = this;
	{
		//////////////////////////////////////////////////////////////////////////
		// Standard widgets
		this.CreateStandardPropertiesWidgets( '#PropPomUI' );	// Create standard widgets given our particular prefix


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
			sliderParams : { min: 0.0, max : 4.0, value: 1.0 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setExponentX( value );

				return _OriginalText + " (" + value.toFixed( 2 ) + ")";	// Update text
			}
		 } );

		this.UISliderFalloffX = new patapi.ui.LabelSlider( {
			labelSelector : "#PropPomUI_Slider_FalloffX .t0 span",
			selector : "#PropPomUI_Slider_FalloffX .t1",
			sliderParams : { min: 0.0, max : 10.0, value: 0.1 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setFalloffX( value );

				return _OriginalText + " (" + value.toFixed( 3 ) + ")";	// Update text
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
			sliderParams : { min: -3.0, max : 1.0, value: 0.1 },
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
			sliderParams : { min: 0.0, max : 4.0, value: 1.0 },
			step : 0.001,
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setExponentY( value );

				return _OriginalText + " (" + value.toFixed( 2 ) + ")";	// Update text
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

				return _OriginalText + " (" + value.toFixed( 3 ) + ")";	// Update text
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

				$('#PropPomUI_ColorPicker_Specular div').css( 'backgroundColor', '#' + hex );
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

				$('#PropPomUI_ColorPicker_Fresnel div').css( 'backgroundColor', '#' + hex );
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

				$('#PropPomUI_ColorPicker_Diffuse div').css( 'backgroundColor', '#' + hex );
			}
		});
		
		$('#PropPomUI_Button_PickDiffuse').button().click( function() {
			that.pickingColor = true;
			that.pickColorType = 2;
		} );


		//////////////////////////////////////////////////////////////////////////
		// Fitting widgets
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
			_Params[0] = Math.clamp( _Params[0], 1e-3, 4.0 );	// Exponents can't go negative
			_Params[4] = Math.clamp( _Params[4], 1e-3, 4.0 );

// _Params[0] = _Params[4] = 1

			_Params[1] = Math.clamp( _Params[1], 1e-3, 1.0 );	// Falloff neither
			_Params[5] = Math.clamp( _Params[5], 1e-3, 1.0 );
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
