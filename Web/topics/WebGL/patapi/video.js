//////////////////////////////////////////////////////////////////////////
// This file contains helpers to manage video from a webcam
//////////////////////////////////////////////////////////////////////////
//
// Not only it supports video textures but also provides for spatial and time filtering
//
//////////////////////////////////////////////////////////////////////////
//
o3djs.require( 'patapi' );
o3djs.require( 'patapi.webgl' );
o3djs.provide( 'patapi.video' );

// Add the video extension
patapi.video = patapi.video || {};

//////////////////////////////////////////////////////////////////////////
patapi.video.DefaultInit =
{
	width : 640,							// The dimensions of the video to create
	height : 480,
	temporalAverageFramesCount : 1,			// Amount of frames for temporal filtering (the resulting image is box filtered across this amount of frames). Use 1 for immediate rendering and no temporal filtering.
	gaussianFilterWeight : 0.0,				// Size of the gaussian filter applied to each frame
	keyStone : 0.0,							// The keyStone factor in [-1,+1] to account for vertical perspective deformation when tilting the camera
	shadersPath : "../patapi/Shaders/",		// Path to the filtering shaders
}

//////////////////////////////////////////////////////////////////////////
// Attemps to build video object grabbing the webcam
//	_Init, the init structure whose model is given right above
//	opt_Callback, an optional callback called when the video is ready (prototype is function( _VideoObject )
//	opt_CallbackError, an optional callback called if the video failed to initialize (prototype is function( _VideoObject, _Error )
// Returns a Video object
// Throws if no video object could be created
//
patapi.video.CreateVideoTexture = function( gl, _Init, opt_Callback, opt_CallbackError )
{
	return new patapi.Video( gl, _Init, opt_Callback, opt_CallbackError );
}

//////////////////////////////////////////////////////////////////////////
// The Video object
patapi.Video = function( gl, _Init, opt_CallbackOK, opt_CallbackError )
{
	this.gl = gl;

	// Patch init
	_Init.width = _Init.width ? _Init.width : patapi.video.DefaultInit.width;
	_Init.height = _Init.height ? _Init.height : patapi.video.DefaultInit.height;
	_Init.temporalAverageFramesCount = _Init.temporalAverageFramesCount ? _Init.temporalAverageFramesCount : patapi.video.DefaultInit.temporalAverageFramesCount;
	_Init.gaussianFilterWeight = _Init.gaussianFilterWeight ? _Init.gaussianFilterWeight : patapi.video.DefaultInit.gaussianFilterWeight;
	_Init.shadersPath = _Init.shadersPath ? _Init.shadersPath : patapi.video.DefaultInit.shadersPath;

	// Store parameters
	this.width = _Init.width;
	this.height = _Init.height;
	this.gaussianFilterWeight = _Init.gaussianFilterWeight;
	this.keyStone = _Init.keyStone;
	this.shadersPath = _Init.shadersPath;
	this.isPlaying = false;

	// Enable filtering only if parameters are not default...
	this.filterVideo = _Init.temporalAverageFramesCount > 1 || this.gaussianFilterWeight > 0.0 || this.keyStone != 0.0;

	if ( !gl.RGBA_FLOAT && this.filterVideo )
		throw "Video filtering is not available if FLOAT textures are not supported on your card! Please use temporalAverageFramesCount=1 and gaussianFilterWeight=0.0 ...";


	// !!!Important line!!!
	patapi.webgl.updatables.push( { callback : this.__Update, __this : this } );



	//////////////////////////////////////////////////////////////////////////
	// Attempt to grab video
	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	if ( !navigator.getUserMedia )
		throw "getUserMedia() is not supported on your browser!";

	function	HandleError( _Error )
	{
		var	Message = "Failed to retrieve video stream. Error code " + _Error;
		if ( !opt_CallbackError )
			throw Message
		opt_CallbackError( that, Message );
	}

	var	that = this;
	navigator.getUserMedia(
		{ video: true },
		function ( _Stream )
		{
			that.videoElement = document.createElement( 'video' );
			that.videoElement.width = _Init.width;
			that.videoElement.height = _Init.height;

			if ( navigator.mozGetUserMedia !== undefined )
				that.videoElement.src = _Stream;
			else
				that.videoElement.src = window.URL.createObjectURL( _Stream );

			try
			{
				that.__FinishInitialization( _Init.temporalAverageFramesCount );
			}
			catch ( _e )
			{
				HandleError( _e );
			}

			if ( opt_CallbackOK )
				opt_CallbackOK( that );
		},
		HandleError
	);
}

patapi.Video.prototype =
{
	Destroy : function()
	{
		if ( this.texVideoFiltered && this.texVideoFiltered != this.texVideoSource )	this.texVideoFiltered.Destroy();
		if ( this.texSnapshot )				this.texSnapshot.Destroy();
		if ( this.texVideoSource )			gl.deleteTexture( this.texVideoSource );
		if ( this.RTGaussTemp )				this.RTGaussTemp.Destroy();
		if ( this.RTAccum )
		{
			this.RTAccum[0].Destroy();
			this.RTAccum[1].Destroy();
			this.RTAccum = null;
		}
		if ( this.RTTemporal )
		{
			for ( var i=0; i < this.RTTemporal.length; i++ )
				this.RTTemporal[i].Destroy();
			this.RTTemporal = null;
		}

		if ( this.shaderGaussianFilter )	this.shaderGaussianFilter.Destroy();
		if ( this.shaderTemporalFilter )	this.shaderTemporalFilter.Destroy();
		if ( this.shaderNormalize )			this.shaderNormalize.Destroy();

		if ( this.PrimQuad )				this.PrimQuad.Destroy();
	},

	Play : function()
	{
		this.videoElement.play();
		this.isPlaying = true;
	},

	Stop : function()
	{
		this.videoElement.stop();
		this.isPlaying = false;
	},

	// Sets the video as a texture for a shader
	SetTexture : function( _ShaderUniform )
	{
		if ( !this.videoElement || !_ShaderUniform )
			return;	// Not initialized yet...

		_ShaderUniform.Set( this.texVideoFiltered );
	},

	// Takes a snapshot of the current video
	Snapshot : function()
	{
		if ( !this.filterVideo )
			throw "Snapshot only works when filtering is enabled!";

		if ( this.texSnapshot == null )
		{	// First time, create the render target
			this.texSnapshot = patapi.webgl.CreateFBO( "Snapshot", this.width, this.height, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.LINEAR );
		}

		// Simply swap filtered video texture with snapshot...
		var	Temp = this.texVideoFiltered;
		this.texVideoFiltered = this.texSnapshot;
		this.texSnapshot = Temp;

		return this.texSnapshot;
	},

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	__FinishInitialization : function( _TemporalAverageFramesCount )
	{
		//////////////////////////////////////////////////////////////////////////
		// Build our video textures
		//
		{	// Build the main source texture that will be updated with video...
			this.texVideoSource = gl.createTexture();

	 		gl.bindTexture( gl.TEXTURE_2D, this.texVideoSource );

			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
			gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );	// Video is reversed

 			gl.bindTexture( gl.TEXTURE_2D, null );
		}

		if ( !this.filterVideo )
		{	// If filtering is disabled or is not available then the source video texture is also the final filtered texture
			this.texVideoFiltered = this.texVideoSource;
			return;
		}

		// Build our temporary FBO for gaussian blur
		this.RTGaussTemp = patapi.webgl.CreateFBO( "TempGauss", this.width, this.height, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.LINEAR );

		// Build our temporal sum floating-point FBOs
		this.RTTemporal = [];
		for ( var TemporalSumTextureIndex=0; TemporalSumTextureIndex < _TemporalAverageFramesCount; TemporalSumTextureIndex++ )
			this.RTTemporal.push( patapi.webgl.CreateFBO( "Temporal" + TemporalSumTextureIndex, this.width, this.height, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.LINEAR ) );

		// Build the accumulation texture...
		this.RTAccum = [
			patapi.webgl.CreateFBO( "Accumulator0", this.width, this.height, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.LINEAR ),
			patapi.webgl.CreateFBO( "Accumulator1", this.width, this.height, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.LINEAR )
			];
		this.RTAccum[0].Bind();
		this.RTAccum[0].Clear( 0, 0, 0, 0 );
		this.RTAccum[1].Bind();
		this.RTAccum[1].Clear( 0, 0, 0, 0 );
		this.RTAccum[1].UnBind();

		// And the final filtered texture...
		this.texVideoFiltered = patapi.webgl.CreateFBO( "FilteredVideo", this.width, this.height, gl.RGBA_FLOAT, gl.CLAMP_TO_EDGE, gl.LINEAR );


		//////////////////////////////////////////////////////////////////////////
		// Build our filtering shaders

		{	// Gaussian filter
			var	VS = patapi.helpers.LoadFileSynchronous( this.shadersPath + "PPVideoGaussianFilter.vs" );
			var	PS = patapi.helpers.LoadFileSynchronous( this.shadersPath + "PPVideoGaussianFilter.ps" );
			this.shaderGaussianFilter = patapi.webgl.CreateShader( "GaussianFilter", VS, PS );
		}

		{	// Temporal filter
			var	VS = patapi.helpers.LoadFileSynchronous( this.shadersPath + "PPVideoTemporalFilter.vs" );
			var	PS = patapi.helpers.LoadFileSynchronous( this.shadersPath + "PPVideoTemporalFilter.ps" );
			this.shaderTemporalFilter = patapi.webgl.CreateShader( "TemporalFilter", VS, PS );
		}

		{	// Normalizer
			var	VS = patapi.helpers.LoadFileSynchronous( this.shadersPath + "PPVideoNormalize.vs" );
			var	PS = patapi.helpers.LoadFileSynchronous( this.shadersPath + "PPVideoNormalize.ps" );
			this.shaderNormalize = patapi.webgl.CreateShader( "Normalize", VS, PS );
		}


		//////////////////////////////////////////////////////////////////////////
		// 
		var	Vertices = new Float32Array( [
			-1.0, +1.0, 1.0, 1.0,
			-1.0, -1.0, 1.0, 1.0,
			+1.0, +1.0, 1.0, 1.0,
			+1.0, -1.0, 1.0, 1.0,
			] );
		var	Indices = new Uint16Array( [ 0, 1, 2, 3 ]);
		this.PrimQuad = patapi.webgl.CreatePrimitiveSynchronous( "ScreenQuad", this.shaderGaussianFilter, { _vPosition : Vertices }, Indices, gl.TRIANGLE_STRIP );
	},

	__Update : function()
	{
		if ( !this.videoElement )
			return;	// Not available yet...
		if ( this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA )
			return;	// Nothing new...

		var	gl = this.gl;

		// Setup default states
		gl.disable( gl.DEPTH_TEST );
		gl.disable( gl.CULL_FACE );

		// Grab new frame
		try
		{
			// Simply bind...
 			gl.bindTexture( gl.TEXTURE_2D, this.texVideoSource );

			// Update image...
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.videoElement );
//			gl.generateMipmap( gl.TEXTURE_2D );

			// Unbind and we're done !
 			gl.bindTexture( gl.TEXTURE_2D, null );
		}
		catch ( _e )
		{
			throw "An error occurred while updating the video texture: " + _e;
		}

		if ( !this.filterVideo )
			return;	// No need filtering...

		gl.disable( gl.DEPTH_TEST );
		gl.disable( gl.CULL_FACE );

		//////////////////////////////////////////////////////////////////////////
		// Apply gaussian filter
		{
			this.shaderGaussianFilter.Use();
			this.PrimQuad.Use();

			var	GaussianStep = this.gaussianFilterWeight / this.width;

			// Horizontal first
			this.RTGaussTemp.Bind();
			this.shaderGaussianFilter.uniforms._TexSource.Set( this.texVideoSource );
			this.shaderGaussianFilter.uniforms._dUV.Set( new vec3( GaussianStep, 0.0, 0.0 ) );
			this.PrimQuad.Draw();

			// Vertical then
			this.RTTemporal[0].Bind();
			this.shaderGaussianFilter.uniforms._TexSource.Set( this.RTGaussTemp );
			this.shaderGaussianFilter.uniforms._dUV.Set( new vec3( 0.0, GaussianStep, 0.0 ) );
			this.PrimQuad.Draw();
		}

		//////////////////////////////////////////////////////////////////////////
		// Apply temporal filter
		{
			var	RTNew = this.RTTemporal[0];
			var	RTOld = null;
			if ( this.RTTemporal.length > 1 )
				RTOld = this.RTTemporal[this.RTTemporal.length-1];
			else
				RTOld = this.RTAccum[0];	// Subtract previously accumulated value

			this.shaderTemporalFilter.Use();
			this.PrimQuad.Use();

			this.RTAccum[1].Bind();
			this.shaderTemporalFilter.uniforms._TexFrameOld.Set( RTOld );
			this.shaderTemporalFilter.uniforms._TexFrameNew.Set( RTNew );
			this.shaderTemporalFilter.uniforms._TexAccum.Set( this.RTAccum[0] );
			this.PrimQuad.Draw();

			// Swap accumulation buffers
			var	Temp = this.RTAccum[0];
			this.RTAccum[0] = this.RTAccum[1];
			this.RTAccum[1] = Temp;

			// Scroll temporal buffers so higher buffer indices contain older frames
			var	Temp = this.RTTemporal[this.RTTemporal.length-1];
			for ( var i=this.RTTemporal.length-1; i > 0; i-- )
				this.RTTemporal[i] = this.RTTemporal[i-1];
			this.RTTemporal[0] = Temp;
		}

		{	// Normalize accumulation buffer
			this.shaderNormalize.Use();
			this.PrimQuad.Use();

			this.texVideoFiltered.Bind();
			this.shaderNormalize.uniforms._TexAccum.Set( this.RTAccum[0] );
			this.shaderNormalize.uniforms._TemporalFramesNormalizer.Set( 1.0 / this.RTTemporal.length );
			this.shaderNormalize.uniforms._KeyStone.Set( this.keyStone );
			this.PrimQuad.Draw();
		}
	}
}
