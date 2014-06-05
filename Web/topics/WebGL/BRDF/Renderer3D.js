/*
 Hosts the 3D renderer control
 It renders the BRDF in the classic way of an extruded hemisphere
 */

o3djs.provide( 'BRDF.Renderer3D' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'BRDF.GLViewport' );

Renderer3D = function( _canvas, _FOV )
{
	var	that = this;

	this.canvas = _canvas;
	this.BRDF = null;
	this.visible = true;

	this.lightTheta = 0.25 * Math.PI;
	this.lightPhi = 0.0;

	this.geometryType = -1;	// Set later in the UI part
	this.colorType = -1;	// Set later in the UI part

	this.showWireframe = false;
	this.showGroundPlane = true;
	this.showRefBRDF = false;	// When the displayed BRDF also has a "referenceBRDF" property then a button appears to toggle this state

	// Marker handling
	this.markerVisible = false;
	this.markerPosition = vec2.zero();

	// No picking FBO at the moment (created in Resize callback)
	this.FBOPicker = null;

	// Create the GL viewport
	this.viewport = new GLViewport( "3DViewport", _canvas );
	this.FOV = _FOV;

	var	gl = this.viewport.GetGL();
		gl.name = "GLRenderer3D";

	// Build our camera and light
	this.camera = new patapi.Camera( gl, "3DRendererCamera", this.FOV, patapi.webgl.width / patapi.webgl.height, 0.01, 50.0 );
	this.camera.LookAt( new vec3( 2.5, 1.0, 0.0 ).mul( 0.2 ), vec3.zero(), vec3.unitY() );

	// Attach a camera manipulator
	this.cameraManipulator = new patapi.cameraOrbit( this.camera.Position, this.camera.Target,
		{
			Callback : function( _Manip )
			{
				_Manip.UpdateCamera( that.camera );
				that.Render();
			},
			AllowPan : true,
			DistanceMin : 0.01,
			DistanceMax : 20,
			PanBBoxMin : -4,
			PanBBoxMax : +4,
		} );
	this.cameraManipulator.AttachToEvents( this.canvas[0] );
	this.cameraManipulator.UpdateOrbitSpeed( 0.6 * this.canvas[0].clientWidth, 0.8 * this.canvas[0].clientHeight )
	this.cameraManipulator.UpdatePanSpeed( 0.8 * this.canvas[0].clientWidth, 1.2 * this.canvas[0].clientHeight )
	this.cameraManipulator.eventsPreProcessor = function( _e ) {
		if ( !_e.shiftKey || ((_e.type != 'mousemove' && _e.type != 'mousewheel') && that.markerVisible) )
		{	// Don't interfere if no shift pressed
			that.setShowMarker( false );
			return true;
		}

		var	CanvasPosition = patapi.helpers.GetElementPosition( that.canvas[0] );
		var	X = _e.clientX - CanvasPosition.x;
		var	Y = _e.clientY - CanvasPosition.y;

		var	U = X / that.canvas[0].clientWidth;
		var	V = Y / that.canvas[0].clientHeight;

		that.SampleBRDFAnglesFromViewport( U, V );
		that.Render();

		return false;	// Prevent any mouse move
	};

	//////////////////////////////////////////////////////////////////////////
	// Create our render materials
	{
		this.material = patapi.webgl.CreateShaderFromFile( "Render3D", "Shaders/Render3D.shader" );
		this.materialWireframe = patapi.webgl.CreateShaderFromFile( "Render3DWireframe", "Shaders/Render3DWireframe.shader" );
		this.materialGroundPlane = patapi.webgl.CreateShaderFromFile( "Render3DGroundPlane", "Shaders/Render3DGroundPlane.shader" );
		this.materialBackground = patapi.webgl.CreateShaderFromFile( "Render3DBackground", "Shaders/Render3DBackground.shader" );
		this.materialHelpers = patapi.webgl.CreateShaderFromFile( "Render3DBackground", "Shaders/Render3DHelpers.shader" );
	}

	//////////////////////////////////////////////////////////////////////////
	// Create our fullscreen quad
	this.screenQuad = patapi.webgl.CreateScreenQuad( this.materialBackground );

	// Create our 3D hemisphere mesh
	{
		var	SubdivisionsTheta = 45;
		var	SubdivisionsPhi = 180;
		var	Positions = new Array( 3*SubdivisionsTheta*SubdivisionsPhi );
		var	UVs = new Array( 2*SubdivisionsTheta*SubdivisionsPhi );

		// Build vertices
		var	OffsetPos = 0;
		var	OffsetUV = 0;
		for ( var Y=0; Y < SubdivisionsTheta; Y++ )
		{
			var	V = Y / (SubdivisionsTheta-1);
			var	Theta = Math.HALFPI * V;
//			var	Theta = Math.asin( Math.sqrt( V ) );

			for ( var X=0; X < SubdivisionsPhi; X++ )
			{
				var	U = X / (SubdivisionsPhi-1);
				var	Phi = Math.TWOPI * U;

				Positions[OffsetPos++] = Math.sin( Phi ) * Math.sin( Theta );
				Positions[OffsetPos++] = Math.cos( Theta );
				Positions[OffsetPos++] = Math.cos( Phi ) * Math.sin( Theta );

				UVs[OffsetUV++] = U; UVs[OffsetUV++] = V;
			}
		}

		var	Vertices = 
		{
			_vPosition : new Float32Array( Positions ),
			_vUV : new Float32Array( UVs )
		};

		{
			// Build indices
			var	StripsCount = SubdivisionsTheta-1;
			var	StripSize = 2*(SubdivisionsPhi+1);
			var	IndicesArray = new Array( StripSize * StripsCount );
			var	OffsetIndex = 0;
			for ( var StripIndex=0; StripIndex < StripsCount; StripIndex++ )
			{
				var	StripOffset0 = SubdivisionsPhi*(StripIndex+0);
				var	StripOffset1 = SubdivisionsPhi*(StripIndex+1);
				for ( var LineIndex=0; LineIndex < SubdivisionsPhi; LineIndex++ )
				{
					IndicesArray[OffsetIndex++] = StripOffset0++;	// Alternate from this strip line
					IndicesArray[OffsetIndex++] = StripOffset1++;	// to the next...
				}

				// Finally, add 2 degenerate vertices (a.k.a. retards) to nicely join with next strip
				IndicesArray[OffsetIndex++] = StripOffset1-1;
				IndicesArray[OffsetIndex++] = StripOffset0;
			}
			var	Indices = new Uint16Array( IndicesArray );
			this.primitive = patapi.webgl.CreatePrimitiveSynchronous( "3D", this.material, Vertices, Indices, gl.TRIANGLE_STRIP );
		}

		// =======================
		// Build the wireframe version
		{
			var	IndicesArray = new Array( 4 * SubdivisionsTheta * (SubdivisionsPhi-1) );
			var	OffsetIndex = 0;
			for ( var Y=0; Y < SubdivisionsTheta; Y++ )
			{
				for ( var X=0; X < SubdivisionsPhi; X++ )
				{
					IndicesArray[OffsetIndex++] = SubdivisionsPhi*Y+X;
					IndicesArray[OffsetIndex++] = SubdivisionsPhi*Y+((X+1) % SubdivisionsPhi);

					if ( Y == SubdivisionsTheta-1 )
						continue;

					IndicesArray[OffsetIndex++] = SubdivisionsPhi*Y+X;
					IndicesArray[OffsetIndex++] = SubdivisionsPhi*(Y+1)+X;
				}
			}
			var	Indices = new Uint16Array( IndicesArray );

			this.primitiveWireframe = patapi.webgl.CreatePrimitiveSynchronous( "3DWire", this.materialWireframe, Vertices, Indices, gl.LINES );
		}

		// Create our helper primitive for light and reflection (a simple line!)
		{
			var	Vertices = 
			{
				_vPosition : new Float32Array( [ 0.0, 0.0, 0.0, 1.0, 1.0, 1.0 ] ),
			};

			var	Indices = new Uint16Array( [ 0, 1 ] );

			this.primitiveLightDirection = patapi.webgl.CreatePrimitiveSynchronous( "LightDirection", this.materialHelpers, Vertices, Indices, gl.LINES );
		}
	}

	//////////////////////////////////////////////////////////////////////////
	// Create the UI
	{
		new patapi.ui.LabelSlider( {
			labelSelector : "#Render3DUI_Slider_LightTheta .t0 span",
			selector : "#Render3DUI_Slider_LightTheta .t1",
			sliderParams : { min: 0.0, max : 90.0, value: Math.rad2deg( this.lightTheta ) },
			change : function( value, _OriginalText )
			{
				that.setLightTheta( Math.deg2rad( value ) );
				return _OriginalText + " (" + value + "°)";	// Update text
			}
		 } );

		new patapi.ui.LabelSlider( {
			labelSelector : "#Render3DUI_Slider_LightPhi .t0 span",
			selector : "#Render3DUI_Slider_LightPhi .t1",
			sliderParams : { min: -180.0, max : 180.0, value: Math.rad2deg( this.lightPhi ) },
			change : function( value, _OriginalText )
			{
				that.setLightPhi( Math.deg2rad( value ) );
				return _OriginalText + " (" + value + "°)";	// Update text
			}
		 } );

		$('#Render3DUI_ToggleWireframe').click( function()
		{
			that.setShowWireframe( !that.showWireframe );
		} )
		$('#Render3DUI_ToggleGroundPlane').click( function()
		{
			that.setShowGroundPlane( !that.showGroundPlane );
		} )
		$("#Render3DUI_ResetCamera").click( function() {
			that.cameraManipulator.MoveTarget( vec3.zero() );
		} );

		//////////////////////////////////////////////////////////////////////////
		// Let's hardcode the dropdown lists
		this.toolbarButton_ListGeometry = $('#Render3DUI_ListGeometry');
		this.toolbarButton_ListGeometry.click( function() {
			$('#Render3DUI_List_Geometry').css( "display", "block" ).hover( undefined, function() { $(this).fadeOut( 100 ); } );
		} );

		this.listItems_Geometry = {
			0 : $('#Render3DUI_List_Geometry li:nth-child(1)'),		// R
			1 : $('#Render3DUI_List_Geometry li:nth-child(2)'),		// G
			2 : $('#Render3DUI_List_Geometry li:nth-child(3)'),		// B
			3 : $('#Render3DUI_List_Geometry li:nth-child(4)'),		// Luminance
			4 : $('#Render3DUI_List_Geometry li:nth-child(5)'),		// R+G+B
			// There's a gap in elements
			5 : $('#Render3DUI_List_Geometry li:nth-child(7)'),		// Log10 R
			6 : $('#Render3DUI_List_Geometry li:nth-child(8)'),		// Log10 G
			7 : $('#Render3DUI_List_Geometry li:nth-child(9)'),		// Log10 B
			8 : $('#Render3DUI_List_Geometry li:nth-child(10)'),	// Log10 Luminance
			9 : $('#Render3DUI_List_Geometry li:nth-child(11)'),	// Log10 R+G+B
		};
		
		{
			function	ClickListItemGeo( value ) { return function() {
				that.setGeometryType( value )
			} };
			for ( var GeoType in this.listItems_Geometry )
			{
				var	GeoValue = parseInt( GeoType );
				var	listItem = this.listItems_Geometry[GeoValue];
				listItem.click( ClickListItemGeo( GeoValue ) );
			}
			this.setGeometryType( 3 );	// Show luminance
		}

		this.toolbarButton_ListColor = $('#Render3DUI_ListColor');
		this.toolbarButton_ListColor.click( function() {
			$('#Render3DUI_List_Color').css( "display", "block" ).hover( undefined, function() { $(this).fadeOut( 100 ); } );
		} );

		this.listItems_Color = {
			0 : $('#Render3DUI_List_Color li:nth-child(1)'),	// Fake Lighting
			1 : $('#Render3DUI_List_Color li:nth-child(2)'),	// BRDF Color
			2 : $('#Render3DUI_List_Color li:nth-child(3)'),	// Log10 BRDF Color
			3 : $('#Render3DUI_List_Color li:nth-child(4)'),	// 10 x BRDF Color
			4 : $('#Render3DUI_List_Color li:nth-child(5)'),	// Luma
			5 : $('#Render3DUI_List_Color li:nth-child(6)'),	// Log10(Luma)
			6 : $('#Render3DUI_List_Color li:nth-child(7)'),	// 10 x Luma
			7 : $('#Render3DUI_List_Color li:nth-child(8)'),	// Chroma
		};

		{
			function	ClickListItemColor( value ) { return function() {
				that.setColorType( value );
			} };
			for ( var ColorType in this.listItems_Color )
			{
				var	ColorValue = parseInt( ColorType );
				var	listItem = this.listItems_Color[ColorValue];
				listItem.click( ClickListItemColor( ColorValue ) );
			}
			this.setColorType( 0 );		// Show fake lighting
		}
	}

	// Build the "Show Reference" button
	this.button_ShowRefBRDF = $('#Render3DUI_ShowReferenceBRDF').button().click( function() {
		that.setShowRefBRDF( !that.showRefBRDF );
	} );

	//////////////////////////////////////////////////////////////////////////
	// Subscribe to all properties' marker event so we can track and position the marker on our 3D representation
	BRDFPropertiesBase.prototype.Subscribe.call( BRDFPropertiesBase.prototype, this, this.OnPropertiesEditorChangedEvent );

	// Render once...
	this.ready = true;
	this.Render();
}

Renderer3D.prototype =
{
	Destroy : function()
	{
		this.setBRDF( null );	// Unsubscribe from events

		if ( this.material )			this.material.Destroy();
		if ( this.materialWireframe )	this.materialWireframe.Destroy();
		if ( this.materialGroundPlane )	this.materialGroundPlane.Destroy();
		if ( this.materialBackground )	this.materialBackground.Destroy();
		if ( this.materialHelpers )		this.materialHelpers.Destroy();
		if ( this.FBOPicker )			this.FBOPicker.Destroy();
		if ( this.primitive )			this.primitive.Destroy();
		if ( this.primitiveWireframe )	this.primitiveWireframe.Destroy();
		if ( this.primitiveLightDirection )	this.primitiveLightDirection.Destroy();
	}

	//////////////////////////////////////////////////////////////////////////
	// Gets or sets the BRDF, subscribing to its events at the same time
	, getBRDF : function()	{ return this.BRDF; }
	, setBRDF : function( value )
	{
		if ( value == this.BRDF )
			return;	// No change...

		if ( this.BRDF )
		{
			this.BRDF.UnSubscribe( this );
			this.button_ShowRefBRDF.css( 'display', 'none' );	// Hide button
			this.showRefBRDF = false;
		}

		this.BRDF = value;

		if ( this.BRDF )
		{
			this.BRDF.Subscribe( this, this.OnBRDFEvent );
			if ( this.BRDF.referenceBRDF !== undefined )
				this.button_ShowRefBRDF.css( 'display', 'inherit' );	// Show button if property exists (don't care if it's null)
		}

		// Trigger a render to update view
		this.Render();
	}

	, setVisible : function( value )
	{
		if ( value == this.visible )
			return;

		this.visible = value;
		this.Render();
	}

	, setLightTheta : function( value )
	{
		if ( Math.almost( value, this.lightTheta ) )
			return;

		this.lightTheta = value;
		this.Render();

		// Notify of the change
		var	event = { type : "lightTheta", value : value }
		this.Notify( event );
	}

	, setLightPhi : function( value )
	{
		if ( Math.almost( value, this.lightPhi ) )
			return;

		this.lightPhi = value;
		this.Render();
	}

	, setGeometryType : function( value )
	{
		if ( value == this.geometryType )
			return;

		// De-select previous UI element
		if ( this.listItems_Geometry[this.geometryType] )
			this.listItems_Geometry[this.geometryType].removeClass( 'drop-down-selected' );

		this.geometryType = value;

		// Select new UI element
		if ( this.listItems_Geometry[this.geometryType] )
			this.listItems_Geometry[this.geometryType].addClass( 'drop-down-selected' );

		this.Render();
	}

	, setColorType : function( value )
	{
		if ( value == this.colorType )
			return;

		// De-select previous UI element
		if ( this.listItems_Color[this.colorType] )
			this.listItems_Color[this.colorType].removeClass( 'drop-down-selected' );

		this.colorType = value;

		// Select new UI element
		if ( this.listItems_Color[this.colorType] )
			this.listItems_Color[this.colorType].addClass( 'drop-down-selected' );

		this.Render();
	}

	, setShowWireframe : function( value )
	{
		if ( value == this.showWireframe )
			return;

		this.showWireframe = value;
		this.Render();
	}
	, setShowGroundPlane : function( value )
	{
		if ( value == this.showGroundPlane )
			return;

		this.showGroundPlane = value;
		this.Render();
	}
	, setShowRefBRDF : function( value )
	{
		if ( value == this.showRefBRDF )
			return;

		this.showRefBRDF = value;
		this.Render();
	}

	, setShowMarker : function( value )
	{
		if ( value == this.markerVisible )
			return;

		this.markerVisible = value;
		this.Render();

		this.NotifyMarkerChanged();
	}
	, setMarkerPosition : function( _ThetaH, _ThetaD )
	{
		if ( Math.almost( _ThetaH, this.markerPosition.x ) && Math.almost( _ThetaD, this.markerPosition.y ) )
			return;

		this.markerPosition.x = _ThetaH;
		this.markerPosition.y = _ThetaD;
		this.Render();

		this.NotifyMarkerChanged();
	}

	//////////////////////////////////////////////////////////////////////////
	, Render : function()
	{
		if ( !this.ready || !this.visible )
			return;

		var	that = this;

		this.viewport.Render( 0.1,
		function( gl, _Time, _DeltaTime )
		{
			// Setup default states
			gl.disable( gl.DEPTH_TEST );
//			gl.enable( gl.CULL_FACE );
 			gl.disable( gl.CULL_FACE );
			gl.cullFace( gl.BACK );

			// Clear frame buffer
			patapi.webgl.ClearDepth();
			that.materialBackground.Use( function( M ) {
				that.screenQuad.Use().Draw();
			} );


			var	LightDirection = new vec3(
				Math.sin(that.lightTheta) * Math.sin( that.lightPhi ),
				Math.cos(that.lightTheta),
				Math.sin(that.lightTheta) * Math.cos( that.lightPhi )
			);

			var	LightReflection = new vec3( -LightDirection.x, LightDirection.y, -LightDirection.z );


			//////////////////////////////////////////////////////////////////////////
			// Render the ground plane without depth write
			if ( that.showGroundPlane )
			{
				gl.depthMask( false );
				that.materialGroundPlane.Use( function( M ) {
				
					M.uniforms._World2Proj.Set( that.camera.World2Proj );		// The most important projection matrix
					M.uniforms.SafeSet( "_Camera2World", that.camera.Camera2World );

					that.screenQuad.Use().Draw();
				} );

				gl.depthMask( true );
			}

			//////////////////////////////////////////////////////////////////////////
			// Render our primitive with the normal shader
			gl.enable( gl.DEPTH_TEST );

			function	DrawGeometry( M, _Primitive ) {
 				M.uniforms.SafeSet( "_RenderPickable", false );
				M.uniforms.SafeSet( "_ShowChroma2", false );
				M.uniforms.SafeSet( "_ShowLuminance", false );
				M.uniforms.SafeSet( "_ShowX10", false );
				switch ( that.colorType )
				{
				case 0:	// Fake lighting
					M.uniforms.SafeSet( "_UseBRDFColors", false );
					M.uniforms.SafeSet( "_ShowLogLuma", false );
					break;
				case 1:	// BRDF color
					M.uniforms.SafeSet( "_UseBRDFColors", true );
					M.uniforms.SafeSet( "_ShowLogLuma", false );
					break;
				case 2:	// log BRDF color
					M.uniforms.SafeSet( "_UseBRDFColors", true );
					M.uniforms.SafeSet( "_ShowLogLuma", true );
					break;
				case 3:	// 10 x BRDF Color
					M.uniforms.SafeSet( "_UseBRDFColors", true );
					M.uniforms.SafeSet( "_ShowX10", true );
					break;
				case 4:	// Luma
					M.uniforms.SafeSet( "_UseBRDFColors", true );
					M.uniforms.SafeSet( "_ShowLuminance", true );
					break;
				case 5:	// Log10 Luma
					M.uniforms.SafeSet( "_UseBRDFColors", true );
					M.uniforms.SafeSet( "_ShowLuminance", true );
					M.uniforms.SafeSet( "_ShowLogLuma", true );
					break;
				case 6:	// 10 x Luma
					M.uniforms.SafeSet( "_UseBRDFColors", true );
					M.uniforms.SafeSet( "_ShowLuminance", true );
					M.uniforms.SafeSet( "_ShowX10", true );
					break;
				case 7:	// Chroma
					M.uniforms.SafeSet( "_UseBRDFColors", true );
					M.uniforms.SafeSet( "_ShowChroma2", true );
					break;
				}

				M.uniforms.SafeSet( "_ShowLogLumaGeometry", that.geometryType >= 5 );

				switch ( that.geometryType % 5 )
				{
				case	0:	// R
					M.uniforms.SafeSet( "_SeparateRGB", 0 );
					_Primitive.Use().Draw();
					break;
				case	1:	// G
					M.uniforms.SafeSet( "_SeparateRGB", 1 );
					_Primitive.Use().Draw();
					break;
				case	2:	// B
					M.uniforms.SafeSet( "_SeparateRGB", 2 );
					_Primitive.Use().Draw();
					break;
				case	3:	// Luma
					M.uniforms.SafeSet( "_SeparateRGB", -1 );
					_Primitive.Use().Draw();
					break;
				case	4:	// R+G+B
					M.uniforms.SafeSet( "_SeparateRGB", 0 );
					_Primitive.Use().Draw();
					M.uniforms.SafeSet( "_SeparateRGB", 1 );
					_Primitive.Use().Draw();
					M.uniforms.SafeSet( "_SeparateRGB", 2 );
					_Primitive.Use().Draw();
					break;
				}
			}

			that.material.Use( function( M )
			{
				M.uniforms._World2Proj.Set( that.camera.World2Proj );		// The most important projection matrix
				M.uniforms.SafeSet( "_Camera2World", that.camera.Camera2World );
				M.uniforms.SafeSet( "_LightDirection", LightDirection );

				var	SliceTexture = that.BRDF ? that.BRDF.getSliceTextureForViewport( that.viewport ) : null;
				M.uniforms.SafeSet( "_BRDFValid", SliceTexture != null );
				if ( SliceTexture )
					M.uniforms.SafeSet( "_TexBRDF", SliceTexture );

				M.uniforms.SafeSet( "_ShowMarker", that.markerVisible );
				M.uniforms.SafeSet( "_MarkerPosition", that.markerPosition );
				M.uniforms.SafeSet( "_ShowRefBRDF", false );

				DrawGeometry( M,that.primitive );

				// Draw reference BRDF geometry in alpha blend
				var	ReferenceBRDFSliceTexture = that.showRefBRDF && that.BRDF && that.BRDF.referenceBRDF ? that.BRDF.referenceBRDF.getSliceTextureForViewport( that.viewport ) : null;
				if ( !ReferenceBRDFSliceTexture )
					return;

				M.uniforms.SafeSet( "_TexBRDF", ReferenceBRDFSliceTexture );

				gl.enable( gl.BLEND );
				gl.disable( gl.DEPTH_TEST );
				gl.blendEquation( gl.FUNC_ADD );
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE );	// Pre-multiplied alpha
//				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );	// Alpha blending
				gl.blendFunc( gl.SRC_ALPHA, gl.ZERO );	// Choucourte blending

				M.uniforms.SafeSet( "_ShowRefBRDF", true );
				DrawGeometry( M,that.primitive );

				gl.enable( gl.DEPTH_TEST );
				gl.disable( gl.BLEND );
			} );

			//////////////////////////////////////////////////////////////////////////
			// Then render again in "wireframe"
			if ( that.showWireframe )
			{
				gl.depthFunc( gl.LEQUAL );
//				gl.disable( gl.DEPTH_TEST );

				that.materialWireframe.Use( function( M )
				{
					M.uniforms._World2Proj.Set( that.camera.World2Proj );		// The most important projection matrix
					M.uniforms.SafeSet( "_Camera2World", that.camera.Camera2World );
					M.uniforms.SafeSet( "_LightDirection", LightDirection );

					var	SliceTexture = that.BRDF ? that.BRDF.getSliceTextureForViewport( that.viewport ) : null;
					M.uniforms.SafeSet( "_BRDFValid", SliceTexture != null );
					if ( SliceTexture )
						M.uniforms.SafeSet( "_TexBRDF", SliceTexture );

					DrawGeometry( M,that.primitiveWireframe );
				} );
			}

			//////////////////////////////////////////////////////////////////////////
			// Render the helper lines for light & its reflection
			if ( true )
			{
				gl.lineWidth( 2.0 );	// Future proof, when the spec will be implemented it will be awesome!
				that.materialHelpers.Use( function( M )
				{
					M.uniforms.SafeSet( "_World2Proj", that.camera.World2Proj );

					// Render X,Y,Z
					M.uniforms.SafeSet( "_Color", new vec4( 1, 0, 0, 1 ) );
					M.uniforms.SafeSet( "_LightDirection", vec3.unitZ() );
					that.primitiveLightDirection.Use().Draw();
					M.uniforms.SafeSet( "_Color", new vec4( 0, 1, 0, 1 ) );
					M.uniforms.SafeSet( "_LightDirection", vec3.unitX() );
					that.primitiveLightDirection.Use().Draw();
					M.uniforms.SafeSet( "_Color", new vec4( 0, 0, 1, 1 ) );
					M.uniforms.SafeSet( "_LightDirection", vec3.unitY() );
					that.primitiveLightDirection.Use().Draw();

					// Render reflected vector
					M.uniforms.SafeSet( "_Color", new vec4( 0, 0.5, 1, 1 ) );
					M.uniforms.SafeSet( "_LightDirection", LightReflection );
					that.primitiveLightDirection.Use().Draw();

					// Render actual light vector
					M.uniforms.SafeSet( "_Color", new vec4( 1, 1, 0, 1 ) );
					M.uniforms.SafeSet( "_LightDirection", LightDirection );
					that.primitiveLightDirection.Use().Draw();
				} );
				gl.lineWidth( 1.0 );
			}

			//////////////////////////////////////////////////////////////////////////
			// Render in the tiny FBO for screen picking
			if ( that.FBOPicker )
			{
				that.FBOPicker.Bind();
//				gl.viewport( 0, 0, that.FBOPicker.width, that.FBOPicker.height );
				that.FBOPicker.Clear( 0, 0, 0, 1, 1 );
				that.material.Use( function( M )
				{
 					M.uniforms.SafeSet( "_RenderPickable", true );

					that.primitive.Use().Draw();
				} );


				that.FBOPicker.UnBind();
			}
		},

		// Update projection matrix on resize
		function( _Width, _Height )
		{
			that.camera.SetPerspective( that.FOV, _Width / _Height, 0.1, 100.0 );
			that.cameraManipulator.UpdateOrbitSpeed( 0.6 * _Width, 0.8 * _Height )
			that.cameraManipulator.UpdatePanSpeed( 0.8 * _Width, 1.2 * _Height )

			//////////////////////////////////////////////////////////////////////////
			// Create our small FBO where we'll render a tiny BRDF containing the Theta angles
			// This is so we can pick them up from the screen
			if ( that.FBOPicker )
			{
				that.FBOPicker.Destroy();
				that.FBOPicker = null;
			}
		} );
	}

	//////////////////////////////////////////////////////////////////////////
	// Helper that reads back our offscreen rendering of the BRDF 3D shape to retrieve the ThetaH/D and place the marker in the slice
	, __TempByteReadback : new Uint8Array( 4 )
	, SampleBRDFAnglesFromViewport : function( U, V )
	{
		var	gl = this.viewport.GetGL();

		if ( !this.FBOPicker )
		{
			this.FBOPicker = patapi.webgl.CreateFBO( "FBOPicker", 256, 256 * patapi.webgl.height / patapi.webgl.width, gl.RGBA, gl.CLAMP_TO_EDGE, gl.NEAREST, true );
			if ( !this.FBOPicker )
				return;
		}

		// Read back pixels
		var	X = U * this.FBOPicker.width;
		var	Y = (1.0-V) * this.FBOPicker.height;

		this.FBOPicker.Bind();
		gl.readPixels( X, Y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.__TempByteReadback );
		this.FBOPicker.UnBind();

		// Transform into angles
		var	ThetaH = this.__TempByteReadback[0] * Math.HALFPI / 255.0;
		var	ThetaD = this.__TempByteReadback[1] * Math.HALFPI / 255.0;

 		this.markerVisible = true;
 		this.setMarkerPosition( ThetaH, ThetaD );
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
	, NotifyMarkerChanged : function()	{ this.Notify( { type: "markerChanged" } ) }
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
		if ( _Event.type == "selection" )
			this.setBRDF( _Event.BRDF );
	}

	, OnBRDFEvent : function( _BRDF )
	{
		this.Render();
	}

	, OnPropertiesEditorChangedEvent : function( _Properties, _Event )
	{
		if ( _Event.type != "markerChanged" )
			return;

		if ( this.markerVisible != _Properties.markerVisible )
			this.setShowMarker( _Properties.markerVisible );
		this.setMarkerPosition( _Properties.markerPosition.x, _Properties.markerPosition.y );
	}

	, OnResize : function()
	{
		this.Render();
	}
};
