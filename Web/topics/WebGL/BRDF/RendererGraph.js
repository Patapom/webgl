/*
 Hosts the graph renderer control
 */

o3djs.provide( 'BRDF.RendererGraph' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'BRDF.GLViewport' );

RendererGraph = function( _canvas, _FOV )
{
	var	that = this;

	this.BRDF = null;
	this.visible = true;
	this.showWireframe = true;
	this.showGroundPlane = true;
	this.showLuminance = false;	// Show RGB
	this.showIsolines = false;
	this.showLogLuminance = false;
	this.showLuminanceX10 = false;
	this.separateRGB = false;

	// Create the GL viewport
	this.viewport = new GLViewport( "GraphViewport", _canvas );
	this.FOV = _FOV;

	var	gl = this.viewport.GetGL();
		gl.name = "GLRendererGraph";

	// Build our camera and light
	this.camera = new patapi.Camera( gl, "GraphRendererCamera", this.FOV, patapi.webgl.width / patapi.webgl.height, 0.1, 50.0 );
	this.camera.LookAt( new vec3( 0, 0, 2.5 ), vec3.zero(), vec3.unitY() );

	// Attach a camera manipulator
	this.cameraManipulator = new patapi.cameraOrbit( this.camera.Position, this.camera.Target,
		{
			Callback : function( _Manip )
			{
				_Manip.UpdateCamera( that.camera );
				that.Render();
			},
			AllowPan : true,
			DistanceMin : 1.2,
			DistanceMax : 8,
			PanBBoxMin : -4,
			PanBBoxMax : +4,
		} );
	this.cameraManipulator.AttachToEvents( this.viewport.canvas );
	this.cameraManipulator.UpdateOrbitSpeed( 0.6 * this.viewport.canvas.clientWidth, 0.8 * this.viewport.canvas.clientHeight )
	this.cameraManipulator.UpdatePanSpeed( 0.8 * this.viewport.canvas.clientWidth, 1.2 * this.viewport.canvas.clientHeight )

	//////////////////////////////////////////////////////////////////////////
	// Create our render materials
	{
		this.material = patapi.webgl.CreateShaderFromFile( "RenderGraph", "Shaders/RenderGraph.shader" );
		this.materialWireframe = patapi.webgl.CreateShaderFromFile( "RenderGraphWireframe", "Shaders/RenderGraphWireframe.shader" );
		this.materialGroundPlane = patapi.webgl.CreateShaderFromFile( "RenderGraphGroundPlane", "Shaders/RenderGraphGroundPlane.shader" );
		this.materialBackground = patapi.webgl.CreateShaderFromFile( "RenderGraphBackground", "Shaders/RenderGraphBackground.shader" );
	}

	//////////////////////////////////////////////////////////////////////////
	// Create our fullscreen quad
	this.screenQuad = patapi.webgl.CreateScreenQuad( this.materialBackground );

	// Create our graph mesh
	{
		var	Subdivisions = 90;
		var	Positions = new Array( 3*Subdivisions*Subdivisions );
		var	UVs = new Array( 2*Subdivisions*Subdivisions );

		// Build vertices
		var	OffsetPos = 0;
		var	OffsetUV = 0;
		for ( var Y=0; Y < Subdivisions; Y++ )
		{
			var	V = Y / (Subdivisions-1);
			for ( var X=0; X < Subdivisions; X++ )
			{
				var	U = X / (Subdivisions-1);

				Positions[OffsetPos++] = 2.0 * U - 1.0;
				Positions[OffsetPos++] = 0.0;
				Positions[OffsetPos++] = 2.0 * V - 1.0;

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
			var	StripsCount = Subdivisions-1;
			var	StripSize = 2*(Subdivisions+1);
			var	IndicesArray = new Array( StripSize * StripsCount );
			var	OffsetIndex = 0;
			for ( var StripIndex=0; StripIndex < StripsCount; StripIndex++ )
			{
				var	StripOffset0 = Subdivisions*(StripIndex+0);
				var	StripOffset1 = Subdivisions*(StripIndex+1);
				for ( var LineIndex=0; LineIndex < Subdivisions; LineIndex++ )
				{
					IndicesArray[OffsetIndex++] = StripOffset0++;	// Alternate from this strip line
					IndicesArray[OffsetIndex++] = StripOffset1++;	// to the next...
				}

				// Finally, add 2 degenerate vertices (a.k.a. retards) to nicely join with next strip
				IndicesArray[OffsetIndex++] = StripOffset1-1;
				IndicesArray[OffsetIndex++] = StripOffset0;
			}
			var	Indices = new Uint16Array( IndicesArray );
			this.primitive = patapi.webgl.CreatePrimitiveSynchronous( "Graph", this.material, Vertices, Indices, gl.TRIANGLE_STRIP );
		}

		// =======================
		// Build the wireframe version
		{
			var	IndicesArray = new Array( 4 * Subdivisions * (Subdivisions-1) );
			var	OffsetIndex = 0;
			for ( var Y=0; Y < Subdivisions; Y++ )
			{
				for ( var X=0; X < Subdivisions-1; X++ )
				{
					IndicesArray[OffsetIndex++] = Subdivisions*Y+X;
					IndicesArray[OffsetIndex++] = Subdivisions*Y+X+1;

					IndicesArray[OffsetIndex++] = Subdivisions*X+Y;
					IndicesArray[OffsetIndex++] = Subdivisions*(X+1)+Y;
				}
			}
			var	Indices = new Uint16Array( IndicesArray );

			this.primitiveWireframe = patapi.webgl.CreatePrimitiveSynchronous( "GraphWire", this.materialWireframe, Vertices, Indices, gl.LINES );
		}
	}

	//////////////////////////////////////////////////////////////////////////
	// Create the UI
	{
		$('#RenderGraphUI_ToggleLogLuminance').click( function()
		{
			that.setShowLogLuminance( !that.showLogLuminance );
		} )
		$('#RenderGraphUI_ToggleLuminanceX10').click( function()
		{
			that.setShowLuminanceX10( !that.showLuminanceX10 );
		} )
		$('#RenderGraphUI_ToggleSeparateRGB').click( function()
		{
			that.setSeparateRGB( !that.separateRGB );
		} )
		$('#RenderGraphUI_ToggleLuminanceOnly').click( function()
		{
			that.setShowLuminance( !that.showLuminance );
		} )
		$('#RenderGraphUI_ToggleIsoLines').click( function()
		{
			that.setShowIsolines( !that.showIsolines );
		} )
		$('#RenderGraphUI_ToggleWireframe').click( function()
		{
			that.setShowWireframe( !that.showWireframe );
		} )
		$('#RenderGraphUI_ToggleGroundPlane').click( function()
		{
			that.setShowGroundPlane( !that.showGroundPlane );
		} )
		$("#RenderGraphUI_ResetCamera").click( function() {
			that.cameraManipulator.MoveTarget( vec3.zero() );
		} );

		// Manage left-side toolbar
		this.isolateThetaD = false
		$('#RenderGraphUI_ToggleIsolateThetaD').click( function() {
			that.setIsolateThetaD( !that.isolateThetaD );
		} );
		this.isolateThetaH = false
		$('#RenderGraphUI_ToggleIsolateThetaH').click( function() {
			that.setIsolateThetaH( !that.isolateThetaH );
		} );

		this.isolatedThetaDValue = 0;
		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderGraphUI_Slider_IsolateThetaD .t0 span",
			selector : "#RenderGraphUI_Slider_IsolateThetaD .t1",
			sliderParams : { min: 0, max : 90, step : 1.0, value: this.isolatedThetaDValue },
			change : function( value, _OriginalText )
			{
				that.isolatedThetaDValue = value;
				that.Render();
			}
		 } );

		this.isolatedThetaHValue = 0;
		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderGraphUI_Slider_IsolateThetaH .t0 span",
			selector : "#RenderGraphUI_Slider_IsolateThetaH .t1",
			sliderParams : { min: 0, max : 90, step : 1.0, value: this.isolatedThetaHValue },
			change : function( value, _OriginalText )
			{
				that.isolatedThetaHValue = value;
				that.Render();
			}
		 } );
	}

	// Render once...
	this.ready = true;
	this.Render();
}

RendererGraph.prototype =
{
	Destroy : function()
	{
		this.setBRDF( null );	// Unsubscribe from events

		if ( this.material )			this.material.Destroy();
		if ( this.materialWireframe )	this.materialWireframe.Destroy();
		if ( this.materialGroundPlane )	this.materialGroundPlane.Destroy();
		if ( this.materialBackground )	this.materialBackground.Destroy();
		if ( this.primitive )			this.primitive.Destroy();
		if ( this.primitiveWireframe )	this.primitiveWireframe.Destroy();
	}

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
			this.BRDF.Subscribe( this, this.OnBRDFEvent );

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
	, setShowLogLuminance : function( value )
	{
		if ( value == this.showLogLuminance )
			return;

		this.showLogLuminance = value;
		this.Render();
	}
	, setShowLuminanceX10 : function( value )
	{
		if ( value == this.showLuminanceX10 )
			return;

		this.showLuminanceX10 = value;
		this.Render();
	}
	, setShowLuminance : function( value )
	{
		if ( value == this.showLuminance )
			return;

		this.showLuminance = value;
		this.Render();
	}
	, setShowIsolines : function( value )
	{
		if ( value == this.showIsolines )
			return;

		this.showIsolines = value;
		this.Render();
	}
	, setSeparateRGB : function( value )
	{
		if ( value == this.separateRGB )
			return;

		this.separateRGB = value;
		this.Render();
	}

	, setIsolateThetaD : function( value )
	{
		if ( value == this.isolateThetaD )
			return;

		this.isolateThetaD = value;
		$('#RenderGraphUI_Slider_IsolateThetaD').css( 'display', this.isolateThetaD ? 'block' : 'none' );

		if ( value )
			this.setIsolateThetaH( false );	// Also kill other isolations...
		this.Render();
	}

	, setIsolateThetaH : function( value )
	{
		if ( value == this.isolateThetaH )
			return;

		this.isolateThetaH = value;
		$('#RenderGraphUI_Slider_IsolateThetaH').css( 'display', this.isolateThetaH ? 'block' : 'none' );

		if ( value )
			this.setIsolateThetaD( false );	// Also kill other isolations...
		this.Render();
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

			that.material.Use( function( M )
			{
				M.uniforms._World2Proj.Set( that.camera.World2Proj );		// The most important projection matrix
				M.uniforms.SafeSet( "_Camera2World", that.camera.Camera2World );

				var	SliceTexture = that.BRDF ? that.BRDF.getSliceTextureForViewport( that.viewport ) : null;
				M.uniforms.SafeSet( "_BRDFValid", SliceTexture != null );
				if ( SliceTexture )
					M.uniforms.SafeSet( "_TexBRDF", SliceTexture );

				M.uniforms.SafeSet( "_ShowLogLuma", that.showLogLuminance )
				M.uniforms.SafeSet( "_ShowLumaX10", that.showLuminanceX10 )
				M.uniforms.SafeSet( "_ShowLuminance", that.showLuminance )
				M.uniforms.SafeSet( "_ShowIsolines", that.showIsolines )
				M.uniforms.SafeSet( "_ShowChroma", false )
				M.uniforms.SafeSet( "_ShowNormalized", false )

				M.uniforms.SafeSet( "_IsolateThetaD", that.isolateThetaD )
				M.uniforms.SafeSet( "_IsolateThetaH", that.isolateThetaH )
				M.uniforms.SafeSet( "_IsolatedThetaValue", (that.isolateThetaH ? that.isolatedThetaHValue : that.isolatedThetaDValue) / 90.0 )

				if ( that.showLuminance || !that.separateRGB )
				{
					M.uniforms.SafeSet( "_SeparateRGB", -1 )
					that.primitive.Use().Draw();
				}
				else
				{
					M.uniforms.SafeSet( "_SeparateRGB", 0 )
					that.primitive.Use().Draw();
					M.uniforms.SafeSet( "_SeparateRGB", 1 )
					that.primitive.Use().Draw();
					M.uniforms.SafeSet( "_SeparateRGB", 2 )
					that.primitive.Use().Draw();
				}
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

					var	SliceTexture = that.BRDF ? that.BRDF.getSliceTextureForViewport( that.viewport ) : null;
					M.uniforms.SafeSet( "_BRDFValid", SliceTexture != null );
					if ( SliceTexture )
						M.uniforms.SafeSet( "_TexBRDF", SliceTexture );

					M.uniforms.SafeSet( "_ShowLogLuma", that.showLogLuminance )
					M.uniforms.SafeSet( "_ShowLumaX10", that.showLuminanceX10 )
					M.uniforms.SafeSet( "_ShowLuminance", that.showLuminance )

					M.uniforms.SafeSet( "_IsolateThetaD", that.isolateThetaD )
					M.uniforms.SafeSet( "_IsolateThetaH", that.isolateThetaH )
					M.uniforms.SafeSet( "_IsolatedThetaValue", (that.isolateThetaH ? that.isolatedThetaHValue : that.isolatedThetaDValue) / 90.0 )

					if ( that.showLuminance || !that.separateRGB )
					{
						M.uniforms.SafeSet( "_SeparateRGB", -1 )
						that.primitiveWireframe.Use().Draw();
					}
					else
					{
						M.uniforms.SafeSet( "_SeparateRGB", 0 )
						that.primitiveWireframe.Use().Draw();
						M.uniforms.SafeSet( "_SeparateRGB", 1 )
						that.primitiveWireframe.Use().Draw();
						M.uniforms.SafeSet( "_SeparateRGB", 2 )
						that.primitiveWireframe.Use().Draw();
					}
				} );
			}
		},

		// Update projection matrix on resize
		function( _Width, _Height )
		{
			that.camera.SetPerspective( that.FOV, _Width / _Height, 0.1, 100.0 );
			that.cameraManipulator.UpdateOrbitSpeed( 0.6 * _Width, 0.8 * _Height )
			that.cameraManipulator.UpdatePanSpeed( 0.8 * _Width, 1.2 * _Height )
		} );
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

	, OnResize : function()
	{
		this.Render();
	}
};
