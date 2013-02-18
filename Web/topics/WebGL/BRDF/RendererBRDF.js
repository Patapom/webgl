/*
 Hosts the BRDF renderer control
 */

o3djs.provide( 'BRDF.RendererBRDF' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'patapi.camera_orbit' );
o3djs.require( 'BRDF.GLViewport' );

RendererBRDF = function( _canvas, _FOV )
{
	var	that = this;

	this.BRDF = null;
	this.FOV = _FOV;

	this.monteCarloSamplesCount = 32;	// 32 Samples per rendering pass

	this.lightType = 4;		// IBL
	this.convergenceRate = 0.025;
	this.keepSampling = true;
	this.primitiveType = false;	// Use teapot by default
	this.normalMapStrength = 0.0;

	// Light params
	this.lightIntensity = 1.0;
	this.lightPhi = 0.0;
	this.lightTheta = 0.0;
	this.anisotropy = new vec2( 1.0, 0.0 );

	// Point light
	this.lightDistance = 2.0;

	// Area light
	this.areaLightSize = 1.0;

	// Sky light
	this.skyType = 0;

	// IBL
	this.IBLImageIndex = -1;
	this.IBLImages = {};	// Key=Image Index, Value=Image as WebGLTexture

	// Tone mapping
	this.enableToneMapping = true;
	this.toneMappingOverbright = 1.5;
	this.toneMappingRange = 1.0;

	// Build the rendering viewport
	this.viewport = new GLViewport( "BRDFViewport", _canvas );

	var	gl = this.viewport.GetGL();
		gl.name = "GLRendererBRDF";

	// Build our camera
	this.camera = new patapi.Camera( gl, "BRDFRendererCamera", this.FOV, patapi.webgl.width / patapi.webgl.height, 0.1, 50.0 );
	this.camera.LookAt( new vec3( 0, 0, 3.2 ), vec3.zero(), vec3.unitY() );

	// Attach a camera manipulator
	this.cameraManipulator = new patapi.cameraOrbit( this.camera.Position, this.camera.Target,
		{
			Callback : function( _Manip )
			{
				_Manip.UpdateCamera( that.camera );
				that.NotifyChange();
			},
			AllowPan : true,
			DistanceMin : 1.2,
			DistanceMax : 8,
			PanBBoxMin : -2,
			PanBBoxMax : +2,
		} );
	this.cameraManipulator.AttachToEvents( this.viewport.canvas );
	this.cameraManipulator.UpdateOrbitSpeed( 0.6 * this.viewport.canvas.clientWidth, 0.8 * this.viewport.canvas.clientHeight )

	// Create our render materials
	{
		this.materialPointLight = patapi.webgl.CreateShaderFromFile( "RenderBRDF_Point", "Shaders/RenderBRDFPointLight.shader" );
		this.materialDirectionalLight = patapi.webgl.CreateShaderFromFile( "RenderBRDF_Directional", "Shaders/RenderBRDFDirectionalLight.shader" );
		this.materialAreaLight = patapi.webgl.CreateShaderFromFile( "RenderBRDF_Area", "Shaders/RenderBRDFAreaLight.shader", "#define LIGHT_TYPE0\n#define MC_SAMPLES_COUNT " + this.monteCarloSamplesCount );
		this.materialSkyLight = patapi.webgl.CreateShaderFromFile( "RenderBRDF_Sky", "Shaders/RenderBRDFAreaLight.shader", "#define LIGHT_TYPE1\n#define MC_SAMPLES_COUNT " + this.monteCarloSamplesCount );
		this.materialIBL = patapi.webgl.CreateShaderFromFile( "RenderBRDF_IBL", "Shaders/RenderBRDFAreaLight.shader", "#define LIGHT_TYPE2\n#define MC_SAMPLES_COUNT " + this.monteCarloSamplesCount );

		this.materialBackground = patapi.webgl.CreateShaderFromFile( "RenderBRDFBackground", "Shaders/RenderBRDFBackground.shader" );
		this.materialToneMapping = patapi.webgl.CreateShaderFromFile( "RenderBRDFToneMapping", "Shaders/RenderBRDFToneMapping.shader" );
		this.materialHelpers = patapi.webgl.CreateShaderFromFile( "RenderBRDFHelpers", "Shaders/RenderBRDFHelpers.shader" );
	}

	// Create our fullscreen quad
	this.screenQuad = patapi.webgl.CreateScreenQuad( this.materialBackground );

	// Clear temp FBOs so it gets created with the proper size the first time we render
	this.FBOTemp0 = null;
	this.FBOTemp1 = null;

	// Build our tiny 64x64 warp texture
	{
		patapi.helpers.LoadTypedArray( "./WarpTable.float", function( _URL, _ArrayBuffer )
		{
			var	View = new DataView( _ArrayBuffer );
			var	Pixels = new Float32Array( 64 * 64 * 4 );
			for ( var Y=0; Y < 64; Y++ )
				for ( var X=0; X < 64; X++ )
				{
					var	Scale = View.getFloat32( 4*(64*Y+X), true );
					Pixels[4*(64*Y+X)+0] = Scale;
					Pixels[4*(64*Y+X)+1] = Scale;
					Pixels[4*(64*Y+X)+2] = Scale;
					Pixels[4*(64*Y+X)+3] = 0.0;
				}

			var	gl = that.viewport.GetGL();	// Restore viewport's context

			that.textureWarp = patapi.webgl.CreateTextureFromArray( "WarpTexture", Pixels, 64, 64, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.LINEAR, true );
		} );
	}


	// Load the optional normal map
//	this.normalMap = patapi.webgl.LoadImageTexture( "NormalMap", "./NormalMap.jpg", gl.REPEAT, gl.LINEAR );
 	this.normalMap = patapi.webgl.LoadImageTexture( "NormalMap", "./NormalSquares.png", gl.REPEAT, gl.LINEAR );	//***
// 	this.normalMap = patapi.webgl.LoadImageTexture( "NormalMap", "./NormalMetal.png", gl.REPEAT, gl.LINEAR );	//
// 	this.normalMap = patapi.webgl.LoadImageTexture( "NormalMap", "./NormalPerlin.jpg", gl.REPEAT, gl.LINEAR );	//*
// 	this.normalMap = patapi.webgl.LoadImageTexture( "NormalMap", "./NormalDots.jpg", gl.REPEAT, gl.LINEAR );	//**
// 	this.normalMap = patapi.webgl.LoadImageTexture( "NormalMap", "./NormalStone.jpg", gl.REPEAT, gl.LINEAR );	//*
//	this.normalMap = patapi.webgl.LoadImageTexture( "NormalMap", "./NormalTurtle.png", gl.REPEAT, gl.LINEAR );	//***


	// Create our sphere mesh we will render with the BRDF
	{
		var	ThetaDivs = 80, PhiDivs = 160;
		var	UVScale = new vec2( 2.0, 1.0 );
		var	Positions = new Array( 3*ThetaDivs*PhiDivs );
		var	Tangents = new Array( 3*ThetaDivs*PhiDivs );
		var	UVs = new Array( 2*ThetaDivs*PhiDivs );

		// Build vertices
		var	OffsetPos = 0;
		var	OffsetTan = 0;
		var	OffsetUV = 0;
		for ( var Y=0; Y < ThetaDivs; Y++ )
		{
			var	V = Y / (ThetaDivs-1);
			var	Theta = Math.PI * V;
			for ( var X=0; X < PhiDivs; X++ )
			{
				var	U = X / (PhiDivs-1);
				var	Phi = Math.TWOPI * U;

				Positions[OffsetPos++] = Math.sin( Theta ) * Math.sin( Phi );
				Positions[OffsetPos++] = Math.cos( Theta );
				Positions[OffsetPos++] = Math.sin( Theta ) * Math.cos( Phi );

				Tangents[OffsetTan++] = Math.cos( Phi );
				Tangents[OffsetTan++] = 0.0;
				Tangents[OffsetTan++] = -Math.sin( Phi );

				UVs[OffsetUV++] = UVScale.x * U; UVs[OffsetUV++] = UVScale.y * V;
			}
		}

		var	Vertices = 
		{
			_vPosition : new Float32Array( Positions ),
			_vNormal : new Float32Array( Positions ),
			_vTangent : new Float32Array( Tangents ),
			_vUV : new Float32Array( UVs )
		};

		// Build indices
		var	StripsCount = ThetaDivs-1;
		var	StripSize = 2*(PhiDivs+1);
		var	IndicesArray = new Array( StripSize * StripsCount );
		var	OffsetIndex = 0;
		for ( var StripIndex=0; StripIndex < StripsCount; StripIndex++ )
		{
			var	StripOffset0 = PhiDivs*(StripIndex+0);
			var	StripOffset1 = PhiDivs*(StripIndex+1);
			for ( var LineIndex=0; LineIndex < PhiDivs; LineIndex++ )
			{
				IndicesArray[OffsetIndex++] = StripOffset0++;	// Alternate from this strip line
				IndicesArray[OffsetIndex++] = StripOffset1++;	// to the next...
			}

			// Finally, add 2 degenerate vertices (a.k.a. retards) to nicely join with next strip
			IndicesArray[OffsetIndex++] = StripOffset1-1;
			IndicesArray[OffsetIndex++] = StripOffset0;
		}
		var	Indices = new Uint16Array( IndicesArray );
		this.primitiveSphere = patapi.webgl.CreatePrimitiveSynchronous( "Sphere", this.materialPointLight, Vertices, Indices, gl.TRIANGLE_STRIP );
	}

	// Create our teapot from a JSON file
	{
		var	FileContent = patapi.helpers.LoadFileSynchronous( "./teapot.json" );
		var	JSON = eval( '(' + FileContent + ')' );

		var	Vertices =
		{
			_vPosition : new Float32Array( JSON.Primitives[0].VertexStreams[0].Value ),
			_vNormal : new Float32Array( JSON.Primitives[0].VertexStreams[1].Value ),
			_vTangent : new Float32Array( JSON.Primitives[0].VertexStreams[2].Value ),
			_vUV : new Float32Array( JSON.Primitives[0].VertexStreams[3].Value )
		}
		var	Indices = new Uint16Array( JSON.Primitives[0].IndexStream );
		this.primitiveTeapot = patapi.webgl.CreatePrimitiveSynchronous( "Teapot", this.materialPointLight, Vertices, Indices, gl.TRIANGLE_LIST );
	}

	// Create our helper primitives
	{
		var	Positions = vec3.array2Floats( [
			vec3.zero(), vec3.unitX(),
			vec3.zero(), vec3.unitY(), 
			vec3.zero(), vec3.unitZ() ] );
		var	Colors = vec3.array2Floats( [
			vec3.unitX(), vec3.unitX(),
			vec3.unitY(), vec3.unitY(),
			vec3.unitZ(), vec3.unitZ()
			 ] );
		var	Vertices2 = 
		{
			_vPosition : new Float32Array( Positions ),
			_vColor : new Float32Array( Colors )
		};
		var	Indices2 = new Uint16Array( [ 0, 1, 2, 3, 4, 5 ] );

		this.primitiveWorldFrame = patapi.webgl.CreatePrimitiveSynchronous( "WorldFrame", this.materialHelpers, Vertices2, Indices2, gl.LINES );

		Vertices2 = 
		{
			_vPosition : new Float32Array( [ 0, 0, 0, 1, 1, 1 ] ),
			_vColor : new Float32Array( [ 1, 1, 0, 1, 1, 0 ] )
		};
		Indices2 = new Uint16Array( [ 0, 1 ] );

		this.primitiveLightDirection = patapi.webgl.CreatePrimitiveSynchronous( "LightDirection", this.materialHelpers, Vertices2, Indices2, gl.LINES );
	}

	// Setup the UI
	this.SetupUI();

	// Render once...
	this.ready = true;

	this.setIBLImage( 4 );	// Load Uffizi (this will trigger a refresh...)

	// Subscribe to a regular update
	requestAnimFrame( function() { that.OnTimerUpdate( that ); } );
}

RendererBRDF.prototype =
{
	Destroy : function()
	{
		this.setBRDF( null );	// Unsubscribe from events

		if ( this.materialPointLight )	this.materialPointLight.Destroy();
		if ( this.materialDirectionalLight )	this.materialDirectionalLight.Destroy();
		if ( this.materialAreaLight )	this.materialAreaLight.Destroy();
		if ( this.materialSkyLight )	this.materialSkyLight.Destroy();
		if ( this.materialIBL )			this.materialIBL.Destroy();
		if ( this.materialBackground )	this.materialBackground.Destroy();
		if ( this.materialToneMapping )	this.materialToneMapping.Destroy();
		if ( this.materialHelpers )		this.materialHelpers.Destroy();
		if ( this.primitiveSphere )		this.primitiveSphere.Destroy();
		if ( this.primitiveTeapot )		this.primitiveTeapot.Destroy();
		if ( this.FBOTemp0 )			this.FBOTemp0.Destroy();
		if ( this.FBOTemp1 )			this.FBOTemp1.Destroy();

		// Destroy any loaded HDR image
		for ( var ImageIndex in this.IBLImages )
		{
			var	Texture = this.IBLImages[ImageIndex];
			Texture.gl.deleteTexture( Texture );
		}
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
		this.NotifyChange();
	}

	, setLightType : function( value )				{ this.lightType = value; this.NotifyChange(); }
	, setKeepSampling : function( value )			{ this.keepSampling = value; this.NotifyChange( false ); }
	, setEnableToneMapping : function( value )		{ this.enableToneMapping = value; this.NotifyChange( false ); }
	, setToneMappingRange : function( value )		{ this.toneMappingRange = value; this.NotifyChange( false ); }
	, setToneMappingOverBright : function( value )	{ this.toneMappingOverbright = value; this.NotifyChange( false ); }
	, setLightTheta : function( value )				{ this.lightTheta = value; this.NotifyChange(); }
	, setLightPhi : function( value )				{ this.lightPhi = value; this.NotifyChange(); }
	, setLightDistance : function( value )			{ this.lightDistance = value; this.NotifyChange(); }
	, setSkyType : function( value )				{ this.skyType = value; this.NotifyChange(); }
	, setPrimitiveType : function( value )			{ this.primitiveType = value; this.NotifyChange(); }
	, setNormalMapStrength : function( value )		{ this.normalMapStrength = value; this.NotifyChange(); }
	, setIBLImage : function( value )
	{
		if ( value == this.IBLImageIndex )
			return;

		this.IBLImageIndex = value;

		if ( this.IBLImages[this.IBLImageIndex] )
		{	// We already have it...
			this.NotifyChange();
			return;
		}

		// Load the huge HDR env map
		var	ImagePaths = [
			"./EnvMaps/doge2_1024x512.float",		// Source: http://gl.ict.usc.edu/Data/HighResProbes/
			"./EnvMaps/ennis_1024x512.float",
			"./EnvMaps/grace-new_1024x512.float",
			"./EnvMaps/pisa_1024x512.float",
			"./EnvMaps/uffizi-large_1024x512.float",
		];
		if ( this.IBLImageIndex < 0 || this.IBLImageIndex >= ImagePaths.length )
		{	// We don't have this!
			var	Error = "IBL image index out of range!";
			UpdateStatusError( Error );
			throw Error;
		}

		var	that = this;
		patapi.helpers.LoadTypedArray( ImagePaths[this.IBLImageIndex], function( _URL, _ArrayBuffer )
		{
			var	Width = 1024, Height = 512;
			var	View = new DataView( _ArrayBuffer );
			var	Pixels = new Float32Array( Width * Height * 4 );
			for ( var Y=0; Y < Height; Y++ )
				for ( var X=0; X < Width; X++ )
				{
					var	R = View.getFloat32( 4*(3*(Width*Y+X)+0), true );
					var	G = View.getFloat32( 4*(3*(Width*Y+X)+1), true );
					var	B = View.getFloat32( 4*(3*(Width*Y+X)+2), true );
					Pixels[4*(Width*Y+X)+0] = R;
					Pixels[4*(Width*Y+X)+1] = G;
					Pixels[4*(Width*Y+X)+2] = B;
					Pixels[4*(Width*Y+X)+3] = 0.0;
				}

			var	gl = that.viewport.GetGL();	// Restore viewport's context

			var	HDRTexture = patapi.webgl.CreateTextureFromArray( "HDREnvMap", Pixels, Width, Height, gl.RGBA_FLOAT, gl.REPEAT, gl.LINEAR, true );
				HDRTexture.gl = gl;

			that.IBLImages[value] = HDRTexture;

			// Refresh...
			that.NotifyChange();
		} );
	}


	//////////////////////////////////////////////////////////////////////////
	, passIndex : 0
	, Render : function()
	{
		if ( !this.ready )
			return;

		var	that = this;

		this.viewport.Render( 0.1,
		function( gl, _Time, _DeltaTime )
		{
			// Rebuild FBO if none is set
			if ( !that.FBOTemp0 )
				that.FBOTemp0 = patapi.webgl.CreateFBO( "FBOTempHDR0", patapi.webgl.width, patapi.webgl.height, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.NEAREST, true );
			if ( !that.FBOTemp1 )
				that.FBOTemp1 = patapi.webgl.CreateFBO( "FBOTempHDR1", patapi.webgl.width, patapi.webgl.height, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.NEAREST, that.FBOTemp0.depthBuffer );

			// Setup default states
//			gl.enable( gl.CULL_FACE );
//			gl.cullFace( gl.BACK );
 			gl.disable( gl.CULL_FACE );

			if ( that.viewDirty )
			{
				gl.disable( gl.DEPTH_TEST );

				// Clear frame buffers
				that.FBOTemp0.Bind();
				that.materialBackground.Use( function( M ) { that.screenQuad.Use().Draw(); } );
				that.FBOTemp1.Bind();
				that.materialBackground.Use( function( M ) { that.screenQuad.Use().Draw(); } );
				patapi.webgl.ClearDepth();

				// This is our first pass!
				that.passIndex = 0;
				that.viewDirty = false;
			}

			var	LightDirection = new vec3(	Math.sin( that.lightTheta ) * Math.sin( that.lightPhi ),
											Math.cos( that.lightTheta ),
											Math.sin( that.lightTheta ) * Math.cos( that.lightPhi ) );

			var	LightPosition = LightDirection.mul_( that.lightDistance );

			// Render our primitive with our shader
			that.FBOTemp1.Bind();

			gl.depthFunc( gl.LEQUAL );
			gl.enable( gl.DEPTH_TEST );

			var	Material = null;
			switch ( that.lightType )
			{
			case 0: Material = that.materialPointLight; break;
			case 1: Material = that.materialDirectionalLight; break;
			case 2: Material = that.materialAreaLight; break;
			case 3: Material = that.materialSkyLight; break;
			case 4: Material = that.materialIBL; break;
			}

			Material.Use( function( M )
			{
				M.uniforms._World2Proj.Set( that.camera.World2Proj );		// The most important projection matrix
				M.uniforms.SafeSet( "_Camera2World", that.camera.Camera2World );
				if ( that.textureWarp )
					M.uniforms.SafeSet( "_TexWarp", that.textureWarp );
				
				M.uniforms.SafeSet( "_dUV", that.FBOTemp0.getdUV3() );
				M.uniforms.SafeSet( "_TexPreviousImage", that.FBOTemp0.texture );
				M.uniforms.SafeSet( "_ConvergenceRate", that.convergenceRate );
				M.uniforms.SafeSet( "_PassIndex", that.passIndex++ );
				M.uniforms.SafeSet( "_Anisotropy", new vec3( that.anisotropy.x, Math.cos( that.anisotropy.y ), Math.sin( that.anisotropy.y ) ) );

				var	MaxRandom = 1280000;
				var	Random0 = that.monteCarloSamplesCount * that.passIndex;
				var	Random1 = (Random0 / MaxRandom) | 0;
					Random0 %= MaxRandom;
				M.uniforms.SafeSet( "_Random0", Random0 );
				M.uniforms.SafeSet( "_Random1", Random1 );

				M.uniforms.SafeSet( "_LightIntensity", that.lightIntensity );

				switch ( that.lightType )
				{
				case 0:	// Point light parameters
					M.uniforms.SafeSet( "_LightPosition", LightPosition );
					break;

				case 1:	// Directional light parameters
					M.uniforms.SafeSet( "_LightDirection", LightDirection );
					break;

				case 2:	// Area light parameters
					M.uniforms.SafeSet( "_AreaLightSize", that.areaLightSize );

					var	LightX = new vec3( 
							Math.cos( that.lightPhi ),
							0.0,
							-Math.sin( that.lightPhi )
						);
					var	LightY = LightX.cross( LightDirection );

					M.uniforms.SafeSet( "_LightPosition", LightPosition );
					M.uniforms.SafeSet( "_LightX", LightX );
					M.uniforms.SafeSet( "_LightY", LightY );
					M.uniforms.SafeSet( "_LightDirection", LightDirection );
					break;

				case 3:	// Sky light parameters
					M.uniforms.SafeSet( "_SunDirection", LightDirection );

					// Values from http://mathinfo.univ-reims.fr/IMG/pdf/CIE_DS011_2.pdf Table 1.
					//
					var	a = 4.0, b = -0.70, c = 0.0, d = -1.0, e = 0.0;	// Standard overcast sky
					if ( that.skyType == 1 )
					{	// Standard clear sky
						a = -1.0; b = -0.32; c = 10.0; d = -3.0; e = 0.45;
					}
					else if ( that.skyType == 2 )
					{	// Bli sky
						a = 0.0; b = -1.0; c = 5.0; d = -2.5; e = 0.3;
					}

					M.uniforms.SafeSet( "_SkyParams0", a, b, c, d );
					M.uniforms.SafeSet( "_SkyParams1", e, 0, 0, 0 );
					break;

				case 4:	// IBL
					if ( that.IBLImages[that.IBLImageIndex] )
						M.uniforms.SafeSet( "_TexHDREnvMap", that.IBLImages[that.IBLImageIndex] );
					M.uniforms.SafeSet( "_EnvMapPhi", that.lightPhi );
					break;
				}

				// Send the BRDF
				var	TextureBRDF = that.BRDF ? that.BRDF.getSliceTextureForViewport( that.viewport ) : null;
				M.uniforms.SafeSet( "_BRDFValid", TextureBRDF != null );
				if ( TextureBRDF )
				{
					M.uniforms.SafeSet( "_TexBRDF", TextureBRDF );

					// Upload rendering parameters
					M.uniforms.SafeSet( "_Exposure", that.BRDF.exposure );
					M.uniforms.SafeSet( "_SquareThetaH", that.BRDF.squareThetaH );
					M.uniforms.SafeSet( "_ShowLogLuma", that.BRDF.showLogLuma );
					M.uniforms.SafeSet( "_ShowChroma", that.BRDF.showChroma );
					M.uniforms.SafeSet( "_ShowNormalized", false );
				}

				// Send the normal map
				M.uniforms.SafeSet( "_NormalStrength", that.normalMapStrength );
				M.uniforms.SafeSet( "_TexNormalMap", that.normalMap );

				// Render the primitive
				var	Prim = that.primitiveType ? that.primitiveSphere : that.primitiveTeapot;
					Prim.Use().Draw();
			} );

			// Render the light helper
			if ( that.lightType != 4 )
				that.materialHelpers.Use( function( M )
				{
					M.uniforms.SafeSet( "_World2Proj", that.camera.World2Proj );
					M.uniforms.SafeSet( "_DrawLight", true );
					M.uniforms.SafeSet( "_LightDirection", LightDirection );
					that.primitiveLightDirection.Use().Draw();
				} );

			that.FBOTemp1.UnBind();

			// Swap buffers
			var	Temp = that.FBOTemp0;
			that.FBOTemp0 = that.FBOTemp1;
			that.FBOTemp1 = Temp;

			// Apply tone mapping
			gl.disable( gl.DEPTH_TEST );
			that.materialToneMapping.Use( function( M )
			{
				M.uniforms.SafeSet( "_TexImageHDR", that.FBOTemp0.texture );
				M.uniforms.SafeSet( "_Gamma", that.BRDF ? that.BRDF.gamma : 1.0 );

				M.uniforms.SafeSet( "_Enabled", that.enableToneMapping );
				M.uniforms.SafeSet( "_Overbright", that.toneMappingOverbright );
				M.uniforms.SafeSet( "_Range", that.toneMappingRange );

				M.uniforms.SafeSet( "_RayBasis", that.camera.rayBasis );
				if ( that.lightType == 4 && that.IBLImages[that.IBLImageIndex] )
				{	// Enable HDR envmap as background
					M.uniforms.SafeSet( "_ShowEnvMap", true );
					M.uniforms.SafeSet( "_Camera2World", that.camera.Camera2World );
					M.uniforms.SafeSet( "_TexHDREnvMap", that.IBLImages[that.IBLImageIndex] );
					M.uniforms.SafeSet( "_EnvMapPhi", that.lightPhi );
					M.uniforms.SafeSet( "_LightIntensity", that.lightIntensity );
				}
				else
					M.uniforms.SafeSet( "_ShowEnvMap", false );

// Just a test to try and get back original luminance by taking the 10^log10(luminance)
// I think it actually reduces variance but also fortunately lacks super bright specular spots
// Anyway, that's an idea worth digging: do all computations in log space and exponentiate result again...
//
// if ( that.BRDF )
// 	M.uniforms.SafeSet( "_PatchLog10", that.BRDF.showLogLuma );

				that.screenQuad.Use().Draw();
			} );

			// Render the frame helper
			that.materialHelpers.Use( function( M )
			{
				M.uniforms.SafeSet( "_World2Camera", that.camera.World2Camera );
				M.uniforms.SafeSet( "_World2Proj", that.camera.World2Proj );
				M.uniforms.SafeSet( "_AspectRatio", that.camera.AspectRatio );
				M.uniforms.SafeSet( "_DrawLight", false );

				that.primitiveWorldFrame.Use().Draw();
			} );
		},

		// Update projection matrix on resize
		function( _Width, _Height )
		{
			that.camera.SetPerspective( that.FOV, _Width / _Height, 0.1, 100.0 );
			that.cameraManipulator.UpdateOrbitSpeed( 0.6 * _Width, 0.8 * _Height )
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
		this.NotifyChange();
	}

	, OnResize : function()
	{
		// Destroy the FBO so it will be recreated on next render
		if ( this.FBOTemp0 )
			this.FBOTemp0.Destroy();
		if ( this.FBOTemp1 )
			this.FBOTemp1.Destroy();
		this.FBOTemp0 = null;
		this.FBOTemp1 = null;

		this.NotifyChange();
	}

	, OnTimerUpdate : function( _This )
	{
		requestAnimFrame( function() { _This.OnTimerUpdate( _This ); } );

		if ( !_This.keepSampling )
			return;
		if ( _This.lightType == 0 )
			return;

		// Ugly => tests the global visibility flag set & cleared by onfocus/onblur events in the main page
		if ( g_Visible !== undefined && !g_Visible )
			return;
		
		_This.Render( true );
	}

	, NotifyChange : function( opt_Dirty )
	{
		if ( opt_Dirty === undefined )
			opt_Dirty = true;

		this.viewDirty = opt_Dirty;
		this.Render();
	}

	//////////////////////////////////////////////////////////////////////////
	// UI
	, SetupUI : function()
	{
		var	that = this;

		$("#RenderBRDFUI_ResetCamera").click( function() {
			that.cameraManipulator.MoveTarget( vec3.zero() );
		} );
		
		new patapi.ui.LabelCheckBox( {
			selector : "#RenderBRDFUI_TogglePrimitive",
			value : this.primitiveType,
			change : function( value )
			{
				that.setPrimitiveType( value );
			}
		} );
		
		//////////////////////////////////////////////////////////////////////////
		// Normal Map UI
		this.UICheckBoxToggleNormalMap = new patapi.ui.LabelCheckBox( {
			selector : "#RenderBRDFUI_ToggleNormalMapUI",
			value : false,
			change : function( value )
			{
				if ( value )
				{
					$( "#RenderBRDF_UIWidgetsNormalMap" ).css( "display", "block" );
					that.UICheckBoxToggleLighting.set( false );	// Hide everything else
					that.UICheckBoxToggleToneMapping.set( false );
				}
				else
					$( "#RenderBRDF_UIWidgetsNormalMap" ).css( "display", "none" );
			}
		} );

		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_NormalMapStrength .t0 span",
			selector : "#RenderBRDFUI_Slider_NormalMapStrength .t1",
			sliderParams : { min: 0, max : 1, step : 0.01, value: this.normalMapStrength },
			change : function( value, _OriginalText )
			{
				that.setNormalMapStrength( value );
				return _OriginalText + " (" + that.normalMapStrength.toFixed( 2 ) + ")";	// Update text
			}
		 } );

		//////////////////////////////////////////////////////////////////////////
		// Lighting UI
		this.UICheckBoxToggleLighting = new patapi.ui.LabelCheckBox( {
			selector : "#RenderBRDFUI_ToggleLightingUI",
			value : false,	// UI is hidden by default
			change : function( value )
			{
				if ( value )
				{
					$( "#RenderBRDF_UIWidgetsLighting" ).css( "display", "block" );
					that.UICheckBoxToggleToneMapping.set( false );	// Hide everything else
					that.UICheckBoxToggleNormalMap.set( false );
				}
				else
					$( "#RenderBRDF_UIWidgetsLighting" ).css( "display", "none" );
			}
		} );

		new patapi.ui.LabelRadioButtons( {
			selector : "#RenderBRDFUI_Radio_LightType",
			value : this.lightType,
			change : function( value )
			{
				that.setLightType( value );
//				$("#RenderBRDFUI_LightParameters").css( "display", that.lightType != 4 ? "inherit" : "none" );	// Hide light controls if IBL
				$("#RenderBRDFUI_Slider_LightTheta").css( "display", that.lightType != 4 ? "inherit" : "none" );	// Hide light theta if IBL
				$("#RenderBRDFUI_MonteCarloIntegration").css( "display", that.lightType > 1 ? "inherit" : "none" );	// Hide advanced controls if simple point light
				$("#RenderBRDFUI_PointLight").css( "display", that.lightType == 0 || that.lightType == 2 ? "inherit" : "none" );	// Hide advanced controls if not an point or area light
				$("#RenderBRDFUI_AreaLight").css( "display", that.lightType == 2 ? "inherit" : "none" );	// Hide advanced controls if not an area light
				$("#RenderBRDFUI_SkyLight").css( "display", that.lightType == 3 ? "inherit" : "none" );	// Hide advanced controls if not a sky light
				$("#RenderBRDFUI_IBL").css( "display", that.lightType == 4 ? "inherit" : "none" );	// Hide advanced controls if not IBL
			}
		} );

		// Monte Carlo integration
		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_ConvergenceRate .t0 span",
			selector : "#RenderBRDFUI_Slider_ConvergenceRate .t1",
			sliderParams : { min: -3, max : 0, step : 0.01, value: Math.log( this.convergenceRate ) * Math.LOG10E },
			change : function( value, _OriginalText )
			{
				that.convergenceRate = Math.pow( 10.0, value );
				that.Render();

				return _OriginalText + " (" + that.convergenceRate.toFixed( 4 ) + ")";	// Update text
			}
		 } );

		new patapi.ui.LabelCheckBox( {
			selector : "#RenderBRDFUI_Checkbox_KeepSampling .t1 span",
			value : this.keepSampling,
			change : function( value )
			{
				that.keepSampling = value;
				that.Render();
			}
		} );


		//////////////////////////////////////////////////////////////////////////
		// Light UI
		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_LightIntensity .t0 span",
			selector : "#RenderBRDFUI_Slider_LightIntensity .t1",
			sliderParams : { min: 0, max : 10, step : 0.01, value: this.lightIntensity },
			change : function( value, _OriginalText )
			{
				that.lightIntensity = value;
				that.Render();

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_LightTheta .t0 span",
			selector : "#RenderBRDFUI_Slider_LightTheta .t1",
			sliderParams : { min: 0, max : 180, step : 0.01, value: Math.rad2deg( this.lightTheta ) },
			change : function( value, _OriginalText )
			{
				that.setLightTheta( Math.deg2rad( value ) );
				return _OriginalText + " (" + value + "°)";	// Update text
			}
		 } );

		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_LightPhi .t0 span",
			selector : "#RenderBRDFUI_Slider_LightPhi .t1",
			sliderParams : { min: -180, max : 180, step : 0.01, value: Math.rad2deg( this.lightPhi ) },
			change : function( value, _OriginalText )
			{
				that.setLightPhi( Math.deg2rad( value ) );
				return _OriginalText + " (" + value + "°)";	// Update text
			}
		 } );


		// Point+Area Ligt		
		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_LightDistance .t0 span",
			selector : "#RenderBRDFUI_Slider_LightDistance .t1",
			sliderParams : { min: 1, max : 10, step : 0.01, value: this.lightDistance },
			change : function( value, _OriginalText )
			{
				that.setLightDistance( value );
				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );


		// Area Light
		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_AreaLightSize .t0 span",
			selector : "#RenderBRDFUI_Slider_AreaLightSize .t1",
			sliderParams : { min: 0, max : 10, step : 0.01, value: this.areaLightSize },
			change : function( value, _OriginalText )
			{
				that.areaLightSize = value;
				that.Render();

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		// Sky light
		new patapi.ui.LabelRadioButtons( {
			selector : "#RenderBRDFUI_Radio_SkyType",
			value : this.skyType,
			change : function( value )
			{
				that.setSkyType( value );
			}
		} );

		// IBL
		new patapi.ui.LabelRadioButtons( {
			selector : "#RenderBRDFUI_Radio_IBLImage",
			value : this.IBLImageIndex,
			change : function( value )
			{
				that.setIBLImage( value );
			}
		} );


		// Anisotropy (DEBUG)
		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_Anisotropy .t0 span",
			selector : "#RenderBRDFUI_Slider_Anisotropy .t1",
			sliderParams : { min: -2, max : 0, step : 0.01, value: Math.log( this.anisotropy.x ) * Math.LOG10E },
			change : function( value, _OriginalText )
			{
				that.anisotropy.x = Math.pow( 10.0, value );
				that.NotifyChange();

				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );
		
		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_AnisotropyAngle .t0 span",
			selector : "#RenderBRDFUI_Slider_AnisotropyAngle .t1",
			sliderParams : { min: -180, max : 180, step : 0.01, value: Math.rad2deg( this.anisotropy.y ) },
			change : function( value, _OriginalText )
			{
				that.anisotropy.y = Math.deg2rad( value );
				that.NotifyChange();

				return _OriginalText + " (" + value + "°)";	// Update text
			}
		 } );


		//////////////////////////////////////////////////////////////////////////
		// Tone Mapping UI
		this.UICheckBoxToggleToneMapping = new patapi.ui.LabelCheckBox( {
			selector : "#RenderBRDFUI_ToggleToneMappingUI",
			value : false,	// UI is hidden by default
			change : function( value )
			{
				if ( value )
				{
					$( "#RenderBRDF_UIWidgetsToneMapping" ).css( "display", "block" );
					that.UICheckBoxToggleLighting.set( false );	// Hide everything else
					that.UICheckBoxToggleNormalMap.set( false );
				}
				else
					$( "#RenderBRDF_UIWidgetsToneMapping" ).css( "display", "none" );
			}
		} );

		new patapi.ui.LabelCheckBox( {
			selector : "#RenderBRDFUI_Checkbox_EnableToneMapping .t1 span",
			value : this.enableToneMapping,
			change : function( value )
			{
				that.setEnableToneMapping( value );
			}
		} );

		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_ToneMappingRange .t0 span",
			selector : "#RenderBRDFUI_Slider_ToneMappingRange .t1",
			sliderParams : { min: 0.0, max : 4.0, value: this.toneMappingRange },
			change : function( value, _OriginalText )
			{
				that.setToneMappingRange( value );
				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );

		new patapi.ui.LabelSlider( {
			labelSelector : "#RenderBRDFUI_Slider_ToneMappingOverbright .t0 span",
			selector : "#RenderBRDFUI_Slider_ToneMappingOverbright .t1",
			sliderParams : { min: 0.0, max : 4.0, value: this.toneMappingOverbright },
			change : function( value, _OriginalText )
			{
				that.setToneMappingOverBright( value );
				return _OriginalText + " (" + value + ")";	// Update text
			}
		 } );
	}
};
