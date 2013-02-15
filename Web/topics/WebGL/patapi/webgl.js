//////////////////////////////////////////////////////////////////////////
// This file contains helpers for the "webgl" context
//////////////////////////////////////////////////////////////////////////
//
o3djs.require( 'patapi' );
o3djs.provide( 'patapi.webgl' );

// Add the webgl extension
patapi.webgl = patapi.webgl || {};


// From http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function( callback ) { window.setTimeout( callback, 10 ); };
})();

// Prevents display & running if window is not active
// From http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
// (function() {
// 
// 	function onchange (evt)
// 	{
// 		var body = document.body;
// 		evt = evt || window.event;
// 
// 		if (evt.type == "focus" || evt.type == "focusin")
// 			body.className = "visible";
// 		else if (evt.type == "blur" || evt.type == "focusout")
// 			body.className = "hidden";
// 		else
// 			body.className = this[hidden] ? "hidden" : "visible";
// 	}
// 
// 	var hidden, change, vis =
// 	{
// 		hidden: "visibilitychange",
// 		mozHidden: "mozvisibilitychange",
// 		webkitHidden: "webkitvisibilitychange",
// 		msHidden: "msvisibilitychange",
// 		oHidden: "ovisibilitychange" // not currently supported
// 	};
// 	for (hidden in vis)
// 		if (vis.hasOwnProperty(hidden) && hidden in document)
// 		{
// 			change = vis[hidden];
// 			break;
// 		}
// 	if (change)
// 		document.addEventListener(change, onchange);
// 
// 	else if (/*@cc_on!@*/false) // IE 9 and lower
// 		document.onfocusin = document.onfocusout = onchange
// 	else
// 		window.onfocus = window.onblur = onchange;
// })();


//////////////////////////////////////////////////////////////////////////
// Gets the WebGL context
//	opt_ContextAttributes, an optional list of context attributes (e.g. { antialias: false, stencil: true } )
//
patapi.webgl.GetContext = function( _CanvasElement, opt_ContextAttributes )
{
	if ( _CanvasElement == null )
		throw "Invalid canvas to query WebGL context for !";

	this.canvas = _CanvasElement;
	this.width = _CanvasElement.clientWidth;
	this.height = _CanvasElement.clientHeight;
	this.frameIndex = -1;	// No frame rendered yet
	this.updatables = [];	// The array of updatable objects (should be an object of type { callback : function, __this : your "this" object })
							// Updatables will be called on each call to FrameUpdate()
	this.extensions =
	{
		floatTextures : false,
		vertexTextureFetch : false,
	};	// No extensions

	try
	{
		if ( !_CanvasElement.getContext )
			throw "Your browser does not support the HTML5 canvas !";

		this.gl = _CanvasElement.getContext( 'webgl', opt_ContextAttributes );	// Attempt default 'webgl' query
		if ( !this.gl )
			this.gl = _CanvasElement.getContext( 'experimental-webgl', opt_ContextAttributes );	// In case of failure, attempt getting the experimental webgl context

		if ( !this.gl )
			throw "Your browser does not support WebGL !";
	}
	catch ( _e )
	{
		if ( o3djs.base.IsFirefox() )
			throw "Your firefox browser is not configured to support WebGL !\nPlease read about changing its configuration here:\n\nhttp://support.mozilla.org/en-US/questions/720087";
		throw "An error occurred while getting WebGL context:\n" + _e;
	}

	return this.__ProcessGLContext();
}

patapi.webgl.__ProcessGLContext = function()
{
	var	gl = this.gl;

	// Check declared extensions
	var	Extensions = gl.getSupportedExtensions();
	for ( var ExtensionIndex=0; ExtensionIndex < Extensions.length; ExtensionIndex++ )
	{
		var	Extension = Extensions[ExtensionIndex];
		switch ( Extension )
		{
		case "OES_texture_float":
			var	EnabledObject = gl.getExtension( "OES_texture_float" );
			this.extensions.floatTextures = EnabledObject;

			// Add the RGBA_FLOAT format
			gl.RGBA_FLOAT = gl.RGBA + 0x100000;	// 0x1908 + 0x100000 = 0x101908
			break;
		}
	}

	// Check specific extensions
	var	TextureImageUnitsCount = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
	this.extensions.vertexTextureFetch = TextureImageUnitsCount;

	// Also attempt to retrieve the Depth Buffer attached to default frame buffer object
// 	gl.bindFramebuffer( gl.FRAMEBUFFER, null );
// 	this.defaultDepthBuffer = gl.getFramebufferAttachmentParameter( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME );

	// Ain't there a way to retrieve the ID of the default frame buffer ???
	// This would be nice because we could render to a FBO re-using the default depth buffer without wastefully allocating a new one...

	return gl;
}


//////////////////////////////////////////////////////////////////////////
// In the case we're dealing with multiple canvases, we don't want to lose the ease of use of the patapi
//	so I decided to simply add some functions to backup/restore the current rendering context
//
// It implies saving the relevant GL context data (GL context, canvas, size, etc.) into a small object at the end of the frame
//	and restoring it later at the beginning of the next frame for the same canvas...
//
// By default, with only one canvas you don't need to preoccupy yourself about anything.
//
patapi.webgl.BackupRenderingContext = function()
{
	var	Context = 
	{
		gl			: this.gl,
		canvas		: this.canvas,
		width		: this.width,
		height		: this.height,
		frameIndex	: this.frameIndex,
		updatables	: this.updatables,
	};
	return Context;
}

patapi.webgl.RestoreRenderingContext = function( _Context )
{
	this.gl = _Context.gl;
	this.canvas = _Context.canvas;
	this.width = _Context.width;
	this.height = _Context.height;
	this.frameIndex = _Context.frameIndex;
	this.updatables = _Context.updatables;
}


//////////////////////////////////////////////////////////////////////////
// Call this to resize rendering
patapi.webgl.Resize = function( _Width, _Height )
{
	this.width = _Width;
	this.height = _Height;
	this.canvas.width = _Width;
	this.canvas.height = _Height;

	this.gl.viewport( 0, 0, this.width, this.height );
}


//////////////////////////////////////////////////////////////////////////
// Updates the WebGL context for the next frame
//
patapi.webgl.FrameUpdate = function()
{
	var gl = this.EnsureGL();

	this.frameIndex++;	// Increment internal frame counter

	// Here, we must clear any pre-existing cached buffers since internally, the WebGL implementation certainly
	//	trashed actual GL internal state from last frame and we can't know what buffers & states are currently in use...

	// Reset shaders' internal state
	patapi.Shader.prototype.currentShader = null;	// No more default program

	// Reset FBO's internal state
	patapi.FBO.prototype.boundFBO = null;

	// Reset primitives' internal state
	var	BoundVBs = patapi.Primitive.prototype.currentVBs;
	for ( var VBKey in BoundVBs )
		if ( BoundVBs.hasOwnProperty( VBKey ) )
			BoundVBs[VBKey] = null;
	patapi.Primitive.prototype.currentIB = null;

	// Call any registered updatable
	if ( this.updatables && this.updatables.length > 0 )
		for ( var i=0; i < this.updatables.length; i++ )
		{
			var	Updatable = this.updatables[i];
			Updatable.callback.call( Updatable.__this );
		}

	// Reset FBO & viewport
	gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );
}

patapi.webgl.EnsureFrameUpdated = function()
{
	if ( this.frameIndex == -1 )
		throw "FrameIndex on patapi.webgl is still at its default value of -1. You must call patapi.webgl.FrameUpdate() every frame to ensure correct process!";
}


//////////////////////////////////////////////////////////////////////////
// The very useful fullscreen quad!
// You must specify a fullscreen shader whose attribute vertices must be "attribute vec4 _vPosition;"
//
patapi.webgl.CreateScreenQuad = function( _Shader )
{
	var gl = patapi.webgl.EnsureGL();

	// Otherwise, build it!
	var	Vertices = new Float32Array( [
		-1.0, +1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0, 1.0,
		+1.0, +1.0, 1.0, 1.0,
		+1.0, -1.0, 1.0, 1.0,
	 ] );
	var	Indices = new Uint16Array( [ 0, 1, 2, 3 ]);

	var	Quad = patapi.webgl.CreatePrimitiveSynchronous( "ScreenQuad", _Shader, { _vPosition : Vertices }, Indices, gl.TRIANGLE_STRIP );

	return Quad;
}


//////////////////////////////////////////////////////////////////////////
// Creates a shader program from VS & PS source code strings
//	_VS, the vertex shader code string
//	_PS, the pixel shader code string
// Returns a shader object
//
// NOTE: You can pass a null or undefined PS code, in which case I will assume the VS code contains both VS & PS entry points named "VS" and "PS" respectively
//	and each section of the shader is braced with #ifdef VS #endif or #ifdef PS #endif sections...
//
patapi.webgl.CreateShader = function( _Name, _VS, _PS )
{
	if ( !_PS )
	{	// In case we're not passed a PS source code then we assume the VS code contains both codes
		// Each shader part is then ensnared between specific preprocessor condition blocks like these:
		//
		//	#ifdef VS
		//
		//		Vertex Shader code with void main()
		//
		//	#endif
		//	#ifdef PS	// Can also be a simple #else, no need to add another #endif/#ifdef
		//
		//		Pixel Shader code with void main()
		//
		//	#endif
		//
		_PS = "#define PS\n\n" + _VS;	// Make PS the main function
		_VS = "#define VS\n\n" + _VS;	// Make VS the main function
	}

	var gl = this.EnsureGL();
	return new patapi.Shader( gl, _Name, _VS, _PS );
}

//////////////////////////////////////////////////////////////////////////
// Loads and create a shader program from VS & PS DOM elements (e.g. <script id="MyShader" type="x-shader/x-fragment">)
// NOTE: You can pass only the VS DOM element, I will assume it contains both VS & PS in a single source that will later be sorted out by CreateShader()
//	_VSElementID, the name of the DOM element containing the vertex shader code
//	_PSElementID, the name of the DOM element containing the pixel shader code
//
// Returns a shader object
//
patapi.webgl.LoadShader = function( _Name, _VSElementID, _PSElementID )
{
	var	VSElement = document.getElementById( _VSElementID );
	if ( !VSElement )
		throw "Vertex shader element \"" + _VSElementID + "\" not found !";

	var	PSElement = document.getElementById( _PSElementID );
// 	if ( !PSElement )
// 		throw "Pixel shader element \"" + _PSElementID + "\" not found !";

	return this.CreateShader( _Name, VSElement.text, PSElement ? PSElement.text : null );
}

//////////////////////////////////////////////////////////////////////////
// Replaces the #include "XXX" syntax by actual shader code
//	_ShaderCode, the shader code containing the include directives
//	opt_ShaderPath, the optional shader base path (default is "./", current directory)
//	opt_Macros, the optional string of macros (i.e. #defines) to prefix the shader with
//
patapi.webgl.ProcessShaderIncludes = function( _ShaderCode, opt_ShaderPath, opt_Macros )
{
	if ( opt_Macros )
		_ShaderCode = opt_Macros + "\n" + _ShaderCode;

	// Prepare shader base directory
	var	ShaderCodePath = opt_ShaderPath ? opt_ShaderPath : "./";
	var	LastSlash = ShaderCodePath.lastIndexOf( "/" );
	if ( LastSlash != -1 )
		ShaderCodePath = ShaderCodePath.substr( 0, LastSlash+1 );	// Ignore everything beyond last slash
	else if ( ShaderCodePath != "" )
		ShaderCodePath += "/";										// Always end with a slash

	// Replace every occurrence of the #include directive
	function ProcessInclude( _IncludePath )
	{
		var	URL = ShaderCodePath + _IncludePath;
		var	Code = patapi.helpers.LoadFileSynchronous( URL );
		var	ProcessedCode = patapi.webgl.ProcessShaderIncludes( Code, URL );	// Recurse for include's own includes...
		return ProcessedCode;
	}

	while ( true )
	{
		var	IncludeStartIndex = _ShaderCode.indexOf( "#include" );
		if ( IncludeStartIndex == -1 )
			break;	// Found all of them!

		var	IncludeEndIndex = _ShaderCode.indexOf( "\n", IncludeStartIndex );
		IncludeEndIndex++;

		// Isolate the filename
		var	FileNameStart = _ShaderCode.indexOf( "\"", IncludeStartIndex );
		if ( FileNameStart == -1 )
			throw "Badly formatted #include! Expected starting \"...";
		FileNameStart++;

		var	FileNameEnd = _ShaderCode.indexOf( "\"", FileNameStart );
		if ( FileNameEnd >= IncludeEndIndex )
			throw "Badly formatted #include! Expected ending \"...";

		var	FileName = _ShaderCode.substr( FileNameStart, FileNameEnd-FileNameStart );

		// Attempt to process the include file
		var	IncludedCode = ProcessInclude( FileName );

		// Replace #include directive with included code
		var	CodeStart = _ShaderCode.substr( 0, IncludeStartIndex );
		var	CodeEnd = _ShaderCode.substr( IncludeEndIndex, _ShaderCode.length - IncludeEndIndex );
		_ShaderCode = CodeStart + IncludedCode + CodeEnd;

		// Start over until no more #includes remain...
	}

	return _ShaderCode;
}


//////////////////////////////////////////////////////////////////////////
// Creates a shader from a single file containing both the VS & PS code between #define directive
// This function also handles the #include directives
//
patapi.webgl.CreateShaderFromFile = function( _Name, _ShaderURL, opt_Macros )
{
	var	Code = patapi.helpers.LoadFileSynchronous( _ShaderURL );
		Code = patapi.webgl.ProcessShaderIncludes( Code, _ShaderURL, opt_Macros );
	var	Shader = patapi.webgl.CreateShader( _Name, Code );
	return Shader;
}


//////////////////////////////////////////////////////////////////////////
// Creates a FBO
//	_WrapMode, possible values are gl.REPEAT (default), gl.CLAMP_TO_EDGE or gl.MIRRORED_REPEAT
//	_FilteringMode, possible values are gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR or gl.LINEAR_MIPMAP_LINEAR (default),
//	opt_UseDepth, if specified, creates a depth-buffer attached to the FBO
// Returns a FBO object
//
patapi.webgl.CreateFBO = function( _Name, _Width, _Height, _Format, _WrapMode, _FilteringMode, opt_UseDepth )
{
	var gl = this.EnsureGL();
	return new patapi.FBO( gl, _Name, _Width, _Height, _Format, _WrapMode, _FilteringMode, opt_UseDepth );
}

//////////////////////////////////////////////////////////////////////////
// Create a basic primitive from index & vertex arrays
//	_Name, the name you want to give to the primitive
//	_Shader, the shader the primitive will be displayed with
//	_VertexTable, a hashtable of vertex TypedArrays
//	_IndexStream, a typed array of indices
//	_Topology, the primitive topology. Possible values are gl.TRIANGLES or gl.TRIANGLE_STRIP
// Returns a primitive object
//
// The index stream must either be a Uint16Array or Uint32Array
//
// The _VertexTable object must either be an array of the form :
//	[
//		position : new Float32Array( [ your array of positions ] },
//		normal : new Float32Array( [ your array of normals ] },
//		etc.
//	]
//
// The name of the keys (i.e. position, normal, etc.) MUST match each of the names of the attributes in the shader or else an exception is thrown
//
patapi.webgl.CreatePrimitiveSynchronous = function( _Name, _Shader, _VertexTable, _IndexStream, _Topology )
{
	var gl = this.EnsureGL();

	// Ensure data are valid
	if ( !(_IndexStream instanceof Uint16Array) && !(_IndexStream instanceof Uint32Array) )
		throw "Index stream is required to be of type Uint16Array or Uint32Array to create a synchronous primitive !";
// 	for ( var Stream in _VertexTable )
// 		if ( _VertexTable.hasOwnProperty( Stream ) )
// 		{
// 			if ( !(_VertexTable[Stream] instanceof Array) )
// 				throw "Vertex streams in the primitive's VertexTable are required to be TypedArrays";
// 		}

	var	Params = 
	{
		indexStream : _IndexStream,
		vertexTable : _VertexTable
	};

	return new patapi.Primitive( gl, _Name, _Shader, _Topology, Params );
}

//////////////////////////////////////////////////////////////////////////
// Create a basic primitive from index & vertex file names that will be loaded asynchronously
//	_Name, the name you want to give to the primitive
//	_Shader, the shader the primitive will be displayed with
//	_VertexFileNames, a hashtable of vertex file names
//	_IndexFileName, a file name for the index file
//	_Topology, the primitive topology. Possible values are gl.TRIANGLES or gl.TRIANGLE_STRIP
//	opt_Callback, an optional callback of the form function( _Primitive, _BuffersCount, _BuffersLoaded, opt_Error ) that is called when one of the primitive's buffers is loaded
// Returns a primitive object
//
//
// The _VertexTable object must either be of the form :
//	[
//		position : "BinaryFileName0",
//		normal : "BinaryFileName1",
//		etc.
//	]
//
// The name of the keys (i.e. position, normal, etc.) MUST match each of the names of the attributes in the shader or else an exception is thrown
//
patapi.webgl.CreatePrimitiveAsynchronous = function( _Name, _Shader, _VertexFileNames, _IndexFileName, _Topology, opt_Callback )
{
	var gl = this.EnsureGL();

	// Ensure data are valid
	if ( !(_IndexFileName instanceof String) )
		throw "Index file name is required to be a string to create an asynchronous primitive !";
	for ( var Stream in _VertexFileNames )
		if ( _VertexFileNames.hasOwnProperty( Stream ) )
		{
			if ( !(_VertexFileNames[Stream] instanceof String) )
				throw "Vertex streams in the primitive's VertexTable are required to be strings to create an asynchronous primitive !";
		}

	var	Params = 
	{
		indexFileName : _IndexStream,
		vertexFileNames : _VertexTable,
		callback : opt_Callback
	};

	return new patapi.Primitive( gl, _Name, _Shader, _Topology, Params );
}

//////////////////////////////////////////////////////////////////////////
// Creates a baisc primitive from a "BlobFile" object that will be loaded asynchronously
//	_Name, the name you want to give to the primitive
//	_Shader, the shader the primitive will be displayed with
//	_Blob, a blob file object
//	_Topology, the primitive topology. Possible values are gl.TRIANGLES or gl.TRIANGLE_STRIP
//	opt_Callback, an optional callback of the form function( _Primitive ) that is called when one of the primitive is ready
// Returns a primitive object
//
//
// The BlobFile object is organized like this :
//
// 	"BlobFile": {
// 		"File": "Primitives/Blob0.bin",
// 		"IndexStreamOffset": 0,
// 		"VertexStreams": [
// 			{
// 				"Name": "_Position",
// 				"Offset": 38408
// 			},
// 			{
// 				"Name": "_UV",
// 				"Offset": 131320
// 			},
//			etc.
//		] }
//
// It consists of a single binary file that we load as an array and that we will later
//	slice according to the specified offsets. Each offset leads to a packed typed array
//	
patapi.webgl.CreatePrimitiveFromBlob = function( _Name, _Shader, _Blob, _Topology, opt_Callback )
{
	var gl = this.EnsureGL();

	var	Params = 
	{
		blob : _Blob,
		callback : opt_Callback
	};

	return new patapi.Primitive( gl, _Name, _Shader, _Topology, Params );
}


//////////////////////////////////////////////////////////////////////////
// Creates a perspective camera
//	_FOV, the camera vertical field of view in radians
//	_AspectRatio, the viewport's aspect ratio (i.e. width / height)
//	_Near, _Far, near and far clip distance
// Returns a shader object
//
patapi.webgl.CreateCamera = function( _Name, _FOV, _AspectRatio, _Near, _Far )
{
	var gl = this.EnsureGL();
	return new patapi.Camera( gl, _Name, _FOV, _AspectRatio, _Near, _Far );
}

//////////////////////////////////////////////////////////////////////////
// Sets default frame buffer and clears it (to be called at the beginning of your frame)
//
patapi.webgl.Clear = function( _R, _G, _B, _A, _Depth )
{
	var gl = this.EnsureGL();

	if ( typeof _Depth === 'undefined' )
		_Depth = 1.0;	// Default clear to far !

	gl.clearColor( _R, _G, _B, _A );
	gl.clearDepth( _Depth );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
}

patapi.webgl.ClearDepth = function( _Depth )
{
	var gl = this.EnsureGL();

	if ( typeof _Depth === 'undefined' )
		_Depth = 1.0;	// Default clear to far !

	gl.clearDepth( _Depth );
	gl.clear( gl.DEPTH_BUFFER_BIT );
}

//////////////////////////////////////////////////////////////////////////
// Loads an image texture
//	_Name, the name to give to the texture object
//	_URL, the URL of the image to load as a texture
//	_WrapMode, possible values are gl.REPEAT (default), gl.CLAMP_TO_EDGE or gl.MIRRORED_REPEAT
//	_FilteringMode, possible values are gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR or gl.LINEAR_MIPMAP_LINEAR (default),
//	opt_Callback, an optional callback of the form function( _URL, _Texture, opt_Error )
//	opt_FlipY, if set to true, flips the textures vertically
//	opt_DontStartDownload, if set to true, doesn't start the downloading right away (left to the user)
//
patapi.webgl.LoadImageTexture = function( _Name, _URL, _WrapMode, _FilteringMode, opt_Callback, opt_FlipY, opt_DontStartDownload )
{
	var gl = this.EnsureGL();

	_WrapMode = _WrapMode || gl.REPEAT;
	_FilteringMode = _FilteringMode || gl.LINEAR_MIPMAP_LINEAR;
	var	MagFilter = gl.LINEAR;
	if ( _FilteringMode == gl.NEAREST_MIPMAP_NEAREST || _FilteringMode == gl.NEAREST_MIPMAP_LINEAR || _FilteringMode == gl.NEAREST )
		MagFilter = gl.NEAREST;

	var	FlipY = typeof opt_FlipY !== "undefined" ? opt_FlipY : false;

	// Create the texture
	var	LoadError = false;
	var	Texture = gl.createTexture();
	Texture.name = _Name;
	Texture.URL = _URL;
	Texture.image = new Image();
	Texture.ready = false;
    Texture.image.onerror = function()
	{
		LoadError = true;
		if ( opt_Callback )
			opt_Callback( _URL, null, "An unspecified error occurred while loading texture \"" + _URL + " !" );
	}
    Texture.image.onload = function()
	{
		try
		{
			gl.bindTexture( gl.TEXTURE_2D, Texture );
			if ( FlipY )
			    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Texture.image );
    
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _WrapMode );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _WrapMode );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _FilteringMode );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, MagFilter );
 			gl.generateMipmap( gl.TEXTURE_2D );

 			gl.bindTexture( gl.TEXTURE_2D, null );

			Texture.ready = true;	// Can be used !

			if ( opt_Callback )
				opt_Callback( _URL, Texture );
		}
		catch ( _e )
		{
			LoadError = true;
			if ( opt_Callback )
				opt_Callback( _URL, null, "An error occurred while loading texture \"" + _URL + "\":\n" + _e );
		}
	};
	if ( typeof opt_DontStartDownload === undefined || !opt_DontStartDownload )
		Texture.image.src = _URL;	// Will start the downloading thread...

	return Texture;
}

//////////////////////////////////////////////////////////////////////////
// Creates a texture from a TypedArray
//	_Name, the name to give to the texture object
//	_ArrayBuffer, an array buffer as defined by http://www.khronos.org/registry/typedarray/specs/latest/#5
//	_Width, _Height, the dimensions of the texture
//	_Format, the format of the texture
//	_WrapMode, possible values are gl.REPEAT (default), gl.CLAMP_TO_EDGE or gl.MIRRORED_REPEAT
//	_FilteringMode, possible values are gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR or gl.LINEAR_MIPMAP_LINEAR (default),
//	opt_FlipY, if set to true, flips the textures vertically
//
patapi.webgl.CreateTextureFromArray = function( _Name, _ArrayBuffer, _Width, _Height, _Format, _WrapMode, _FilteringMode, opt_FlipY )
{
	var gl = this.EnsureGL();

	_WrapMode = _WrapMode || gl.REPEAT;
	_FilteringMode = _FilteringMode || gl.LINEAR_MIPMAP_LINEAR;
	var	MagFilter = gl.LINEAR;
	if ( _FilteringMode == gl.NEAREST_MIPMAP_NEAREST || _FilteringMode == gl.NEAREST_MIPMAP_LINEAR || _FilteringMode == gl.NEAREST )
		MagFilter = gl.NEAREST;

	var	FlipY = typeof opt_FlipY !== "undefined" ? opt_FlipY : false;

	_Format = _Format || gl.RGBA;
	var	Type = gl.UNSIGNED_BYTE;
	if ( _Format == gl.RGBA_FLOAT )
	{	// Handle special floating-point format...
		_Format = gl.RGBA;
		Type = gl.FLOAT;
	}

	// Create the actual texture
	var	Texture = gl.createTexture();

	gl.bindTexture( gl.TEXTURE_2D, Texture );
	if ( FlipY )
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

	var	IsTypedArray = _ArrayBuffer.buffer && _ArrayBuffer.buffer instanceof ArrayBuffer;
	if ( IsTypedArray )
		gl.texImage2D( gl.TEXTURE_2D, 0, _Format, _Width, _Height, 0, gl.RGBA, Type, _ArrayBuffer );
	else
		gl.texImage2D( gl.TEXTURE_2D, 0, _Format, 0, gl.RGBA, Type, _ArrayBuffer );
    
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _WrapMode );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _WrapMode );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _FilteringMode );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, MagFilter );
 	gl.generateMipmap( gl.TEXTURE_2D );

 	gl.bindTexture( gl.TEXTURE_2D, null );

	return Texture;
}


//////////////////////////////////////////////////////////////////////////
// This little function decodes our binary files into TypedArrays
// The structure of theses binaries is really simple :
//	[0-3] int : Array Type
//	[4-7] int : Elements Count
//	[8-END] TypeGivenByArrayType : Content
//
// Possible Array Types are :
//		0	Int8Array
//		1	Uint8Array
//		2	Int16Array
//		3	Uint16Array
//		4	Int32Array
//		5	Uint32Array
//		6	Float32Array
//
//
//	_ArrayBuffer, an array buffer as defined by http://www.khronos.org/registry/typedarray/specs/latest/#5
//	opt_Offset, an optional offset within the array buffer where to start decoding
//	Returns a typed array of the appropriate type
//
patapi.webgl.DecodeTypedArray = function( _ArrayBuffer, opt_Offset )
{
	if ( typeof opt_Offset === "undefined" )
		opt_Offset = 0;

	var	View = new DataView( _ArrayBuffer );
	var	Type = View.getInt32( opt_Offset + 0, true );
	var	Length = View.getInt32( opt_Offset + 4, true );

	var	Offset = opt_Offset + 8;

	// Decode content
	switch ( Type )
	{
	case 0:	// Int8
		{
			if ( Offset + Length > _ArrayBuffer.byteLength ) throw "Coded array exceeds ArrayBuffer size !";

			var	R = [];
			for ( var i=0; i < Length; i++ ) R[i] = View.getInt8( Offset + i );
			var	Result = new Int8Array( R );
			return Result;
		}

	case 1:	// Uint8
		{
			if ( Offset + Length > _ArrayBuffer.byteLength ) throw "Coded array exceeds ArrayBuffer size !";

			var	R = [];
			for ( var i=0; i < Length; i++ ) R[i] = View.getUint8( Offset + i );
			var	Result = new Uint8Array( R );
			return Result;
		}

	case 2:	// Int16
		{
			if ( Offset + 2*Length > _ArrayBuffer.byteLength ) throw "Coded array exceeds ArrayBuffer size !";

			var	R = [];
			for ( var i=0; i < Length; i++ ) R[i] = View.getInt16( Offset + 2*i, true );
			var	Result = new Int16Array( R );
			return Result;
		}

	case 3:	// UInt16
		{
			if ( Offset + 2*Length > _ArrayBuffer.byteLength ) throw "Coded array exceeds ArrayBuffer size !";

			var	R = [];
			for ( var i=0; i < Length; i++ ) R[i] = View.getUint16( Offset + 2*i, true );
			var	Result = new Uint16Array( R );
			return Result;
		}

	case 4:	// Int32
		{
			if ( Offset + 4*Length > _ArrayBuffer.byteLength ) throw "Coded array exceeds ArrayBuffer size !";

			var	R = [];
			for ( var i=0; i < Length; i++ ) R[i] = View.getInt32( Offset + 4*i, true );
			var	Result = new Int32Array( R );
			return Result;
		}

	case 5:	// Uint32
		{
			if ( Offset + 4*Length > _ArrayBuffer.byteLength ) throw "Coded array exceeds ArrayBuffer size !";

			var	R = [];
			for ( var i=0; i < Length; i++ ) R[i] = View.getUint32( Offset + 4*i, true );
			var	Result = new Uint32Array( R );
			return Result;
		}

	case 6:	// Float32
		{
			if ( Offset + 4*Length > _ArrayBuffer.byteLength ) throw "Coded array exceeds ArrayBuffer size !";

			var	R = [];
			for ( var i=0; i < Length; i++ ) R[i] = View.getFloat32( Offset + 4*i, true );
			var	Result = new Float32Array( R );
			return Result;
		}

	default:
		throw "Unsupported array type !"
	}
}

// Ensures there is a webgl context associated to the patapi.webgl namespace (only valid if the context was actually created using patapi.webgl.GetContext() !)
patapi.webgl.EnsureGL = function()
{
	if ( !this.gl ) throw "Invalid GL context !";
	return this.gl;
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// The Primitive object
patapi.Primitive = function( gl, _Name, _Shader, _Topology, _ConstructionParams )
{
	this.name = _Name;
	this.shader = _Shader;
	this.topology = _Topology || gl.TRIANGLES;
	this.VB = [];
	this.IB = null;

	if ( _Shader === undefined || !_Shader )
		throw "Invalid shader for primitive \"" + _Name + "\"!";

	if ( _ConstructionParams.indexStream )
	{	// This is a synchronous construction from arrays
		this.BuildSynchronous( _ConstructionParams.vertexTable, _ConstructionParams.indexStream );
	}
	else if ( _ConstructionParams.indexFileName )
	{	// This is an asynchronous construction from file names
		this.BuildAsynchronous( _ConstructionParams.vertexFileNames, _ConstructionParams.indexFileName, _ConstructionParams.callback );
	}
	else if ( _ConstructionParams.blob )
	{	// This is an asynchronous construction from a blob file
		this.BuildFromBlob( _ConstructionParams.blob, _ConstructionParams.callback );
	}
	else
		throw "Unsupported construction parameters !";
}

patapi.Primitive.prototype =
{
	Destroy : function()
	{
		var gl = patapi.webgl.EnsureGL();
		for ( var VBIndex=0; VBIndex < this.VB.length; VBIndex++ )
			gl.deleteBuffer( this.VB[VBIndex] );
		gl.deleteBuffer( this.IB );
	},

	currentIB : null,
	currentVBs : {},
	Use : function()
	{
		var gl = patapi.webgl.EnsureGL();

		if ( this.buffersToLoad )
		{	// Skip, but also mark the primitive for "no render"
			// I do that to ensure that even if the primitive gets valid between a Use() and a Draw(), the Draw() will only be called next time the primitive is Used()
			this.dontRenderBecauseOfLoading = true;
			return;
		}
		else
			this.dontRenderBecauseOfLoading = false;	// Clear that flag...

		// Bind the vertex attributes
		for ( var VBIndex=0; VBIndex < this.VB.length; VBIndex++ )
		{
			var	VB = this.VB[VBIndex];
			if ( patapi.Primitive.prototype.currentVBs[VB.attributeLocation] == VB )
				continue;	// Already set at that location...

			gl.bindBuffer( gl.ARRAY_BUFFER, VB );
			gl.vertexAttribPointer( VB.attributeLocation, VB.attributeLength, VB.attributeType, false, 0, 0 );

			patapi.Primitive.prototype.currentVBs[VB.attributeLocation] = VB;
		}

		if ( patapi.Primitive.prototype.currentIB != this.IB )
		{
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IB );
			patapi.Primitive.prototype.currentIB = this.IB;
		}

		return this;
	},

	Draw : function()
	{
		if ( this.dontRenderBecauseOfLoading )
			return;
		if ( patapi.Primitive.prototype.currentIB != this.IB )
			throw "You must Use() the primitive before calling Draw()!";

		var gl = patapi.webgl.EnsureGL();
		gl.drawElements( this.topology, this.IB.indicesCount, this.IB.indicesType, 0 );
 	},

	// Directly build the primitive with existing arrays
	BuildSynchronous : function( _VertexTable, _IndexStream )
	{
		// Build vertex streams
		var	RemainingShaderAttributesCount = this.shader.attributesCount;
		for ( var StreamName in _VertexTable )
		{
			if ( !_VertexTable.hasOwnProperty( StreamName ) )
				continue;	// Not a custom property...

			var	VertexStream = _VertexTable[StreamName];
			var	VB = this.BuildVertexBuffer( StreamName, VertexStream );
			if ( !VB )
				continue;	// This streaam is certainly not needed by the shader, no VB needs to be built

			this.VB.push( VB );

			// Check if it's one of the shader's attributes
			for ( var ShaderAttributeIndex=0; ShaderAttributeIndex < this.shader.attributesCount; ShaderAttributeIndex++ )
				if ( this.shader.attributes[ShaderAttributeIndex].name == StreamName )
				{	// One mor attribute is matched !
					RemainingShaderAttributesCount--;
					break;
				}
		}

		if ( RemainingShaderAttributesCount > 0 )
			throw "Primitive \"" + this.name + "\" (" + this.VB.length + " vertex streams) doesn't match all of shader \"" + this.shader.name + "\"'s vertex attributes (" + RemainingShaderAttributesCount + " of " + this.shader.attributesCount + " vertex attributes were not matched) !";

		// Build indices
		this.IB = this.BuildIndexBuffer( _IndexStream );

		this.buffersCount = 1 + this.VB.length;
		this.buffersToLoad = 0;	// All buffers are present
	},

	// Build the primitive by launching concurrent requests for the various binary files
	// NOTE: The primitive class keeps a cache of requested files so 2 queries of the same file return the same GL buffer
	BuildAsynchronous : function( _VertexFilesTable, _IndexFile, opt_Callback )
	{
		var	that = this;

		this.buffersCount = this.buffersToLoad = 1 + _VertexFilesTable.length;
		this.remainingShaderAttributesCount = this.shader.attributesCount;

		// Start loading the index file
		this.LoadBinary(
			_IndexFile,
			function( _TypedArray )
			{
				return that.BuildIndexBuffer( _TypedArray );
			},
			function( _Buffer )
			{
				that.IB = _Buffer;
				that.buffersToLoad--;
				if ( opt_Callback )
					opt_Callback( that, that.buffersCount, that.buffersCount - that.buffersToLoad );	// Notify of progress
			} );

		// Then all the vertex files
		for ( var VertexFileIndex=0; VertexFileIndex < _VertexFilesTable.length; VertexFileIndex++ )
		{
			var	VertexFileObject = _VertexFilesTable[VertexFileIndex];
			this.LoadBinary( VertexFileObject.file,
				function( _TypedArray, _VertexFileObject )
				{
					return that.BuildVertexBuffer( _VertexFileObject.Name, _TypedArray );
				},
				function ( _Buffer )
				{
					that.VB.push( _Buffer );
					that.buffersToLoad--;
					if ( opt_Callback )
						opt_Callback( that, that.buffersCount, that.buffersCount - that.buffersToLoad );	// Notify of progress

					// Check if it's one of the shader's attributes
					for ( var ShaderAttributeIndex=0; ShaderAttributeIndex < that.shader.attributesCount; ShaderAttributeIndex++ )
						if ( that.shader.attributes[ShaderAttributeIndex].name == StreamName )
						{	// One mor attribute is matched !
							that.remainingShaderAttributesCount--;
							break;
						}

					// Ensure we have all the necessary buffers
					if ( that.buffersToLoad == 0 && that.remainingShaderAttributesCount > 0 )
						throw "Primitive \"" + that.name + "\" (" + that.VB.length + " vertex streams) doesn't match all of shader \"" + that.shader.name + "\"'s vertex attributes (" + that.remainingShaderAttributesCount + " of " + that.shader.attributesCount + " vertex attributes were not matched) !";

				}, VertexFileObject );
		}
	},

	// Build the primitive by launching a single asynchronous request for the binary blob file
	BuildFromBlob : function( _BlobFile, opt_Callback )
	{
		if ( typeof _BlobFile.File === "undefined" )
			throw "Blob file name is undefined !";
		if ( typeof _BlobFile.IndexStreamOffset === "undefined" )
			throw "Blob index stream offset is undefined !";
		if ( !(_BlobFile.VertexStreams instanceof Array) )
			throw "Blob vertex streams is undefined or not an array !";

		var	that = this;

		this.buffersCount = this.buffersToLoad = 1 + _BlobFile.VertexStreams.length;
		this.remainingShaderAttributesCount = this.shader.attributesCount;

		patapi.helpers.LoadTypedArray( _BlobFile.File, function( _URL, _Buffer )
		{						
			// Build the index stream
			var	IndexStream = patapi.webgl.DecodeTypedArray( _Buffer, _BlobFile.IndexStreamOffset );
			that.IB = that.BuildIndexBuffer( IndexStream );
			that.buffersToLoad--;

			// Rebuild the vertex streams table
			for ( var VertexStreamIndex=0; VertexStreamIndex < _BlobFile.VertexStreams.length; VertexStreamIndex++ )
			{
				var	VertexStream = _BlobFile.VertexStreams[VertexStreamIndex];
				if ( !VertexStream.Name )
					throw "No \"Name\" field on vertex stream !";
				if ( !VertexStream.Offset )
					throw "No \"Offset\" field on vertex stream \"" + VertexStream.Name + "\" !";

				// Check if it's one of the shader's attributes
				var	IsUsedByShader = false;
				for ( var ShaderAttributeIndex=0; ShaderAttributeIndex < that.shader.attributesCount; ShaderAttributeIndex++ )
					if ( that.shader.attributes[ShaderAttributeIndex].name == VertexStream.Name )
					{	// One mor attribute is matched !
						IsUsedByShader = true;
						break;
					}

				that.buffersToLoad--;	// Decrease the amount of buffers to load anyway

				if ( !IsUsedByShader )
					continue;	// No need to build a buffer for that...

				var	StreamContent = patapi.webgl.DecodeTypedArray( _Buffer, VertexStream.Offset );
				var	VB = that.BuildVertexBuffer( VertexStream.Name, StreamContent );

				that.VB.push( VB );
				that.remainingShaderAttributesCount--;
			}

			if ( that.remainingShaderAttributesCount > 0 )
				throw "Primitive \"" + that.name + "\" (" + that.VB.length + " vertex streams) doesn't match all of shader \"" + that.shader.name + "\"'s vertex attributes (" + that.remainingShaderAttributesCount + " of " + that.shader.attributesCount + " vertex attributes were not matched) !";

			if ( opt_Callback )
				opt_Callback( that );	// Notify of progress
		} );
	},

	// Loads a binary array from file and returns the GL buffer from that file
	// A new file request will start hosting a list of referencers
	// Any existing file request will simply add a new referencer that will be notified when the file is ready
	//	_URL, the URL of the buffer file to load
	//	_TransformArray2Buffer, the function that is able of transforming the type array of elements into an actual GL array
	//	_HandleNewBuffer, the function to call once the GL buffer is ready
	//
	cachedBufferRequests : {},	// Map of cached buffer requests, indexed by URL
	LoadBinary : function( _URL, _TransformArray2Buffer, _HandleNewBuffer, _UserData )
	{
		var	that = this;
		var	BufferRequest = patapi.Primitive.prototype.cachedBufferRequests[_URL];
		if ( BufferRequest )
		{	// The request already exists...
			if ( BufferRequest.buffer )
				_HandleNewBuffer( BufferRequest.buffer );	// The buffer is already here !
			else
				// Simply register ourselves as referencer
				BufferRequest.referencers.push( _HandleNewBuffer );	// ### Could a buffer arrive RIGHT between the time I checked for existing buffer and the time I push the referencer ???

			return;
		}

		// Create a new buffer request
		BufferRequest =
		{
			referencers : [ _HandleNewBuffer ],	// Callback functions for notification of load
			buffer : null,						// Buffer has not arrived yet !
		};
		patapi.Primitive.prototype.cachedBufferRequests[_URL] = BufferRequest;

		// Start the asynchronous load
		patapi.helpers.LoadTypedArray( _URL, function( _URL, _ArrayBuffer )
		{
			try
			{
				var	LoadedArray = patapi.webgl.DecodeTypedArray( _ArrayBuffer );			// Transform into typed array
				BufferRequest.buffer = _TransformArray2Buffer( LoadedArray, _UserData );	// Transform into the right kind of buffer

				// Notify the referencers that the buffer is ready
				var	Refs = BufferRequest.referencers;
				for ( var RefIndex=0; RefIndex < Refs.length; RefIndex++ )
					Refs[RefIndex]( BufferRequest.buffer );
			}
			catch ( _e )
			{
				throw "An error occurred while decoding array from file \"" + _URL + "\":\n" + _e;
			}
		} );
	},

	// Builds a GL vertex buffer from a typed array
	BuildVertexBuffer : function( _StreamName, _TypedArrayVertexStream )
	{
		var gl = patapi.webgl.EnsureGL();

		// Retrieve the corresponding attribute in the shader
		var	AttributeIndex = 0;
		for ( ; AttributeIndex < this.shader.attributesCount; AttributeIndex++ )
			if ( this.shader.attributes[AttributeIndex].name == _StreamName )
				break;

 		if ( AttributeIndex >= this.shader.attributesCount )
// Don't break if the primitive is more defined than required...
			return null;
// 			throw "Primitive \"" + this.name + "\" has a vertex table declaring a vertex stream named \"" + _StreamName + "\" that is not declared by the shader !";

		// Retrieve shader attributes infos
		var	AttributeElementSize = 0;
		var	AttributeElementType = null;
		switch ( this.shader.attributes[AttributeIndex].type )
		{
			case	gl.FLOAT_VEC2:
				AttributeElementSize = 2;
				AttributeElementType = gl.FLOAT;
				break;
			case	gl.FLOAT_VEC3:
				AttributeElementSize = 3;
				AttributeElementType = gl.FLOAT;
				break;
			case	gl.FLOAT_VEC4:
				AttributeElementSize = 4;
				AttributeElementType = gl.FLOAT;
				break;
			case	gl.FLOAT_INT2:
				AttributeElementSize = 2;
				AttributeElementType = gl.INT;
				break;
			case	gl.FLOAT_INT3:
				AttributeElementSize = 3;
				AttributeElementType = gl.INT;
				break;
			case	gl.FLOAT_INT4:
				AttributeElementSize = 4;
				AttributeElementType = gl.INT;
				break;

			default:
				throw "Shader \"" + this.shader.name + "\" has an unsupported attribute type \"" + _StreamName + "\" !";
		}

		var	VB = gl.createBuffer();
			VB.attributeLocation = this.shader.attributes[AttributeIndex].location;	// Add a property to remember its location
			VB.attributeLength = AttributeElementSize;								// And the size of its elements
			VB.attributeType = AttributeElementType;								// And the type of its elements

		gl.bindBuffer( gl.ARRAY_BUFFER, VB );
		gl.bufferData( gl.ARRAY_BUFFER, _TypedArrayVertexStream, gl.STATIC_DRAW );

		return VB;
	},

	// Builds a GL index buffer from a typed array of Uint16 or Uint32 values
	BuildIndexBuffer : function( _TypedArrayIndexStream )
	{
		var gl = patapi.webgl.EnsureGL();

		var	IB = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, IB );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, _TypedArrayIndexStream, gl.STATIC_DRAW );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

		// Add infos about indice types
		IB.indicesCount = _TypedArrayIndexStream.length;
		var	ElementSize = _TypedArrayIndexStream.byteLength / _TypedArrayIndexStream.length;
		switch ( ElementSize )
		{
		case 2:
			IB.indicesType = gl.UNSIGNED_SHORT;
			break;

		case 4:
			IB.indicesType = gl.UNSIGNED_INT;
			break;

		default:
			throw "Unsupported type of index array ! Supported types are Uint16Array and Uint32Array."
		}

		return IB;
	},
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// The shader object
patapi.Shader = function( gl, _Name, _VS, _PS )
{
	try
	{
		this.name = _Name;
		this.program = gl.createProgram();

		// Create the vertex shader
		this.VS = gl.createShader( gl.VERTEX_SHADER );
		gl.shaderSource( this.VS, _VS );
		gl.compileShader( this.VS );
		if ( !gl.getShaderParameter( this.VS, gl.COMPILE_STATUS ) )
			throw "Error compiling vertex shader:\n" + gl.getShaderInfoLog( this.VS );
		gl.attachShader( this.program, this.VS );

		// Create the pixel shader
		this.PS = gl.createShader( gl.FRAGMENT_SHADER );
		gl.shaderSource( this.PS, _PS );
		gl.compileShader( this.PS );
		if ( !gl.getShaderParameter( this.PS, gl.COMPILE_STATUS ) )
			throw "Error compiling pixel shader:\n" + gl.getShaderInfoLog( this.PS );
		gl.attachShader( this.program, this.PS );

		// Link
		gl.linkProgram( this.program );
		if ( !gl.getProgramParameter( this.program, gl.LINK_STATUS ) )
			throw "Error linking the shader program:\n" + gl.getProgramInfoLog( this.program );

		// List required attributes to use that shader
		this.attributesCount = gl.getProgramParameter( this.program, gl.ACTIVE_ATTRIBUTES );
		this.attributes = [];
		for ( var AttributeIndex=0; AttributeIndex < this.attributesCount; AttributeIndex++ )
		{
			this.attributes[AttributeIndex] = gl.getActiveAttrib( this.program, AttributeIndex );
			this.attributes[AttributeIndex].location = gl.getAttribLocation( this.program, this.attributes[AttributeIndex].name );
		}

		// List uniforms
		this.samplersCount = 0;
		this.uniformsCount = gl.getProgramParameter( this.program, gl.ACTIVE_UNIFORMS );
		this.uniforms = {};
		for ( var UniformIndex=0; UniformIndex < this.uniformsCount; UniformIndex++ )
		{
			var	UniformDescriptor = gl.getActiveUniform( this.program, UniformIndex );
			this.uniforms[UniformDescriptor.name] = new patapi.ShaderVariable( this, UniformDescriptor );
		}

		// Build the "SafeSet()" function
		this.uniforms.SafeSet = function( _UniformName, a, b, c, d )
		{
			if ( !this[_UniformName] )
				return;

			if ( d !== undefined )
				this[_UniformName].Set( a, b, c, d );
			else
			{
				if ( c !== undefined )
					this[_UniformName].Set( a, b, c );
				else
				{
					if ( b !== undefined )
						this[_UniformName].Set( a, b );
					else
						this[_UniformName].Set( a );
				}
			}
		}
	}
	catch ( _e )
	{
		throw "Error during creation of shader \"" + _Name + "\":\n" + _e;
	}
}

patapi.Shader.prototype = 
{
 	currentShader : null,

	Destroy : function()
	{
		var gl = patapi.webgl.EnsureGL();

		gl.detachShader( this.program, this.VS );
		gl.deleteShader( this.VS );
		gl.detachShader( this.program, this.PS );
		gl.deleteShader( this.PS );
		gl.deleteProgram( this.program );
	},


	// Use the shader for drawing
	//	opt_RenderCallback, the render callback of the form function( _Shader, _UserData )
	//	opt_ShaderSwitchCallback, an optional callback that will be called if there is a shader switch
	//
	Use : function( opt_RenderCallback, opt_ShaderSwitchCallback, opt_UserData )
	{
		var gl = patapi.webgl.EnsureGL();
		if ( patapi.Shader.prototype.currentShader != this )
		{	// There was a change of shader !

			// Use this shader
			gl.useProgram( this.program );

			// Enable all of the vertex attribute arrays
			for ( var AttributeIndex=0; AttributeIndex < this.attributesCount; AttributeIndex++ )
			{
				var	location = this.attributes[AttributeIndex].location;
				gl.enableVertexAttribArray( location );
			}

			patapi.Shader.prototype.currentShader = this;	// Make us the current shader

			// Notify of the switch
			if ( opt_ShaderSwitchCallback )
				opt_ShaderSwitchCallback( this );
		}

		// Perform rendering
		if ( opt_RenderCallback )
			opt_RenderCallback( this, opt_UserData );

		return this;
	},

	// Sends the texture to the GPU and assigns it to a specific sampler
	//	_VarID, the variable ID to assign the texture to
	//	_Texture, the texture or FBO to assign
	//	_SamplerIndex, the index of the texture sampler this texture should be associated to
	//
	SetTexture : function( _VarID, _Texture, _SamplerIndex )
	{
		var gl = patapi.webgl.EnsureGL();

		var	Texture = null;
		if ( _Texture instanceof WebGLTexture )
			Texture = _Texture;	// We were directly given a texture...
		else if ( _Texture instanceof patapi.FBO )
			Texture = _Texture.texture;
		else
			throw "Unrecognized texture type !";

		gl.activeTexture( gl.TEXTURE0 + _SamplerIndex );
		gl.bindTexture( gl.TEXTURE_2D, Texture );
		gl.uniform1i( _VarID, _SamplerIndex );	// We tell the shader which sampler to use
	}
};

// A shader variable accessor
patapi.ShaderVariable = function( _Owner, _Descriptor )
{
	var gl = patapi.webgl.EnsureGL();

	this.owner = _Owner;
	this.descriptor = _Descriptor;
	this.location = gl.getUniformLocation( _Owner.program, _Descriptor.name );

	function EnsureInUse( that )
	{
		if ( patapi.Shader.prototype.currentShader != that.owner )
			throw "Attempting to set variable \"" + that.descriptor.name + "\" on shader \"" + that.owner.name + "\" that is not currently in use !";
	}

	// Dynamically create the Set() function based on the uniform type
	var	that = this;
	var	Function = null;
	switch ( _Descriptor.type )
	{
	// Floats
	case gl.FLOAT:
		Function = function( x ) { EnsureInUse( that ); gl.uniform1f( that.location, x ); }
		break;
	case gl.FLOAT_VEC2:
		Function = function( x, y ) { EnsureInUse( that ); arguments.length == 1 ? gl.uniform2f( that.location, x.x, x.y ) : gl.uniform2f( that.location, x, y ); }
		break;
	case gl.FLOAT_VEC3:
		Function = function( x, y, z ) { EnsureInUse( that ); arguments.length == 1 ? gl.uniform3f( that.location, x.x, x.y, x.z ) : gl.uniform3f( that.location, x, y, z ); }
		break;
	case gl.FLOAT_VEC4:
		Function = function( x, y, z, w ) { EnsureInUse( that ); arguments.length == 1 ? gl.uniform4f( that.location, x.x, x.y, x.z, x.w ) : gl.uniform4f( that.location, x, y, z, w ); }
		break;

	// Ints & Bools
	case gl.INT:
	case gl.BOOL:
		Function = function( x ) { EnsureInUse( that ); gl.uniform1i( that.location, x ); }
		break;
	case gl.INT_VEC2:
	case gl.BOOL_VEC2:
		Function = function( x, y ) { EnsureInUse( that ); gl.uniform2i( that.location, x, y ); }
		break;
	case gl.INT_VEC3:
	case gl.BOOL_VEC3:
		Function = function( x, y, z ) { EnsureInUse( that ); gl.uniform3i( that.location, x, y, z ); }
		break;
	case gl.INT_VEC4:
	case gl.BOOL_VEC4:
		Function = function( x, y, z, w ) { EnsureInUse( that ); gl.uniform4i( that.location, x, y, z, w ); }
		break;

	// Matrices
	case gl.FLOAT_MAT2:
		Function = function( m ) { EnsureInUse( that ); gl.uniformMatrix2fv( that.location, m ); }	// Expects a Float[2*2]
		break;
	case gl.FLOAT_MAT3:
		Function = function( m ) { EnsureInUse( that ); gl.uniformMatrix3fv( that.location, m ); }	// Expects a Float[3*3]
		break;
	case gl.FLOAT_MAT4:
		Function = function( m )
		{	// Expects a Float[4*4] or a mat4
			EnsureInUse( that );
			if ( m instanceof Array )
				gl.uniformMatrix4fv( that.location, false, m );
			else	// Assume a mat4
				gl.uniformMatrix4fv( that.location, false, m.asArray() );
		}
		break;

	// Textures
	case gl.SAMPLER_2D:
		this.samplerIndex = this.owner.samplersCount++;	// We have one more sampler !
		Function = function( _Texture )
		{
			EnsureInUse( that );
			var	Texture = _Texture instanceof patapi.FBO ? _Texture.texture : _Texture;
			that.owner.SetTexture( that.location, Texture, _Texture.samplerIndex ? _Texture.samplerIndex : that.samplerIndex );
		}
		break;
	case gl.SAMPLER_CUBE:
		throw "TODO: Support cube maps !";

	default:
		throw "Unsupported uniform type \"" + _Descriptor.type + "\" !";
	}
	this["Set"] = Function;
}

patapi.ShaderVariable.prototype =
{
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// The camera object
patapi.Camera = function( gl, _Name, _FOV, _AspectRatio, _Near, _Far )
{
	this.name = _Name;

	this.Camera2World = mat4.identity();
	this.World2Camera = mat4.identity();
	this.Camera2Proj = mat4.identity();
	this.Proj2Camera = mat4.identity();
	this.SetPerspective( _FOV, _AspectRatio, _Near, _Far );
}

patapi.Camera.prototype =
{
	Destroy : function()
	{

	},

	// Directly sets the camera transform
	SetCamera2World : function( _Camera2World )
	{
		this.Camera2World = new mat4( _Camera2World );
		this.World2Camera = this.Camera2World.inverse();
		this.__UpdateCompositions();
	},

	// Sets the camera transform in world space
	LookAt : function( _Position, _Target, _Up )
	{
		if ( !_Up )
			_Up = vec3.unitY();

		this.Position = _Position;
		this.Target = _Target;

		this.Camera2World.makeLookAt( _Position, _Target, _Up );
		this.World2Camera = this.Camera2World.inverse();

// CHECK
//var	Identity = this.Camera2World.mul_( this.World2Camera );

		this.__UpdateCompositions();
	},

	// Sets the perspective projection matrix
	SetPerspective : function( _FOV, _AspectRatio, _Near, _Far )
	{
		this.FOV = _FOV;
		this.AspectRatio = _AspectRatio;
		this.Near = _Near;
		this.Far = _Far;

		// Build ray construction vector
		var	H = Math.tan( 0.5 * _FOV );
		var	W = _AspectRatio * H;
		this.rayBasis = new vec3( W, H, 1 );

		// Build projection matrix
		this.Camera2Proj.makePerspective( _FOV, _AspectRatio, _Near, _Far );
		this.Proj2Camera = this.Camera2Proj.inverse();

// CHECK
// var	Identity = this.Camera2Proj.mul_( this.Proj2Camera );
// var	NearClipped = new vec4( 0, 0, _Near, 1 ).mul( this.Camera2Proj );
// 	NearClipped = NearClipped.div( NearClipped.w );
// var	FarClipped = new vec4( 0, 0, _Far, 1 ).mul( this.Camera2Proj );
// 	FarClipped = FarClipped.div( FarClipped.w );

		this.__UpdateCompositions();
	},

	//===================== PRIVATE =====================
	__UpdateCompositions : function()
	{
		this.World2Proj = this.World2Camera.mul_( this.Camera2Proj );
		this.Proj2World = this.Proj2Camera.mul_( this.Camera2World );
	},
};

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// The FBO object (possibly with an accompanying depth buffer)
patapi.FBO = function( gl, _Name, _Width, _Height, _Format, _WrapMode, _FilteringMode, opt_UseDepth )
{
	_Width = _Width | 0;
	_Height = _Height | 0;
	if ( _Width <= 0 || _Height <= 0 )
		throw "Invalid size!";

	this.name = _Name;
	this.width = _Width;
	this.height = _Height;
	this.format = _Format || gl.RGBA;
	this.type = gl.UNSIGNED_BYTE;

	if ( this.format == gl.RGBA_FLOAT )
	{	// Handle special floating-point format...
		this.format = gl.RGBA;
		this.type = gl.FLOAT;
	}

	_WrapMode = _WrapMode || gl.REPEAT;
	_FilteringMode = _FilteringMode || gl.LINEAR_MIPMAP_LINEAR;
	var	MagFilter = gl.LINEAR;
	if ( _FilteringMode == gl.NEAREST_MIPMAP_NEAREST || _FilteringMode == gl.NEAREST_MIPMAP_LINEAR || _FilteringMode == gl.NEAREST )
		MagFilter = gl.NEAREST;

	if ( !this.IsPOT() )
	{	// Ensure we have the proper states in case of non POT size !
		if ( _WrapMode != gl.CLAMP_TO_EDGE )
			throw "A non power-of-two sized FBO must have its wrap mode set to CLAMP_TO_EDGE !";
		if ( _FilteringMode != gl.NEAREST && _FilteringMode != gl.LINEAR )
			throw "A non power-of-two sized FBO can only have its filtering modes set to gl.NEAREST or gl.LINEAR !";
	}

	// Create the frame buffer
	this.buffer = gl.createFramebuffer();
	gl.bindFramebuffer( gl.FRAMEBUFFER, this.buffer );

	// Create the texture
	this.texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, this.texture );

	try
	{
		gl.texImage2D( gl.TEXTURE_2D, 0, this.format, _Width, _Height, 0, gl.RGBA, this.type, null );	// NULL means reserve texture memory, but texels are undefined
	}
	catch ( _e )
	{	// Failed with empty pixels ??
		var	Pixels = null;
		if ( this.type == gl.UNSIGNED_BYTE )
		{
			switch ( this.format )
			{
			case gl.RGB:
				Pixels = new Uint8Array( _Width * _Height * 3 );
				break;
			case gl.RGBA:
				Pixels = new Uint8Array( _Width * _Height * 4 );
				break;
			}
		}
		else
		{
			switch ( this.format )
			{
			case gl.RGB:
				Pixels = new Float32Array( _Width * _Height * 3 );
				break;
			case gl.RGBA:
				Pixels = new Float32Array( _Width * _Height * 4 );
				break;
			}
		}
		gl.texImage2D( gl.TEXTURE_2D, 0, this.format, _Width, _Height, 0, gl.RGBA, this.type, Pixels );
	}

	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _WrapMode );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _WrapMode );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _FilteringMode );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, MagFilter );

	// Attach the 2D texture to this FBO's mip level #0
	gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0 );
	
	// Believe it or not but I pulled my hair off for about an entire day because of that FU..ING line down there !
	gl.generateMipmap( gl.TEXTURE_2D );	// Apparently, even though we use only 1 mip level, we MUST call this stupid mipmap generation for some reason...
// 	if ( gl.getError() != 0 )
// 		throw "Failed to generate mip-maps for FBO \"" + this.name + "\": must be a problem with that power of two shit !";

	if ( opt_UseDepth )
	{
		if ( opt_UseDepth instanceof WebGLRenderbuffer )
		{	// Bind existing buffer
			gl.bindRenderbuffer( gl.RENDERBUFFER, opt_UseDepth );
//			gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _Width, _Height );
			gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, opt_UseDepth );	// Attach depth buffer to FBO
		}
		else
		{	// Create an associated depth buffer
			this.depthBuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer( gl.RENDERBUFFER, this.depthBuffer );
			gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _Width, _Height );
			gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer );	// Attach depth buffer to FBO
		}
	}

	// Ensure the FBO is complete
	var	status = gl.checkFramebufferStatus( gl.FRAMEBUFFER );
	if ( status != gl.FRAMEBUFFER_COMPLETE )
		throw "FBO \"" + _Name + "\" cannot be completed... Perhaps the video card does not support them ?";

	// Unbind
	gl.bindTexture( gl.TEXTURE_2D, null );
	gl.bindRenderbuffer( gl.RENDERBUFFER, null );
	gl.bindFramebuffer( gl.FRAMEBUFFER, null);
}

patapi.FBO.prototype = 
{
	boundFBO : null,

	getdUV2 : function()	{ return new vec2( 1.0 / this.width, 1.0 / this.height ); },
	getdUV3 : function()	{ return new vec3( 1.0 / this.width, 1.0 / this.height, 0.0 ); },

	Destroy : function()
	{
		var gl = patapi.webgl.EnsureGL();
		gl.deleteFramebuffer( this.buffer );
		gl.deleteTexture( this.texture );
		if ( !!this.depthBuffer )
			gl.deleteRenderbuffer( this.depthBuffer );
	},

	// Binds/Unbinds the FBO for rendering
	Bind : function()
	{
		var gl = patapi.webgl.EnsureGL();
		if ( patapi.FBO.prototype.boundFBO == this )
			return;

		gl.bindFramebuffer( gl.FRAMEBUFFER, this.buffer );
		if ( this.depthBuffer )
			gl.bindRenderbuffer( gl.RENDERBUFFER, this.depthBuffer );

		// Write to the entire buffer
		gl.viewport( 0, 0, this.width, this.height );

		patapi.FBO.prototype.boundFBO = this;
	},
	UnBind : function()
	{
		var gl = patapi.webgl.EnsureGL();
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		if ( this.depthBuffer )
			gl.bindRenderbuffer( gl.RENDERBUFFER, null );

		// Restore viewport
		gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

		patapi.FBO.prototype.boundFBO = null;
	},

	// Clears the FBO (must be bound first !)
	Clear : function( _R, _G, _B, _A, opt_Depth )
	{
		var gl = patapi.webgl.EnsureGL();
		gl.clearColor( _R, _G, _B, _A );
		if ( typeof opt_Depth !== 'undefined' )
		{	// Clear both color and depth...
			gl.clearDepth( opt_Depth );
			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		}
		else
			// Clear only color
			gl.clear( gl.COLOR_BUFFER_BIT );
	},

	// Clears the FBO's depth buffer (must be bound first !)
	ClearDepth : function( opt_Depth )
	{
		var gl = patapi.webgl.EnsureGL();
		if ( typeof opt_Depth !== 'undefined' )
			opt_Depth = 1.0;

		gl.clearDepth( opt_Depth );
		gl.clear( gl.DEPTH_BUFFER_BIT );
	},

	IsPOT : function( a )
	{
		if ( a === undefined ) return this.IsPOT( this.width ) && this.IsPOT( this.height );

		a = a || 0;		// Force as INT
		a = a & (a-1);	// Should be 0 if POT...
		return a == 0;
	},
};