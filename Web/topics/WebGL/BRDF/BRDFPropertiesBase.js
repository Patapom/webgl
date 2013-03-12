/*
 Hosts the base class for display of properties of BRDFs
 */

o3djs.provide( 'BRDF.BRDFPropertiesBase' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'patapi.ui' );
o3djs.require( 'BRDF.BRDFPom' );

//	_PropertiesPanelSelector, the selector to the root UI panel element hosting all the properties
//	_ViewportSelector, the selector to the GL canvas we'll transform into a viewport
//
BRDFPropertiesBase = function( _PropertiesPanelSelector, _ViewportSelector )
{
	var	that = this;

	this.BRDF = null;					// Currently displayed BRDF
	this.showStandardWidgets = false;	// Hide default widgets
	this.displayTypeThetaH = 1;			// Default is "squared" (which is the actual encoding of ThetaH btw)
	this.showLogLuma = false;
	this.showChroma = false;
	this.showDeChromatized = false;
	this.showNormalized = false;
	this.showIsolines = false;

	// Marker handling
	this.markerVisible = false;
	this.markerPosition = vec2.zero();

	// Build the GL viewport
	this.canvas = $(_ViewportSelector);
	this.viewport = new GLViewport( _ViewportSelector, this.canvas );

	var	gl = this.viewport.GetGL();
		gl.name = "GL_" + _ViewportSelector;


	//////////////////////////////////////////////////////////////////////////
	// Create the material & primitive to display the slice
	{
		this.material = patapi.webgl.CreateShaderFromFile( "BRDFSliceDisplay", "Shaders/RenderBRDFSlice.shader" );
		this.screenQuad = patapi.webgl.CreateScreenQuad( this.material );
	}

	//////////////////////////////////////////////////////////////////////////
	// Create the viewport infos hovering & marker elements
	this.UIRoot = $(_PropertiesPanelSelector);

	this.UIRoot.append( '<div class="viewport-infos"></div>' )
	this.UIViewportInfos = $( '.viewport-infos', this.UIRoot );

	this.UIRoot.append( '<div class="viewport-marker"></div>' )
	this.UIViewportMarker = $( '.viewport-marker', this.UIRoot );

	// Create events to manage dropping & dragging of the marker
	this.canvas.mousedown( function( e ) {
		that.setShowMarker( true );
	} );
	this.canvas.mouseup( function( e ) {
		that.setShowMarker( false );
	} );

	// Hook the hover event on the canvas to enable our display infos
	this.hoveredThetaH = 0;	// In radians!
	this.hoveredThetaD = 0;
	this.hoveredSliceY = 0;	// In [0,90]
	this.hoveredSliceX = 0;

	this.canvas.hover(
		function() {
			that.UIViewportInfos.css( 'display', 'block' );
		},
		function() {
			that.UIViewportInfos.css( 'display', 'none' );
		}
	).mousemove( function( e ) {
		var	TopLeftSlice = patapi.helpers.GetElementPosition( that.canvas[0] );
		var	TopLeftParent = patapi.helpers.GetElementPosition( that.UIRoot[0] );

		var	SliceX = Math.clamp( 90 * (e.pageX - 5 - TopLeftSlice.x) / that.canvas[0].width, 0, 90 );
		var	SliceY = Math.clamp( 90 * (that.canvas[0].height-1 - (e.pageY - 5 - TopLeftSlice.y)) / that.canvas[0].height, 0, 90 );
		that.hoveredThetaH = Math.deg2rad( SliceX );
		that.hoveredThetaD = Math.deg2rad( SliceY );

		// Transform coordinates based on display type
		switch ( that.displayTypeThetaH )
		{
		case 1:	// Square ThetaH
			that.hoveredThetaH = Math.INVHALFPI * that.hoveredThetaH*that.hoveredThetaH;
			break;

		case 2:	// Screen coordinates are actually cosines
			that.hoveredThetaH = Math.HALFPI - Math.acos( SliceX / 90.0 );
			that.hoveredThetaD = Math.HALFPI - Math.acos( SliceY / 90.0 );
			break;
		}

		// Reconstruct final slice coordinates
		that.hoveredSliceX = 90.0 * Math.sqrt( that.hoveredThetaH * Math.INVHALFPI );
		that.hoveredSliceY = 90.0 * that.hoveredThetaD * Math.INVHALFPI;

		// Notify of marker change in position
		if ( that.markerVisible )
			that.setMarkerPosition( that.hoveredThetaH, that.hoveredThetaD );

		// Position the viewport infos frame
		that.UIViewportInfos.html( that.RefreshViewportInfos( Math.rad2deg( that.hoveredThetaH ), Math.rad2deg( that.hoveredThetaD ), that.hoveredSliceX, that.hoveredSliceY ) );

		var	Dx = e.pageX - TopLeftParent.x;
		var	Dy = e.pageY - TopLeftParent.y;

		if ( SliceX > 35 )
			Dx -= 20 + that.UIViewportInfos.width();	// Move to the left of the pointer
		else
			Dx += 20;
		if ( SliceY < 45 )
			Dy -= 20 + that.UIViewportInfos.height();	// Move to the top of the pointer

		that.UIViewportInfos.css( 'left', Dx ).css( 'top', Dy );
	} );

	// Here we break the compartimentalized objects assumption to subscribe to Renderer3D's change in marker state/position
	// Honestly I don't give a damn since I'm the one who know which elements exist in the application, not really a big deal I'm not after genericity at all cost but rather efficiency
	Renderer3D.prototype.Subscribe( this, this.OnRenderer3DEvent );
}

BRDFPropertiesBase.prototype =
{
	// PURE VIRTUAL
	// Must return true if the provided BRDF is supported by this property display
	// For example: return _BRDF instanceof BRDFAnalytical
	SupportsBRDF__ : function( _BRDF )	{ throw "OVERRIDE!"; }

	// PURE VIRTUAL
	// Must be overridden with your widgets' initialization based on newly selected BRDF so the UI is up to date
	, UpdateUI__ : function()	{ throw "OVERRIDE!"; }


	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	// Gets or sets the BRDF, subscribing to its events at the same time
	, getBRDF : function()	{ return this.BRDF; }
	, setBRDF : function( value )
	{
		if ( value == this.BRDF )
			return;	// No change...

		if ( this.BRDF )
			this.BRDF.UnSubscribe( this );

		this.BRDF = value;

		if ( this.BRDF )
		{	// Setup the UI & subscribe to events
			this.UpdateUI__();
			this.BRDF.Subscribe( this, this.OnBRDFEvent );
		}

		// Trigger a render to update view
		this.Render();
	}

	, setDisplayTypeThetaH : function( value )
	{
		if ( value == this.displayTypeThetaH )
			return;

		this.displayTypeThetaH = value;
		this.Render();
		this.NotifyPropertyChanged();
	}
	, setShowLogLuma : function( value )
	{
		if ( value == this.showLogLuma )
			return;

		this.showLogLuma = value;
		this.Render();
		this.NotifyPropertyChanged();
	}
	, setShowChroma : function( value )
	{
		if ( value == this.showChroma )
			return;

		this.showChroma = value;
		this.Render();
		this.NotifyPropertyChanged();
	}
	, setShowDeChromatized : function( value )
	{
		if ( value == this.showDeChromatized )
			return;

		this.showDeChromatized = value;
		this.Render();
		this.NotifyPropertyChanged();
	}
	, setShowNormalized : function( value )
	{
		if ( value == this.showNormalized )
			return;

		this.showNormalized = value;
		this.Render();
		this.NotifyPropertyChanged();
	}
	, setShowIsolines : function( value )
	{
		if ( value == this.showIsolines )
			return;

		this.showIsolines = value;
		this.Render();
		this.NotifyPropertyChanged();
	}
	, setShowMarker : function( value )
	{
		if ( value == this.markerVisible )
			return;

		this.markerVisible = value;

		  // Update UI
		  this.UIViewportMarker.css( 'display', value ? 'block' : 'none' );

		this.setMarkerPosition( this.hoveredThetaH, this.hoveredThetaD );
	}
	, setMarkerPosition : function( _ThetaH, _ThetaD )
	{
		if ( Math.almost( _ThetaH, this.markerPosition.x ) && Math.almost( _ThetaD, this.markerPosition.y ) )
			return;

		this.markerPosition.x = _ThetaH;
		this.markerPosition.y = _ThetaD;

		// Transform Thetas based on display type
		switch ( this.displayTypeThetaH )
		{
		case 1:	// Square
			_ThetaH = Math.HALFPI * Math.sqrt( _ThetaH * Math.INVHALFPI );
			break;

		case 2:	// Screen coordinates are actually cosines
			_ThetaH = Math.sin( _ThetaH ) * Math.HALFPI;
			_ThetaD = Math.sin( _ThetaD ) * Math.HALFPI;
			break;
		}

		// Udpate UI
		var	TopLeftSlice = patapi.helpers.GetElementPosition( this.canvas[0] );
		var	TopLeftParent = patapi.helpers.GetElementPosition( this.UIRoot[0] );

		var	PageX = Math.INVHALFPI * _ThetaH * this.canvas[0].width + 5 + TopLeftSlice.x;
		var	PageY = (this.canvas[0].height-1) - (Math.INVHALFPI * _ThetaD * this.canvas[0].height) + 5 + TopLeftSlice.y;

		var	Dx = PageX - TopLeftParent.x - 4 - 5;
		var	Dy = PageY - TopLeftParent.y - 4 - 5;

		this.UIViewportMarker.css( 'left', Dx ).css( 'top', Dy );

		this.NotifyMarkerChanged();
	}

	//////////////////////////////////////////////////////////////////////////
	, Destroy : function()
	{
		this.setBRDF( null );	// Unsubscribe from any previous BRDF
	}

	// Renders the BRDF slice in the viewport
	, Render : function()
	{
		var	that = this;

		try
		{
			this.viewport.Render( 0.01, function( gl, _Time, _DeltaTime )
			{
				that.material.Use( function( M )
				{
					var	Texture = that.BRDF ? that.BRDF.getSliceTextureForViewport( that.viewport ) : null;
					M.uniforms.SafeSet( "_BRDFValid", Texture != null );
					if ( Texture )
					{
						M.uniforms.SafeSet( "_TexBRDF", Texture );
						M.uniforms.SafeSet( "_Exposure", that.BRDF.exposure );
						M.uniforms.SafeSet( "_Gamma", that.BRDF.gamma );
						M.uniforms.SafeSet( "_DisplayTypeThetaH", that.displayTypeThetaH );
						M.uniforms.SafeSet( "_ShowLogLuma", that.showLogLuma );
						M.uniforms.SafeSet( "_ShowChroma", that.showChroma );
						M.uniforms.SafeSet( "_ShowDeChromatized", that.showDeChromatized );
						M.uniforms.SafeSet( "_ShowNormalized", that.showNormalized );
						M.uniforms.SafeSet( "_MaxReflectance", that.BRDF.maxReflectance );
						M.uniforms.SafeSet( "_ShowIsolines", that.showIsolines );
					}

					that.screenQuad.Use();
					that.screenQuad.Draw();
				} );

			} );
		}
		catch ( _e )
		{
			UpdateStatusError( "An error occurred while rendering the BRDF slice:\n\n" + _e );
		}
	}


	//////////////////////////////////////////////////////////////////////////
	// Notification system
	, subscribers : []

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
	, NotifyMarkerChanged : function()		{ this.Notify( { type: "markerChanged" } ) }
	, NotifyPropertyChanged : function()	{ this.Notify( { type: "propertyChanged" } ); }
	, Notify : function( _Event )
	{
		for ( var SubscriberIndex=0; SubscriberIndex < this.subscribers.length; SubscriberIndex++ )
		{
			var	Value = this.subscribers[SubscriberIndex];
			Value.Callback.call( Value.This, this, _Event );
		}
	}


	//////////////////////////////////////////////////////////////////////////
	// Event handlers
 	, OnBRDFListEvent : function( _List, _Event )
	{
		if ( _Event.type != "selection" )
			return;

		var	BRDF = _Event.BRDF;
		if ( !this.SupportsBRDF__( BRDF ) )
			BRDF = null;

		this.UIRoot.css( "display", BRDF ? "block" : "none" );	// Hide the UI if BRDF not of the proper type
		this.setBRDF( BRDF );
	}

	// Refreshes slice view if the BRDF changed its appearance
	, OnBRDFEvent : function( _BRDF, _Event )
	{	
		this.Render();
	}

	// Occurs when marker or light theta changed 
	, OnRenderer3DEvent : function( _Renderer, _Event )
	{
		if ( _Event.type != "markerChanged" )
			return;	// Not our concern...

		if ( this.markerVisible != _Renderer.markerVisible )
			this.setShowMarker( _Renderer.markerVisible );
		this.setMarkerPosition( _Renderer.markerPosition.x, _Renderer.markerPosition.y );
	}

	// Reacts to layout resize so we keep the viewport square
	, OnResize : function()
	{
		var	Size = this.UIRoot.height();
			Size *= 0.9;	// 90% of height

		// Make the viewport square
		this.canvas.css( "width", Size ).css( "height", Size );

		// Re-draw with last BRDF
		this.Render();
	}

	// Expects _Thetas in degrees!
	, RefreshViewportInfos : function( _ThetaH, _ThetaD, _SliceX, _SliceY )
	{
		// Start by displaying cosines
		var	Text = "θh = " + _ThetaH.toFixed( 2 ) + "<br/>"
				 + "θd = " + _ThetaD.toFixed( 2 ) + "<br/>";

		// Read back pixel value at this position
		if ( this.BRDF )
		{
			var	Precision = 3;
			var	Reflectance = this.BRDF.sample( _SliceX, _SliceY );
			Text += "f(θh,θd) = (" + Reflectance.x.toFixed( Precision+1 ) + ", " + Reflectance.y.toFixed( Precision+1 ) + ", " + Reflectance.z.toFixed( Precision+1 ) + (Reflectance.w > 1e-6 ? ", " + Reflectance.w.toFixed( Precision+1 ) : "") + ") Y=" + (Reflectance.x * 0.2126 + Reflectance.y * 0.7152 + Reflectance.z * 0.0722).toFixed( Precision+1 ) + "<br/>";

			var	Albedo = this.BRDF.albedo;
			var	AlbedoText = "Albedo = (" + Albedo.x.toFixed( Precision+1 ) + ", " + Albedo.y.toFixed( Precision+1 ) + ", " + Albedo.z.toFixed( Precision+1 ) + ") Y=" + (Albedo.x * 0.2126 + Albedo.y * 0.7152 + Albedo.z * 0.0722).toFixed( Precision+1 );
			if ( Albedo.x > 1.0 || Albedo.y > 1.0 || Albedo.z > 1.0 )
				AlbedoText = '<font color=\"#FF5040\">' + AlbedoText + '</font>';
			Text += AlbedoText + "<br/>";

			Text += "<br/>";
			Text += "f_min = (" + this.BRDF.minReflectance.x.toFixed( Precision ) + ", " + this.BRDF.minReflectance.y.toFixed( Precision ) + ", " + this.BRDF.minReflectance.z.toFixed( Precision ) + ")<br/>";
			Text += "f_max = (" + this.BRDF.maxReflectance.x.toFixed( Precision ) + ", " + this.BRDF.maxReflectance.y.toFixed( Precision ) + ", " + this.BRDF.maxReflectance.z.toFixed( Precision ) + ")<br/>";
			Text += "f_avg = (" + this.BRDF.avgReflectance.x.toFixed( Precision ) + ", " + this.BRDF.avgReflectance.y.toFixed( Precision ) + ", " + this.BRDF.avgReflectance.z.toFixed( Precision ) + ")<br/>";
		}

		return Text;
	}

	// Create standard widgets given a particular prefix specific to the BRDF type calling this function
	, CreateStandardPropertiesWidgets : function( _Prefix, _ContainerParentSelector, _ToggleCheckboxSelector )
	{
		var	that = this;

		//////////////////////////////////////////////////////////////////////////
		// Create the DOM elements
		var	ContainerParent = $(_ContainerParentSelector);
		var	ContainerName = _Prefix + '_StandardWidgets';
		ContainerParent.append( '<div id="' + ContainerName + '"></div>');

		var	ContainerSelector = '#' + ContainerName;
		var	Container = $(ContainerSelector);
		Container.append(
		'<div class="UI-widget-label">' +
			'<div class="t0"><span>Theta H</span></div>' +
			'<div class="t1">' +
				'<input id="' + _Prefix + 'UI_Radio_ThetaH0" value="0" name="radioDisplayTypeThetaH' + _Prefix + '" type="radio"><label for="' + _Prefix + 'UI_Radio_ThetaH0">Linear</label>' +
				'<input id="' + _Prefix + 'UI_Radio_ThetaH1" value="1" name="radioDisplayTypeThetaH' + _Prefix + '" type="radio" checked="checked"><label for="' + _Prefix + 'UI_Radio_ThetaH1">Squared</label>' +
				'<input id="' + _Prefix + 'UI_Radio_ThetaH2" value="2" name="radioDisplayTypeThetaH' + _Prefix + '" type="radio"><label for="' + _Prefix + 'UI_Radio_ThetaH2">Cos</label>' +
			'</div>' +
		'</div>' );

		Container.append( '<div class="UI-widget-label"><div class="t0"><span>Show Log10 Luma</span></div><div class="t1"><span class="ui-state-default ui-corner-all ui-icon ui-icon-radio-off"/></div></div>' );
		Container.append( '<div class="UI-widget-label"><div class="t0"><span>Show Chroma</span></div><div class="t1"><span class="ui-state-default ui-corner-all ui-icon ui-icon-radio-off"/></div></div>' );
		Container.append( '<div class="UI-widget-label"><div class="t0"><span>Show De-Chromatized</span></div><div class="t1"><span class="ui-state-default ui-corner-all ui-icon ui-icon-radio-off"/></div></div>' );
		Container.append( '<div class="UI-widget-label"><div class="t0"><span>Show Normalized</span></div><div class="t1"><span class="ui-state-default ui-corner-all ui-icon ui-icon-radio-off"/></div></div>' );
		Container.append( '<div class="UI-widget-label"><div class="t0"><span>Show Isolines every powers of 10</span></div><div class="t1"><span class="ui-state-default ui-corner-all ui-icon ui-icon-radio-off"/></div></div>' );
		Container.append( '<div class="UI-widget-label"><div class="t0"><span>Exposure</span></div><div class="t1"></div></div>' );
		Container.append( '<div class="UI-widget-label"><div class="t0"><span>Gamma</span></div><div class="t1"></div></div>' );


		var	Selectors = [
			ContainerSelector + " > div:nth-child(1)",		// Radio ThetaH
			ContainerSelector + " > div:nth-child(2)",		// Log10 Luma
			ContainerSelector + " > div:nth-child(3)",		// Chroma
			ContainerSelector + " > div:nth-child(4)",		// De-Chromatized
			ContainerSelector + " > div:nth-child(5)",		// Normalized
			ContainerSelector + " > div:nth-child(6)",		// Isolines
			ContainerSelector + " > div:nth-child(7)",		// Exposure
			ContainerSelector + " > div:nth-child(8)",		// Gamma
		];

		//////////////////////////////////////////////////////////////////////////
		// Bind controls
		if ( _ToggleCheckboxSelector )
		{
			new patapi.ui.LabelCheckBox( {
				labelSelector : _ToggleCheckboxSelector,
				value : this.showStandardWidgets,
				button : true,
				change : function( value )
				{
					that.showStandardWidgets = value;
					$(_ContainerSelector).css( 'display', value ? 'inherit' : 'none' );	// Toggle visibility
				}
			} );
		}

		// Create sqr/luma/chroma check boxes
		new patapi.ui.LabelRadioButtons( {
			selector : Selectors[0],
			labelSelector : Selectors[0] + " .t0 span",
			value : this.displayTypeThetaH,
			change : function( value )
			{
				that.setDisplayTypeThetaH( value );
			}
		} );

		new patapi.ui.LabelCheckBox( {
			selector : Selectors[1] + " .t1 span",
			value : this.showLogLuma,
			change : function( value )
			{
				that.setShowLogLuma( value );
			}
		} );

		new patapi.ui.LabelCheckBox( {
			selector : Selectors[2] + " .t1 span",
			value : this.showChroma,
			change : function( value )
			{
				that.setShowChroma( value );
			}
		} );

		new patapi.ui.LabelCheckBox( {
			selector : Selectors[3] + " .t1 span",
			value : this.showDeChromatized,
			change : function( value )
			{
				that.setShowDeChromatized( value );
			}
		} );

		new patapi.ui.LabelCheckBox( {
			selector : Selectors[4] + " .t1 span",
			value : this.showNormalized,
			change : function( value )
			{
				that.setShowNormalized( value );
			}
		} );

		new patapi.ui.LabelCheckBox( {
			selector : Selectors[5] + " .t1 span",
			value : this.showIsolines,
			change : function( value )
			{
				that.setShowIsolines( value );
			}
		} );

		// Create exposure/gamma slider
		this.UISliderExposure = new patapi.ui.LabelSlider( {
			labelSelector : Selectors[6] + " .t0 span",
			selector : Selectors[6] + " .t1",
			sliderParams : { min: -6.0, max: 6.0 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setExposure( value );

				var	HelpText = value < 0.0 ? ("divided by " + Math.pow( 2.0, -value ).toFixed(3)) : ("multiplied by " + Math.pow( 2.0, value ).toFixed(3));
				var	NewText = _OriginalText + " (" + value + ") (" + HelpText + ")";	// Update text
				return NewText;
			}
		 } );

		this.UISliderGamma = new patapi.ui.LabelSlider( {
			labelSelector : Selectors[7] + " .t0 span",
			selector : Selectors[7] + " .t1",
			sliderParams : { min: 1.0, max : 4.0, value: 2.2 },
			change : function( value, _OriginalText )
			{
				if ( that.BRDF )
					that.BRDF.setGamma( value );

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );
	}
};
