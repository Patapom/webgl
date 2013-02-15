/*
 Hosts the display of properties of analytical BRDFs
 */

o3djs.provide( 'BRDF.BRDFPropertiesAnalytical' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'patapi.ui' );
o3djs.require( 'BRDF.BRDFPropertiesBase' );
o3djs.require( 'BRDF.BRDFAnalytical' );

BRDFPropertiesAnalytical = function()
{
	BRDFPropertiesBase.call( this, '#BRDFProperties_Analytical', '#PropAnalytical_Viewport' );	// Call base constructor

	//////////////////////////////////////////////////////////////////////////
	// Create our UI elements
	var that = this;
	{
		//////////////////////////////////////////////////////////////////////////
		// Standard widgets
		this.CreateStandardPropertiesWidgets( '#PropAnalyticalUI' );


		//////////////////////////////////////////////////////////////////////////
		// Diffuse part
		this.UIDiffuse = $("#PropAnalyticalUI_Diffuse");

		this.UIRadioDiff_Type = new patapi.ui.LabelRadioButtons( {
			selector : "#PropAnalyticalUI_Radio_DiffuseType",
			value : 0,
			change : function( value )
			{
				if ( !that.BRDF )
					return;

				that.BRDF.setDiffuseType( value );
				$('#PropAnalyticalUI_Slider_DiffuseRoughness').css( 'display', that.BRDF.diffuseType == 1 ? 'inherit' : 'none' );	// Show roughness for Oren-Nayar
			}
		} );

		this.UISliderDiff_ReflectanceR = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_DiffuseReflectanceR .t0 span",
			selector : "#PropAnalyticalUI_Slider_DiffuseReflectanceR .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.2 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setDiffuseReflectance( value, that.BRDF.diffuseReflectance.y, that.BRDF.diffuseReflectance.z );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		this.UISliderDiff_ReflectanceG = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_DiffuseReflectanceG .t0 span",
			selector : "#PropAnalyticalUI_Slider_DiffuseReflectanceG .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.2 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setDiffuseReflectance( that.BRDF.diffuseReflectance.x, value, that.BRDF.diffuseReflectance.z );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		this.UISliderDiff_ReflectanceB = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_DiffuseReflectanceB .t0 span",
			selector : "#PropAnalyticalUI_Slider_DiffuseReflectanceB .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.2 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setDiffuseReflectance( that.BRDF.diffuseReflectance.x, that.BRDF.diffuseReflectance.y, value );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		// Oren-Nayar roughness
		this.UISliderDiff_Roughness = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_DiffuseRoughness .t0 span",
			selector : "#PropAnalyticalUI_Slider_DiffuseRoughness .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.5 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setRoughness( value );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );



		//////////////////////////////////////////////////////////////////////////
		// Specular
		this.UICheckBox_DiffuseOnly = new patapi.ui.LabelCheckBox( {
//			selector : "#PropAnalyticalUI_Checkbox_DiffuseOnly .t1 span",
			selector : "#PropAnalyticalUI_Checkbox_DiffuseOnly span",
			change : function( value )
			{
				if ( that.BRDF )
					that.BRDF.setDiffuseOnly( value );
			}
		} );

		this.UICheckBox_UseComplexFresnel = new patapi.ui.LabelCheckBox( {
			selector : "#PropAnalyticalUI_Checkbox_UseComplexFresnel span",
			change : function( value )
			{
				if ( that.BRDF )
					that.BRDF.setUseComplexFresnel( value );
			}
		} );

		this.UICheckBox_LerpDiffuseWithFresnel = new patapi.ui.LabelCheckBox( {
			selector : "#PropAnalyticalUI_Checkbox_LerpDiffuseWithFresnel span",
			change : function( value )
			{
				if ( that.BRDF )
					that.BRDF.setLerpDiffuseWithFresnel( value );
			}
		} );

		this.UISlider_Fresnel = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_FresnelF0 .t0 span",
			selector : "#PropAnalyticalUI_Slider_FresnelF0 .t1",
			sliderParams : { min: -4.0, max : 0.0, value: -1.0, step: 0.001 },
			change : function( value, _OriginalText )
			{
				value = (Math.pow( 10.0, value ) - 1e-4) / (1.0 - 1e-4);

				if ( that.BRDF )
					that.BRDF.setFresnelF0( value );

				// F0 = powf(((1.8-1.0)/(1.8+1.0)),2.0f); //Refractive index is 1.8
				// F0 = ((n2 - n1) / (n2 + n1))²
				// Assuming n1=1 (air)
				// We look for n2 so:
				//	n2 = (1+a)/(1-a) with a = sqrt(F0)
				var	IOR = (1+Math.sqrt(value)) / (1-Math.sqrt(value));

				return _OriginalText + " (" + value.toFixed( 4 ) + ") IOR=" + IOR.toFixed( 3 );	// Update text
			}
		 } );

		this.UISliderSpec_ColorR = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_SpecularColorR .t0 span",
			selector : "#PropAnalyticalUI_Slider_SpecularColorR .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 1.0 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setSpecularColor( value, that.BRDF.specularColor.y, that.BRDF.specularColor.z );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		this.UISliderSpec_ColorG = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_SpecularColorG .t0 span",
			selector : "#PropAnalyticalUI_Slider_SpecularColorG .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 1.0 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setSpecularColor( that.BRDF.specularColor.x, value, that.BRDF.specularColor.z );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		this.UISliderSpec_ColorB = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_SpecularColorB .t0 span",
			selector : "#PropAnalyticalUI_Slider_SpecularColorB .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 1.0 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setSpecularColor( that.BRDF.specularColor.x, that.BRDF.specularColor.y, value );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		// =================== BLINN-PHONG ===================
		this.UIBlinnPhong = $("#PropAnalyticalUI_BlinnPhong");

		this.UISliderBP_SpecularExponent = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_SpecularExponent .t0 span",
			selector : "#PropAnalyticalUI_Slider_SpecularExponent .t1",
			sliderParams : { min: 0.0, max : 4.0, value: 1.0 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setSpecularExponent( value );

				return _OriginalText + " (" + Math.pow( 10.0, value ).toFixed( 2 ) + ")";	// Update text
			}
		 } );

		// =================== ASHIKMIN-SHIRLEY ===================
		this.UIAshikminShirley = $("#PropAnalyticalUI_Ashikmin_Shirley");

		this.UISliderAS_SpecularExponent = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_SpecularExponent2 .t0 span",
			selector : "#PropAnalyticalUI_Slider_SpecularExponent2 .t1",
			sliderParams : { min: 0.0, max : 4.0, value: 1.0 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setSpecularExponent( value );

				return _OriginalText + " (" + Math.pow( 10.0, value ).toFixed( 2 ) + ")";	// Update text
			}
		 } );

		// =================== COOK-TORRANCE ===================
		this.UICookTorrance = $("#PropAnalyticalUI_Cook_Torrance");

		this.UISliderCT_SpecularRoughness = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_SpecularRoughness .t0 span",
			selector : "#PropAnalyticalUI_Slider_SpecularRoughness .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.5, step: 0.001 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setSpecularRoughness( value );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		this.UICheckBoxCT_IncludeGeometry = new patapi.ui.LabelCheckBox( {
			selector : "#PropAnalyticalUI_Checkbox_IncludeGeometricTerm .t1 span",
			change : function( value )
			{
				if ( that.BRDF )
					that.BRDF.setIncludeG( value );
			}
		} );

		this.UICheckBoxCT_UseBeckmann = new patapi.ui.LabelCheckBox( {
			selector : "#PropAnalyticalUI_Checkbox_UseBeckmann .t1 span",
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setUseBeckmann( value );

				return _OriginalText + (value ? "" : " (No => Ward)");
			}
		} );

		this.UICheckBoxCT_UseSimplifiedG = new patapi.ui.LabelCheckBox( {
			selector : "#PropAnalyticalUI_Checkbox_UseSimplifiedGeometricFactor .t1 span",
			change : function( value )
			{
				if ( that.BRDF )
					that.BRDF.setUseSimplifiedCookTorrance( value );
			}
		} );

		// =================== WALTER ===================
		this.UIWalter = $("#PropAnalyticalUI_Walter");

		this.UISliderW_SpecularRoughness = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_SpecularRoughness2 .t0 span",
			selector : "#PropAnalyticalUI_Slider_SpecularRoughness2 .t1",
			sliderParams : { min: 0.0, max : 1.0, value: 0.5, step: 0.001 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setSpecularRoughness( value );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		this.UISliderW_GeneralizedTrowbridgeReitz = new patapi.ui.LabelSlider( {
			labelSelector : "#PropAnalyticalUI_Slider_GeneralizedTrowbridgeReitzExponent .t0 span",
			selector : "#PropAnalyticalUI_Slider_GeneralizedTrowbridgeReitzExponent .t1",
			sliderParams : { min: 0.0, max : 10.0, value: 2.0 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setGeneralizedTrowbridgeReitzExponent( value );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );
	}

	// Simulate resize, which should also trigger a render
	this.OnResize();
}

BRDFPropertiesAnalytical.prototype =
{
	SupportsBRDF__ : function( _BRDF )	{ return _BRDF instanceof BRDFAnalytical; }

	, UpdateUI__ : function()
	{
		this.UISliderExposure.set( this.BRDF.exposure );
		this.UISliderGamma.set( this.BRDF.gamma );

		// Setup generic diffuse & specular
		this.UIRadioDiff_Type.set( this.BRDF.diffuseType );
		this.UISliderDiff_ReflectanceR.set( this.BRDF.diffuseReflectance.x );
		this.UISliderDiff_ReflectanceG.set( this.BRDF.diffuseReflectance.y );
		this.UISliderDiff_ReflectanceB.set( this.BRDF.diffuseReflectance.z );
		this.UISliderDiff_Roughness.set( this.BRDF.roughness );
		this.UICheckBox_DiffuseOnly.set( this.BRDF.diffuseOnly );
		this.UICheckBox_UseComplexFresnel.set( this.BRDF.useComplexFresnel );
		this.UICheckBox_LerpDiffuseWithFresnel.set( this.BRDF.lerpDiffuseWithFresnel );
		this.UISlider_Fresnel.set( Math.log( this.BRDF.fresnelF0 ) * Math.LOG10E );
		this.UISliderSpec_ColorR.set( this.BRDF.specularColor.x );
		this.UISliderSpec_ColorG.set( this.BRDF.specularColor.y );
		this.UISliderSpec_ColorB.set( this.BRDF.specularColor.z );

		// Show/Hide various UI blocks depending on type
		this.UIBlinnPhong.css( 'display', this.BRDF.type == 0 ? 'block' : 'none' );
		this.UIAshikminShirley.css( 'display', this.BRDF.type == 1 ? 'block' : 'none' );
		this.UICookTorrance.css( 'display', this.BRDF.type == 2 ? 'block' : 'none' );
		this.UIWalter.css( 'display', this.BRDF.type == 3 ? 'block' : 'none' );

		switch ( this.BRDF.type )
		{
		case 0:	// Blinn-Phong
			this.UISliderBP_SpecularExponent.set( this.BRDF.specularExponent );
			break;

		case 1:	// Ashikmin-Shirley
			this.UISliderAS_SpecularExponent.set( this.BRDF.specularExponent );	// Also uses the same specular exponent
			break;

		case 2:	// Cook-Torrance
			this.UISliderCT_SpecularRoughness.set( this.BRDF.specularRoughness );
			this.UICheckBoxCT_IncludeGeometry.set( this.BRDF.includeG );
			this.UICheckBoxCT_UseBeckmann.set( this.BRDF.useBeckmann );
			this.UICheckBoxCT_UseSimplifiedG.set( this.BRDF.useSimplifiedCookTorrance );
			break;

		case 3:	// Walter
			this.UISliderW_SpecularRoughness.set( this.BRDF.specularRoughness );
			this.UISliderW_GeneralizedTrowbridgeReitz.set( this.BRDF.generalizedTrowbridgeReitzExponent );
			break;
		}
	}
};

patapi.helpers.Extend( BRDFPropertiesAnalytical.prototype, BRDFPropertiesBase.prototype );	// Inherit from BRDFPropertiesBase
