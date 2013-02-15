//////////////////////////////////////////////////////////////////////////
// This file contains a glow post-process
//////////////////////////////////////////////////////////////////////////
//
o3djs.provide( 'patapi.glow_light_shafts' );

o3djs.require( 'patapi' );
o3djs.require( 'patapi.math' )
o3djs.require( 'patapi.webgl' );

// Add the postprocess extension
patapi.postprocess = patapi.postprocess || {};


//////////////////////////////////////////////////////////////////////////
// Creates a glow post-process
//	_ShadersPath, the path to the patapi shaders
//
patapi.postprocess.CreateGlow = function( gl, _Width, _Height, _ShadersPath )
{
	return new patapi.PostProcessGlow( gl, _Width, _Height, _ShadersPath );
}

//////////////////////////////////////////////////////////////////////////
// The Scene object
patapi.PostProcessGlow = function( gl, _Width, _Height, _ShadersPath )
{
	this.gl = gl;
	this.width = _Width;
	this.height = _Height;

	// Default parameters
	this.backgroundStrength = 1.0;
	this.glowSourceAttenuation = 1.0;
	this.glowStrength = 1.0;
	this.lightShaftsStrength = 1.0;
	this.lightShaftsDecayRate = 4.0;
	this.exposure = 1.0;
	this.gamma = 1.0;


	//////////////////////////////////////////////////////////////////////////
	// Create our shaders
	{	// Downsampling
		var	VS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowDownsample.vs" );
		var	PS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowDownsample.ps" );
		this.shaderDownsample = patapi.webgl.CreateShader( "GlowDownsample", VS, PS );
	}
	{	// Upsampling
		var	VS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowUpsample.vs" );
		var	PS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowUpsample.ps" );
		this.shaderUpsample = patapi.webgl.CreateShader( "GlowUpsample", VS, PS );
	}
	{	// Emissive masking
		var	VS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowMaskEmissive.vs" );
		var	PS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowMaskEmissive.ps" );
		this.shaderMaskEmissive = patapi.webgl.CreateShader( "GlowMaskEmissive", VS, PS );
	}
	{	// Light shafts
		var	VS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowLightShafts.vs" );
		var	PS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowLightShafts.ps" );
		this.shaderLightShafts = patapi.webgl.CreateShader( "GlowLightShafts", VS, PS );
	}
	{	// Combination
		var	VS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowCombine.vs" );
		var	PS = patapi.helpers.LoadFileSynchronous( _ShadersPath + "PPGlowCombine.ps" );
		this.shaderCombine = patapi.webgl.CreateShader( "GlowCombine", VS, PS );
	}

	//////////////////////////////////////////////////////////////////////////
	// Create our internal FBOs for downsampling & gaussian blur
	var	W = Math.floor( _Width / 2 );
	var	H = Math.floor( _Height / 2 );
	this.FBODownsample2X = patapi.webgl.CreateFBO( "GlowDownsample2X", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );

	W = Math.floor(W / 2);	H = Math.floor(H / 2);
	this.FBODownsample4X = patapi.webgl.CreateFBO( "GlowDownsample4X", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );
	this.FBODownsample4X_Masked = patapi.webgl.CreateFBO( "GlowDownsample4X_Masked", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );
	// Light-shafts ping-pong
	this.FBODownsample4X_LightShaft = [
					patapi.webgl.CreateFBO( "GlowDownsample4X_LightShaft0", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR ),
					patapi.webgl.CreateFBO( "GlowDownsample4X_LightShaft1", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR ) ];

	W = Math.floor(W / 2);	H = Math.floor(H / 2);
	this.FBODownsample8X = patapi.webgl.CreateFBO( "GlowDownsample8X", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );
//	this.FBODownsample8X_2 = patapi.webgl.CreateFBO( "GlowDownsample8X_2", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );

	W = Math.floor(W / 2);	H = Math.floor(H / 2);
	this.FBODownsample16X = patapi.webgl.CreateFBO( "GlowDownsample16X", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );

	W = Math.floor(W / 2);	H = Math.floor(H / 2);
	this.FBODownsample32X = patapi.webgl.CreateFBO( "GlowDownsample32X", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );

	W = Math.floor(W / 2);	H = Math.floor(H / 2);
	this.FBODownsample64X = patapi.webgl.CreateFBO( "GlowDownsample64X", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );
//	this.FBODownsample64X_2 = patapi.webgl.CreateFBO( "GlowDownsample64X_2", W, H, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR );

	// Then upsampling...
	this.FBOUpsample32X = [	patapi.webgl.CreateFBO( "GlowUpsample32X_H", this.FBODownsample32X.width, this.FBODownsample64X.height, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR ),
							patapi.webgl.CreateFBO( "GlowUpsample32X_V", this.FBODownsample32X.width, this.FBODownsample32X.height, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR ) ];
	this.FBOUpsample16X = [ patapi.webgl.CreateFBO( "GlowUpsample16X_H", this.FBODownsample16X.width, this.FBODownsample32X.height, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR ),
							patapi.webgl.CreateFBO( "GlowUpsample16X_V", this.FBODownsample16X.width, this.FBODownsample16X.height, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR ) ];
	this.FBOUpsample8X  = [ patapi.webgl.CreateFBO( "GlowUpsample8X_H", this.FBODownsample8X.width, this.FBODownsample16X.height, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR ),
							patapi.webgl.CreateFBO( "GlowUpsample8X_V", this.FBODownsample8X.width, this.FBODownsample8X.height, gl.RGBA, gl.CLAMP_TO_EDGE, gl.LINEAR ) ];


	//////////////////////////////////////////////////////////////////////////
	// Create our quad primitive
	var	Vertices = new Float32Array( [
		-1.0, +1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0, 1.0,
		+1.0, +1.0, 1.0, 1.0,
		+1.0, -1.0, 1.0, 1.0,
	 ] );
	var	Indices = new Uint16Array( [ 0, 1, 2, 3 ]);
	this.screenQuad = patapi.webgl.CreatePrimitiveSynchronous( "ScreenQuad", this.shaderCombine, { _vPosition : Vertices }, Indices, this.gl.TRIANGLE_STRIP );
}

patapi.PostProcessGlow.prototype =
{
	Destroy : function()
	{
		if ( this.screenQuad )
			this.screenQuad.Destroy();

		if ( this.FBOUpsample32X[0] )
			this.FBOUpsample32X[0].Destroy();
		if ( this.FBOUpsample32X[1] )
			this.FBOUpsample32X[1].Destroy();
		if ( this.FBOUpsample16X[0] )
			this.FBOUpsample16X[0].Destroy();
		if ( this.FBOUpsample16X[1] )
			this.FBOUpsample16X[1].Destroy();
		if ( this.FBOUpsample8X[0] )
			this.FBOUpsample8X[0].Destroy();
		if ( this.FBOUpsample8X[1] )
			this.FBOUpsample8X[1].Destroy();

		if ( this.FBODownsample2X )
			this.FBODownsample2X.Destroy();
		if ( this.FBODownsample4X )
			this.FBODownsample4X.Destroy();
		if ( this.FBODownsample4X_Masked )
			this.FBODownsample4X_Masked.Destroy();
		if ( this.FBODownsample4X_LightShaft[0] )
			this.FBODownsample4X_LightShaft[0].Destroy();
		if ( this.FBODownsample4X_LightShaft[1] )
			this.FBODownsample4X_LightShaft[1].Destroy();
		if ( this.FBODownsample8X )
			this.FBODownsample8X.Destroy();
// 		if ( this.FBODownsample8X_2 )
// 			this.FBODownsample8X_2.Destroy();
		if ( this.FBODownsample16X )
			this.FBODownsample16X.Destroy();
		if ( this.FBODownsample32X )
			this.FBODownsample32X.Destroy();
		if ( this.FBODownsample64X )
			this.FBODownsample64X.Destroy();
// 		if ( this.FBODownsample64X_2 )
// 			this.FBODownsample64X_2.Destroy();

		if ( this.shaderDownsample )
			this.shaderDownsample.Destroy();
		if ( this.shaderUpsample )
			this.shaderUpsample.Destroy();
		if ( this.shaderMaskEmissive )
			this.shaderMaskEmissive.Destroy();
		if ( this.shaderLightShafts )
			this.shaderLightShafts.Destroy();
		if ( this.shaderCombine )
			this.shaderCombine.Destroy();
	},

	// Sets the color cube used for final color grading
	//	_TexColorCube, a 512x16 texture containing 16 slices of 17x16 pixels (the last 17th column of the slice is a duplicate of the 16th column)
	//					The texture represents a 16x16x16 3D color cube.
	//
	SetColorCube : function( _TexColorCube )
	{
		this.texColorCube = _TexColorCube;
		this.useColorCube = true;
	},

	// Renders the post-process
	//	_SourceFBO, the source FBO to apply the post-process to
	//	_TargetFBO, the target FBO to render to (null to render to screen)
	//	_Camera, the camera used to view the scene
	//	_SunDirection, direction of the Sun in WORLD space
	//	_SunColor, color of the Sun
	//	_TexEmissiveMask, a texture containing the mask of emissive materials where the light shafts will be applied
	//
	Render : function( _SourceFBO, _TargetFBO, _Camera, _SunDirection, _SunColor, _TexEmissiveMask )
	{
		var	that = this;
		var	gl = this.gl;

		gl.disable( gl.DEPTH_TEST );
		gl.disable( gl.CULL_FACE );

		//////////////////////////////////////////////////////////////////////////
		// Downsample
			// By 2
		this.FBODownsample2X.Bind();
		this.shaderDownsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", _SourceFBO );

				var	dUV = new vec3( 1.0 / _SourceFBO.width, 1.0 / _SourceFBO.height, 0.0 );
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				_Shader.uniforms._SourceAttenuation.Set( that.glowSourceAttenuation );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );

			// By 4
		this.FBODownsample4X.Bind();
		this.shaderDownsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBODownsample2X );

				var	dUV = new vec3( 1.0 / that.FBODownsample2X.width, 1.0 / that.FBODownsample2X.height, 0.0 );
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				_Shader.uniforms._SourceAttenuation.Set( 1.0 );	// Restore

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );

			// By 8
		this.FBODownsample8X.Bind();
		this.shaderDownsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBODownsample4X );

				var	dUV = new vec3( 1.0 / that.FBODownsample4X.width, 1.0 / that.FBODownsample4X.height, 0.0 );
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );

			// By 16
		this.FBODownsample16X.Bind();
		this.shaderDownsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBODownsample8X );

				var	dUV = new vec3( 1.0 / that.FBODownsample8X.width, 1.0 / that.FBODownsample8X.height, 0.0 );
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );

			// By 32
		this.FBODownsample32X.Bind();
		this.shaderDownsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBODownsample16X );

				var	dUV = new vec3( 1.0 / that.FBODownsample16X.width, 1.0 / that.FBODownsample16X.height, 0.0 );
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );

			// By 64
		this.FBODownsample64X.Bind();
		this.shaderDownsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBODownsample32X );

				var	dUV = new vec3( 1.0 / that.FBODownsample32X.width, 1.0 / that.FBODownsample32X.height, 0.0 );
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );


		//////////////////////////////////////////////////////////////////////////
		// Upsample using gaussian blur (the upsampling is the most important part for a clean glow !)
		var	WidthFactor = gl.drawingBufferWidth / gl.drawingBufferHeight;

			// 64X => 32X
		this.FBOUpsample32X[0].Bind();
		this.shaderUpsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBODownsample64X );

				var	dUV = new vec3( WidthFactor / that.FBODownsample64X.width, 0.0, 0.0 );	// Horizontal blur
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );
		this.FBOUpsample32X[1].Bind();
		this.shaderUpsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBOUpsample32X[0] );

				var	dUV = new vec3( 0.0, 1.0 / that.FBOUpsample32X[0].height, 0.0 );	// Vertical blur
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );


			// 32X => 16X
		this.FBOUpsample16X[0].Bind();
		this.shaderUpsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBOUpsample32X[1] );

				var	dUV = new vec3( WidthFactor / that.FBOUpsample32X[1].width, 0.0, 0.0 );	// Horizontal blur
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );
		this.FBOUpsample16X[1].Bind();
		this.shaderUpsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBOUpsample16X[0] );

				var	dUV = new vec3( 0.0, 1.0 / that.FBOUpsample16X[0].height, 0.0 );	// Vertical blur
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );


			// 16X => 8X
		this.FBOUpsample8X[0].Bind();
		this.shaderUpsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBOUpsample16X[0] );

				var	dUV = new vec3( WidthFactor / that.FBOUpsample16X[0], 0.0, 0.0 );	// Horizontal blur
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );
		this.FBOUpsample8X[1].Bind();
		this.shaderUpsample.Use(
			function( _Shader )
			{
				_Shader.uniforms.SafeSet( "_TexSourceBuffer", that.FBOUpsample8X[0] );

				var	dUV = new vec3( 0.0, 1.0 / that.FBOUpsample8X[0].height, 0.0 );	// Vertical blur
				_Shader.uniforms.SafeSet( "_dUV", dUV );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );


		//////////////////////////////////////////////////////////////////////////
		// Mask emissive materials to prepare for light shafts
		this.FBODownsample4X_Masked.Bind();
		this.shaderMaskEmissive.Use(
			function( _Shader )
			{
				_Shader.uniforms._TexSourceBuffer.Set( that.FBODownsample4X );
				_Shader.uniforms._TexEmissiveMask.Set( _TexEmissiveMask );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );


		//////////////////////////////////////////////////////////////////////////
		// Compute light shafts
 		var	Camera2World = g_Camera.Camera2World;
 		var	World2Proj = g_Camera.World2Proj;
		var	AspectRatio = g_Camera.rayBasis;

		var	SunLuminance = 0.3 * _SunColor.x + 0.5 * _SunColor.y + 0.2 * _SunColor.z;
		var	ShaftsLuminance = this.lightShaftsStrength * 0.05 * SunLuminance;

		var	CameraView = _Camera.Camera2World.r2;
		var	LightPhase = CameraView.dot( _SunDirection );
			LightPhase = Math.max( 0.0, LightPhase );
			LightPhase *= LightPhase;
		ShaftsLuminance *= LightPhase;

		this.FBODownsample4X_LightShaft[0].Bind();
		patapi.webgl.Clear( 0, 0, 0, 0 );

		for ( var ShaftPassIndex=0; ShaftPassIndex < 8; ShaftPassIndex++ )
		{
			this.FBODownsample4X_LightShaft[1].Bind();
			this.shaderLightShafts.Use(
				function( _Shader )
				{
					_Shader.uniforms._TexSourceBuffer.Set( that.FBODownsample4X_Masked );
					_Shader.uniforms._TexPreviousBuffer.Set( that.FBODownsample4X_LightShaft[0] );
 					_Shader.uniforms._World2Proj.Set( World2Proj );
 					_Shader.uniforms._SunDirection.Set( _SunDirection );
 					_Shader.uniforms._ShaftIndex.Set( ShaftPassIndex );
					_Shader.uniforms._ShaftPowerFactor.Set( ShaftsLuminance );
					_Shader.uniforms._ShaftDecayRate.Set( that.lightShaftsDecayRate );

					that.screenQuad.Use();
					that.screenQuad.Draw();
				} );

			// Scroll buffers
			var	Temp = this.FBODownsample4X_LightShaft[0];
			this.FBODownsample4X_LightShaft[0] = this.FBODownsample4X_LightShaft[1];
			this.FBODownsample4X_LightShaft[1] = Temp;
		}


		//////////////////////////////////////////////////////////////////////////
		// Combine
		if ( _TargetFBO )
			_TargetFBO.Bind();
		else
			this.FBODownsample4X.UnBind();

		this.shaderCombine.Use(
			function( _Shader )
			{
				_Shader.uniforms._TexSourceBuffer.Set( _SourceFBO );
//				_Shader.uniforms._TexSourceBuffer.Set( that.FBODownsample64X );
//				_Shader.uniforms._TexSourceBuffer.Set( _TexEmissiveMask );
 				_Shader.uniforms._TexGlowVeiling.Set( that.FBOUpsample16X[1] );
 				_Shader.uniforms._TexLightShafts.Set( that.FBODownsample4X_LightShaft[0] );
// 				_Shader.uniforms._TexLightShafts.Set( _TexEmissiveMask );

 				_Shader.uniforms._SourceStrength.Set( that.backgroundStrength );
 				_Shader.uniforms._GlowStrength.Set( that.glowStrength );
 				_Shader.uniforms._Exposure.Set( that.exposure );
 				_Shader.uniforms._Gamma.Set( that.gamma );

				if ( that.texColorCube && that.useColorCube )
				{
					_Shader.uniforms._UseColorCube.Set( 1.0 );
 					_Shader.uniforms._TexColorCube.Set( that.texColorCube );
				}
				else
					_Shader.uniforms._UseColorCube.Set( 0.0 );

				that.screenQuad.Use();
				that.screenQuad.Draw();
			} );
	},
}
