//////////////////////////////////////////////////////////////////////////
// This file contains helpers to load my proprietary scene files
//////////////////////////////////////////////////////////////////////////
//
o3djs.require( 'patapi' );
o3djs.require( 'patapi.webgl' );
o3djs.provide( 'patapi.scenefile' );

// Add the scenefile extension
patapi.scenefile = patapi.scenefile || {};


//////////////////////////////////////////////////////////////////////////
// Loads a JSON scene
//	_URL, the URL of the JSON scene file to load
// opt_Options, an optional Options object (see right below for the possible options and their default values)
// Returns a Scene object
//
patapi.scenefile.LoadScene = function( gl, _Name, _URL, opt_Options )
{
	var	Options =
	{
		URLisJSON : false,					// If true, the provided URL is directly the JSON string
		flipTexturesY : false,				// if true, textures are flipped vertically (useful for scenes exported from MAX)
		throwOnTextureLoadFail : true,		// If true, any texture failing to load will throw an exception
		throwOnSceneLoadFail : true,		// If true, any error while loading the scene will throw an exception. If false, the default "Error Scene" is build instead (a red cube)
		processPrimitive : null,			// A callback that will be called on each new primitive. Must be of the form function( _Scene, _Primitive )
		processObject : null,				// A callback that will be called on each new object. Must be of the form function( _Scene, _Object )
		processTexturePath : null,			// A callback that will be used prior loading textures so you have a chance to rectify texture paths
		progressCallback : null,			// The progress callback must be of the form function( _Scene, _TotalTexturesCount, _LoadedTexturesCount, _TotalPrimitivesCount, _LoadedPrimitivesCount, opt_Error )
											// You can measure progress by taking the ratio of these numbers
	};
	if ( opt_Options )
		Options = patapi.helpers.Extend( opt_Options, Options );	// Merge our default options with the provided options

	var	JSON = null;
	if ( !Options.URLisJSON )
	{
		var	FileContent = null;
		try
		{
			FileContent = patapi.helpers.LoadFileSynchronous( _URL );
		}
		catch ( _e )
		{	// Rethrow with more infos
			throw "An error occurred while loading the scene file from \"" + _URL + "\" :\n" + _e;
		}

		try
		{
			JSON = eval( '(' + FileContent + ')' );
		}
		catch ( _e )
		{	// Rethrow with more infos
			throw "An error occurred while parsing the JSON scene file from \"" + _URL + "\" :\n" + _e;
		}
	}
	else
		JSON = _URL;

	return new patapi.Scene( gl, _Name, _URL, JSON, Options );
}

//////////////////////////////////////////////////////////////////////////
// The Scene object
patapi.Scene = function( gl, _Name, _SourceURL, _JSON, _Options )
{
	this.gl = gl;
	this.name = _Name;
	this.options = _Options;
	this.isSceneReady = false;

	this.Build( _SourceURL, _JSON );
}

patapi.Scene.prototype =
{
	Destroy : function()
	{
		this.objects = [];	// Destroy object first so nothing is anymore

		if ( this.primitives )
			for ( var PrimitiveIndex=0; PrimitiveIndex < this.primitives.length; PrimitiveIndex++ )
				this.primitives[PrimitiveIndex].Destroy();
		this.primitives = [];
		this.primitivesStillLoading = 0;

		if ( this.shaders )
			for ( var ShaderIndex=0; ShaderIndex < this.shaders.length; ShaderIndex++ )
				this.shaders[ShaderIndex].Destroy();
		this.shaders = [];

		if ( this.textures )
			for ( var TextureIndex=0; TextureIndex < this.textures.length; TextureIndex++ )
				this.gl.deleteTexture( this.textures[TextureIndex] );
		this.textures = [];
		this.texturesStillLoading = 0;
	},

	// =================== Loads the scene ===================
	Build : function( _SourceURL, _JSON )
	{
		var	that = this;

		this.Destroy();	// Destroy any existing scene

		this.sourceURL = _SourceURL;
		this.sceneBasePath = patapi.helpers.SplitPath( _SourceURL ).Path;

		try
		{
			this.ParseTextures( gl, _JSON,
				function()
				{
					that.ParseShaders( gl, _JSON );
					that.ParseMaterials( gl, _JSON );
 					that.ParsePrimitives( gl, _JSON );
 					that.ParseObjects( gl, _JSON );

					that.isSceneReady = true;		// mark the scene as now ready for rendering...

				} );	// Start asynchronous loading of textures ASAP
		}
		catch ( _e )
		{
			this.ERROR = "An error occurred while parsing JSON scene file \"" + this.name + "\" :\n" + _e;
			if ( this.options.throwOnSceneLoadFail )
				throw this.ERROR;

			this.options.throwOnSceneLoadFail = true;	// This time, we force the throw of exception !

			// Simply load the ERROR SCENE instead (i.e. a read cube)
			this.Build( "Error", patapi.Scene.prototype.__ErrorSceneJSON );
		}
	},

	// =================== Updates the entire scene hierarchy ===================
	// Expects an optional callback of the form function( _Primitive, _Time, _DeltaTime )
	Update : function( _Time, _DeltaTime, opt_Callback )
	{
		if ( !this.isSceneReady )
			return;

		for ( var ObjectIndex=0; ObjectIndex < this.objects.length; ObjectIndex++ )
			this.objects[ObjectIndex].Update( _Time, _DeltaTime, opt_Callback );
	},

	// =================== Renders the entire scene hierarchy ===================
	//	_RenderCallback, a callback of the form function( _Primitive, _Material, _Local2World )
	//	opt_MaterialCallback, an optional callback that will be called whenever a material gets active
	Render : function( _RenderCallback, opt_MaterialCallback )
	{
		if ( !this.isSceneReady )
			return;

		for ( var ObjectIndex=0; ObjectIndex < this.objects.length; ObjectIndex++ )
			this.objects[ObjectIndex].Render( _RenderCallback, opt_MaterialCallback );
	},

	EndRender : function()
	{
		patapi.Shader.prototype.currentShader = null;	// Clear shader so it's set back next time with new values
	},

	// =================== Parses the shaders, compile the shaders and store them ===================
	ParseShaders : function( gl, _JSON )
	{
		this.shaders = [];
		try
		{
			var	Shaders = _JSON["Shaders"];
			if ( !Shaders )
				throw "Field \"Shaders\" not found !";
			if ( !(Shaders instanceof Array) )
				throw "Field \"Shaders\" is not an array !";

			for ( var ShaderIndex=0; ShaderIndex < Shaders.length; ShaderIndex++ )
			{
				var	JSONShader = Shaders[ShaderIndex];
				this.shaders[JSONShader.ID] = this.CreateShaderFromJSON__( JSONShader );
			}
		}
		catch ( _e )
		{
			throw "An error occurred while parsing shaders:\n" + _e;
		}
	},

	// Reload the shaders
	ReloadShaders : function()
	{
		for ( var ShaderIndex=0; ShaderIndex < this.shaders.length; ShaderIndex++ )
		{
			var	JSONShader = this.shaders[ShaderIndex].JSONSource;
			this.shaders[ShaderIndex] = this.CreateShaderFromJSON__( JSONShader );
		}
	},

	// Reload the shaders
	CreateShaderFromJSON__ : function( _JSONShader )
	{
		try
		{
			// Get back the VS string
			var	VSString = "";
			if ( _JSONShader.VS )
				VSString = _JSONShader.VS;	// Simple copy
			else if ( _JSONShader.VSFile )
				VSString = patapi.helpers.LoadFileSynchronous( this.sceneBasePath + _JSONShader.VSFile );
			else
				throw "Couldn't find a VS or VSFile object to create the VertexShader from !";

			// Get back the PS string
			var	PSString = "";
			if ( _JSONShader.PS )
				PSString = _JSONShader.PS;	// Simple copy
			else if ( _JSONShader.PSFile )
				PSString = patapi.helpers.LoadFileSynchronous( this.sceneBasePath + _JSONShader.PSFile );
			else
				throw "Couldn't find a PS or PSFile object to create the PixelShader from !";

			// Load the shader and store it at its ID in the array
			var	Shader = patapi.webgl.CreateShader( _JSONShader.Name, VSString, PSString );
				Shader.JSONSource = _JSONShader;

			return Shader;
		}
		catch ( _e )
		{
			throw "Shader \"" + _JSONShader.Name + "\" failed to load:\n" + _e;
		}
	},

	// =================== Parses the materials and store them ===================
	ParseMaterials : function( gl, _JSON )
	{
		this.materials = [];
		try
		{
			var	Materials = _JSON["Materials"];
			if ( !Materials )
				throw "Field \"Materials\" not found !";
			if ( !(Materials instanceof Array) )
				throw "Field \"Materials\" is not an array !";

			for ( var MaterialIndex=0; MaterialIndex < Materials.length; MaterialIndex++ )
			{
				var	JSONMaterial = Materials[MaterialIndex];
				try
				{
					var NewSceneMaterial = new patapi.SceneMaterial( this, JSONMaterial );
					this.materials[NewSceneMaterial.ID] = NewSceneMaterial;
				}
				catch ( _e )
				{
					throw "Material \"" + JSONMaterial.Name + "\" failed to load: " + _e + "\n";
				}
			}
		}
		catch ( _e )
		{
			throw "An error occurred while parsing materials:\n" + _e;
		}
	},

	// =================== Parses the primitives, build the streams and store them ===================
	ParsePrimitives : function( gl, _JSON )
	{
		this.primitives = [];
		this.primitivesStillLoading = 0;
		try
		{
			var	Primitives = _JSON["Primitives"];
			if ( !Primitives )
				throw "Field \"Primitives\" not found !";
			if ( !(Primitives instanceof Array) )
				throw "Field \"Primitives\" is not an array !";

			for ( var PrimitiveIndex=0; PrimitiveIndex < Primitives.length; PrimitiveIndex++ )
			{
				var	JSONPrimitive = Primitives[PrimitiveIndex];
				try
				{
					var NewScenePrimitive = new patapi.ScenePrimitive( this, JSONPrimitive );
					this.primitives[NewScenePrimitive.ID] = NewScenePrimitive;
					this.primitivesStillLoading++;

					// Process primitive...
					if ( this.options.processPrimitive )
						this.options.processPrimitive( this, NewScenePrimitive );
				}
				catch ( _e )
				{
					throw "Primitive \"" + JSONPrimitive.Name + "\" failed to load: " + _e + "\n";
				}
			}
		}
		catch ( _e )
		{
			throw "An error occurred while parsing primitives:\n" + _e;
		}
	},

	// =================== Parses the hierarchical objects ===================
	ParseObjects : function( gl, _JSON )
	{
		this.objects = [];
		try
		{
			var	Objects = _JSON["Objects"];
			if ( !Objects )
				throw "Field \"Objects\" not found !";
			if ( !(Objects instanceof Array) )
				throw "Field \"Objects\" is not an array !";

			for ( var ObjectIndex=0; ObjectIndex < Objects.length; ObjectIndex++ )
			{
				var	JSONObject = Objects[ObjectIndex];
				var NewSceneObject = new patapi.SceneObject( this, JSONObject );
				this.objects.push( NewSceneObject );

				// Process object...
				if ( this.options.processObject )
					this.options.processObject( this, NewSceneObject );
			}
		}
		catch ( _e )
		{
			throw "An error occurred while parsing objects:\n" + _e;
		}
	},

	// =================== Parses the textures and stores them ===================
	ParseTextures : function( gl, _JSON, _CallbackContinueLoadingScene )
	{
		this.textures = [];
		this.textureLoadErrors = "";
		this.texturesStillLoading = 0;

		var	SynchronousTextures = [];
		var	AsynchronousTextures = [];
		var	SceneIsLoading = false;

		try
		{
			var	Textures = _JSON["Textures"];
			if ( !Textures )
				throw "Field \"Textures\" not found !";
			if ( !(Textures instanceof Array) )
				throw "Field \"Textures\" is not an array !";

			for ( var TextureIndex=0; TextureIndex < Textures.length; TextureIndex++ )
			{
				var	JSONTexture = Textures[TextureIndex];
				try
				{
					// Read back wrap mode
					var	WrapMode = gl.REPEAT;
					switch ( JSONTexture.WrapMode )
					{
						case "REPEAT": WrapMode = gl.REPEAT; break;
						case "CLAMP": WrapMode = gl.CLAMP_TO_EDGE; break;
						case "MIRROR": WrapMode = gl.MIRRORED_REPEAT; break;
						default: throw "Unrecognized wrap mode \"" + JSONTexture.WrapMode + "\" !";
					}

					// Read back filtering mode
					var	FilteringMode = gl.LINEAR_MIPMAP_LINEAR;
					switch ( JSONTexture.FilteringMode )
					{
						case "NEAREST_MIP_NEAREST": FilteringMode = gl.NEAREST_MIPMAP_NEAREST; break;
						case "NEAREST_MIP_LINEAR": FilteringMode = gl.NEAREST_MIPMAP_LINEAR; break;
						case "LINEAR_MIP_NEAREST": FilteringMode = gl.LINEAR_MIPMAP_NEAREST; break;
						case "LINEAR_MIP_LINEAR": FilteringMode = gl.LINEAR_MIPMAP_LINEAR; break;
						default: throw "Unrecognized filtering mode \"" + JSONTexture.FilteringMode + "\" !";
					}

					// Rectify texture path
					var	TexturePath = this.sceneBasePath + JSONTexture.URL;
					if ( this.options.processTexturePath )
						TexturePath = this.options.processTexturePath( TexturePath );

					// Load the texture and store it at its ID in the array
					var that = this;
					this.textures[JSONTexture.ID] = patapi.webgl.LoadImageTexture( JSONTexture.Name, TexturePath, WrapMode, FilteringMode,
						function( _URL, _Texture, opt_Error )
						{
							if ( opt_Error )
							{
								that.textureLoadErrors += ". Texture \"" + JSONTexture.Name + "\" failed to load: " + opt_Error + "\n";
								if ( that.options.throwOnTextureLoadFail )
									throw that.textureLoadErrors;
								return;
							}

							// We're finally loaded !
							_Texture.isLoaded = true;
							that.texturesStillLoading--;			// One less loading texture...
							that.NotifyProgress();

							if ( SynchronousTextures.length == 0 )
							{	// All synchronous textures were loaded
								if ( SceneIsLoading )
									return;	// And scene is loading... Just wait...

								// Scene is now loading...
								SceneIsLoading = true;

								// Load asynchronous textures then...
								while ( AsynchronousTextures.length > 0 )
								{
									var	Texture = AsynchronousTextures.pop();
									Texture.image.src = Texture.URL;
								}

								// Then finish loading the scene
								_CallbackContinueLoadingScene();

								return;
							}

							// All synchronous textures have not yet loaded, load the next one...
							var	Texture = SynchronousTextures.pop();
							Texture.image.src = Texture.URL;

						}, this.options.flipTexturesY, true );
					this.textures[JSONTexture.ID].isLoaded = false;
					this.textures[JSONTexture.ID].temp = typeof JSONTexture.WaitTexID !== "undefined" ? this.textures[JSONTexture.WaitTexID] : null;
					this.texturesStillLoading++;					// Another loading texture

					if ( JSONTexture.SynchronousLoad )
						SynchronousTextures.push( this.textures[JSONTexture.ID] );
					else
						AsynchronousTextures.push( this.textures[JSONTexture.ID] );
				}
				catch ( _e )
				{
					this.textureLoadErrors += ". Texture \"" + JSONTexture.Name + "\" failed to load: " + _e + "\n";
				}
			}

			if ( this.options.throwOnTextureLoadFail && this.textureLoadErrors != "" )
				throw this.textureLoadErrors;	// Throw all at once
		}
		catch ( _e )
		{
			throw "An error occurred while parsing textures:\n" + _e;
		}

		// Start loading synchronous textures first
		// Doing this will cascade the remaining texture downloads & scene loading...
		if ( SynchronousTextures.length > 0 )
		{
			var	Texture = SynchronousTextures.pop();
			Texture.image.src = Texture.URL;
		}
		else if ( AsynchronousTextures.length > 0 )
		{
			var	Texture = AsynchronousTextures.pop();
			Texture.image.src = Texture.URL;
		}
	},

	NotifyProgress : function()
	{
		if ( this.options.progressCallback && !this.avoidFurtherNotifications )
			this.options.progressCallback( this, this.textures.length, this.textures.length - this.texturesStillLoading, this.primitives.length, this.primitives.length - this.primitivesStillLoading, this.ERROR ? this.ERROR : undefined );

		if ( this.ERROR )
			this.avoidFurtherNotifications = true;	// Once is enough !
	}
};


//////////////////////////////////////////////////////////////////////////
// The SceneMaterial object
patapi.SceneMaterial = function( _Scene, _JSONMaterial )
{
	this.owner = _Scene;
	this.name = _JSONMaterial.Name;
	this.ID = _JSONMaterial.ID;

	var	gl = _Scene.gl;

	// Retrieve shader ID
	if ( typeof _JSONMaterial.ShaderID === "undefined" )
		throw "Field \"ShaderID\" is undefined !";
	if ( _JSONMaterial.ShaderID < 0 || _JSONMaterial.ShaderID >= _Scene.shaders.length )
		throw "Shader ID " + _JSONMaterial.ShaderID + " out of range ! Only " + _Scene.shaders.length + " are registered !";
	this.shader = _Scene.shaders[_JSONMaterial.ShaderID];
	this.uniforms = this.shader.uniforms;	// Copy our shader's uniforms

	// Prepare uniform assignment objects for future material use
	this.defaultUniformValues = [];
	if ( !(_JSONMaterial.Uniforms instanceof Array) || _JSONMaterial.Uniforms.length == 0 )
		return;	// No default uniforms...

	for ( var UniformIndex=0; UniformIndex < _JSONMaterial.Uniforms.length; UniformIndex++ )
	{
		var	JSONUniform = _JSONMaterial.Uniforms[UniformIndex];
		var	MatUniform = this.shader.uniforms[JSONUniform.Name];	// Retrieve the actual shader uniform
		if ( !MatUniform )
			continue;
//			throw "Shader \"" + this.shader.name + "\" does not have a uniform named \"" + JSONUniform.Name + "\" !";

		// Assignment object consists in a function and a value
		var	AssignmentObject =
		{
			func : MatUniform.Set,	// Store the assignment function
			value : null,
		};

		switch ( MatUniform.descriptor.type )
		{
		case gl.FLOAT:
		case gl.INT:
			AssignmentObject.value = JSONUniform.Value;
			break;
		case gl.FLOAT_VEC2:
			AssignmentObject.value = new vec2( JSONUniform.Value );
			break;
		case gl.FLOAT_VEC3:
			AssignmentObject.value = new vec3( JSONUniform.Value );
			break;
		case gl.FLOAT_VEC4:
			AssignmentObject.value = new vec4( JSONUniform.Value );
			break;
		case gl.SAMPLER_2D:
			if ( JSONUniform.Value < 0 || JSONUniform.Value >= _Scene.textures.length )
				throw "Texture index for uniform sampler \"" + JSONUniform.Name + "\" out of range !";
			AssignmentObject.value = _Scene.textures[JSONUniform.Value];
			AssignmentObject.actualSet = AssignmentObject.func;

			// Replace func() by our own that checks if the texture is loaded prior assigning it...
			AssignmentObject.func = function( value )
			{
				if ( value.isLoaded )
					this.actualSet( value );
				else if ( value.temp && value.temp.isLoaded )
					this.actualSet( value.temp );
			}
			break;

		default:
			throw "Unsupported uniform type !";
		}

		this.defaultUniformValues.push( AssignmentObject );
	}
}

patapi.SceneMaterial.prototype =
{
	currentMaterial : null,

	// Starts using the material by assigning its shader uniforms
	Use : function( _CallbackRender, opt_MaterialCallback )
	{
		var	that = this;
		this.shader.Use(
			// Setup material uniforms and render 
			function( _Shader )
			{
				if ( patapi.SceneMaterial.prototype.currentMaterial != that )
				{	// Assign global material uniforms
					for ( var UniformIndex=0; UniformIndex < that.defaultUniformValues.length; UniformIndex++ )
					{
						var Uniform = that.defaultUniformValues[UniformIndex];
						Uniform.func( Uniform.value );
					}

					patapi.SceneMaterial.prototype.currentMaterial = that;	// Make us the current material
				}

				// Invoke callback
				_CallbackRender( that );
			},

			// Forward shader callback in the guise of a material callback
			function( _Shader )
			{
				if ( opt_MaterialCallback )
					opt_MaterialCallback( that );
			} );
	}
}


//////////////////////////////////////////////////////////////////////////
// The ScenePrimitive object
patapi.ScenePrimitive = function( _Scene, _JSONPrimitive )
{
	this.owner = _Scene;
	this.ID = _JSONPrimitive.ID;
	this.name = _JSONPrimitive.Name;

	var	gl = _Scene.gl;

	// Decode topology
	var	Topology = gl.TRIANGLES;
	switch ( _JSONPrimitive.Topology )
	{
		case "TRIANGLES": Topology = gl.TRIANGLES; break;
		case "TRIANGLE_STRIPS": Topology = gl.TRIANGLE_STRIP; break;
		case "TRIANGLE_FANS": Topology = gl.TRIANGLE_FAN; break;
		default:
			throw "Unsupported primitive topology \"" + _JSONPrimitive.Topology + "\" !";
	}
	this.topology = Topology;

	// Retrieve material
	if ( typeof _JSONPrimitive.MatID === "undefined" )
		throw "Field \"MatID\" is undefined !";
	if ( _JSONPrimitive.MatID < 0 || _JSONPrimitive.MatID >= _Scene.materials.length )
		throw "Primitive material ID " + _JSONPrimitive.MatID + " is out of range ! Only " + _Scene.materials.length + " materials exist !";
	this.material = _Scene.materials[_JSONPrimitive.MatID];

	// Build Index & Vertex streams
	//
	// =====================================================================
	// All the primitive data are embedded in the file
	if ( _JSONPrimitive.IndexStream )
	{
		if ( !(_JSONPrimitive.IndexStream instanceof Array) )
			throw "IndexStream is not an array !";
		if ( !(_JSONPrimitive.VertexStreams instanceof Array) )
			throw "VertexStreams is not an array !";
						
		// Build the index stream
		var	IndexStream = null;
		if ( _JSONPrimitive.IndexStream.length < 65536 )
			IndexStream = new Uint16Array( _JSONPrimitive.IndexStream );
		else
			IndexStream = new UIntArray( _JSONPrimitive.IndexStream );

		// Rebuild the vertex streams table
		var	VertexStreams = {};
		for ( var VertexStreamIndex=0; VertexStreamIndex < _JSONPrimitive.VertexStreams.length; VertexStreamIndex++ )
		{
			var	VertexStream = _JSONPrimitive.VertexStreams[VertexStreamIndex];
			if ( !VertexStream.Type || !VertexStream.Value )
				throw "No \"Type\" or \"Value\" field on vertex stream \"" + VertexStream.Name + "\" : if index stream is embedded in the scene file, so must be the vertex streams !";

			var	StreamContent = null;
			switch ( VertexStream.Type )
			{
			case "Float32Array":
				StreamContent = new Float32Array( VertexStream.Value );
				break;
			default:
				throw "Unrecognized vertex stream type \"" + VertexStream.Type + "\" ! ";
			}
			VertexStreams[VertexStream.Name] = StreamContent;
		}

		this.primitive = patapi.webgl.CreatePrimitiveSynchronous( this.name, this.material.shader, VertexStreams, IndexStream, Topology );
	}
	// =====================================================================
	// All the primitive data reside in binary files that we load asynchronously
	else if ( _JSONPrimitive.IndexStreamFile )
	{
		if ( !(_JSONPrimitive.VertexStreams instanceof Array) )
			throw "VertexStreams is not an array !";

		var	that = this;
		this.primitive = patapi.webgl.CreatePrimitiveAsynchronous( this.name, this.material.shader, _JSONPrimitive.VertexStreams, _JSONPrimitive.IndexStreamFile, Topology,
		function( _Primitive, _BuffersCount, _BuffersLoaded, opt_Error )
		{	// Notify of primitive buffer loaded
			if ( opt_Error )
				that.owner.ERROR = (that.owner.ERROR || "") + "Error while loading primitive \"" + _Primitive.name + "\" : " + opt_Error + "\n";
			else
				that.owner.primitivesStillLoading -= 1.0 / _BuffersCount;	// Eat remaining count a little each time
			that.owner.NotifyProgress();
		} );
	}
	// =====================================================================
	// Asynchronously load from a binary blob file that contains all the buffers
	else if ( _JSONPrimitive.BlobFile )
	{
		var	that = this;
		this.primitive = patapi.webgl.CreatePrimitiveFromBlob( this.name, this.material.shader, _JSONPrimitive.BlobFile, Topology,
		function( _Primitive )
		{	// Notify of primitive buffer loaded
			that.owner.primitivesStillLoading--;
			that.owner.NotifyProgress();
		} );
	}
	else
		throw "Primitive does not have any of the necessary \"IndexStream\", \"IndexStreamFile\" or \"BlobFile\" fields !";


	// =====================================================================
	// Prepare uniform assignment objects for future primitive use
	this.defaultUniformValues = [];
	if ( !(_JSONPrimitive.Uniforms instanceof Array) || _JSONPrimitive.Uniforms.length == 0 )
		return;	// No default uniforms...

	for ( var UniformIndex=0; UniformIndex < _JSONPrimitive.Uniforms.length; UniformIndex++ )
	{
		var	JSONUniform = _JSONPrimitive.Uniforms[UniformIndex];
		var	MatUniform = this.material.shader.uniforms[JSONUniform.Name];	// Retrieve the actual shader uniform
		if ( !MatUniform )
			continue;
//			throw "Shader \"" + this.material.shader.name + "\" does not have a uniform named \"" + JSONUniform.Name + "\" !";

		// Assignment object consists in a function and a value
		var	AssignmentObject =
		{
			func : MatUniform.Set,	// Store the assignment function
			value : null,
		};

		switch ( MatUniform.descriptor.type )
		{
		case gl.FLOAT:
		case gl.INT:
			AssignmentObject.value = JSONUniform.Value;
			break;
		case gl.FLOAT_VEC2:
			AssignmentObject.value = new vec2( JSONUniform.Value );
			break;
		case gl.FLOAT_VEC3:
			AssignmentObject.value = new vec3( JSONUniform.Value );
			break;
		case gl.FLOAT_VEC4:
			AssignmentObject.value = new vec4( JSONUniform.Value );
			break;
		case gl.SAMPLER_2D:
			if ( JSONUniform.Value < 0 || JSONUniform.Value >= _Scene.textures.length )
				throw "Texture index for uniform sampler \"" + JSONUniform.Name + "\" out of range !";
			AssignmentObject.value = _Scene.textures[JSONUniform.Value];
			AssignmentObject.actualSet = AssignmentObject.func;

			// Replace func() by our own that checks if the texture is loaded prior assigning it...
			AssignmentObject.func = function( value )
			{
				if ( value.isLoaded )
					this.actualSet( value );
				else if ( value.temp && value.temp.isLoaded )
					this.actualSet( value.temp );
			}
			break;

		default:
			throw "Unsupported uniform type !";
		}

		this.defaultUniformValues.push( AssignmentObject );
	}
}

patapi.ScenePrimitive.prototype =
{
	Destroy : function()
	{
		if ( this.primitive )
			this.primitive.Destroy();
	},

	// Starts using the primitive by assigning its shader uniforms
	Use : function()
	{
		this.primitive.Use();

		// Upload the default uniforms for that primitive
		for ( var UniformIndex=0; UniformIndex < this.defaultUniformValues.length; UniformIndex++ )
		{
			var Uniform = this.defaultUniformValues[UniformIndex];
			Uniform.func( Uniform.value );
		}
	},

	Draw : function()
	{
		this.primitive.Draw();
	},
}

//////////////////////////////////////////////////////////////////////////
// The SceneObject object
patapi.SceneObject = function( _Scene, _JSONObject, opt_Parent )
{
	this.owner = _Scene;
	this.ID = _JSONObject.ID;
	this.name = _JSONObject.Name;
	this.parent = opt_Parent || null;
	this.local2parent = new mat4( _JSONObject.Transform );

	if ( _JSONObject.Position instanceof Array )
	{	// We were only provided a position
		switch ( _JSONObject.Position.length )
		{
		case 3:
			this.local2parent.r3 = new vec4( _JSONObject.Position[0], _JSONObject.Position[1], _JSONObject.Position[2], 1.0 );
			break;
		case 4:
			this.local2parent.r3 = new vec4( _JSONObject.Position );
			break;
		default:
			throw "Badly formatted position in object \"" + _JSONObject.Name + "\" !";
		}
	}

	this.local2world = new mat4( this.local2parent );
				
	// Retrieve references to the object's primitives
	this.primitives = [];
	for ( var PrimitiveIndex=0; PrimitiveIndex < _JSONObject.Primitives.length; PrimitiveIndex++ )
	{
		var	PrimitiveFetchIndex = _JSONObject.Primitives[PrimitiveIndex];
		if ( PrimitiveFetchIndex < 0 || PrimitiveFetchIndex >= _Scene.primitives.length )
			throw "Primitive index out of range in object \"" + _JSONObject.Name + "\" !";

		this.primitives[PrimitiveIndex] = _Scene.primitives[PrimitiveFetchIndex];
	}

	// Recursively parse children
	this.children = [];
	if ( _JSONObject.Children )
		for ( var ChildIndex=0; ChildIndex < _JSONObject.Children.length; ChildIndex++ )
		{
			var	ChildJSONObject = _JSONObject.Children[ChildIndex];
			var	ChildSceneObject = new patapi.SceneObject( _Scene, ChildJSONObject, this );
			this.children.push( ChildSceneObject );
		}
}

patapi.SceneObject.prototype =
{
	// Update current hierarchy
	// Expects an optional callback of the form function( _Primitive, _Time, _DeltaTime )
	Update : function( _Time, _DeltaTime, opt_Callback )
	{
		// Execute callback that will update our local transform
		if ( opt_Callback )
			opt_Callback( this, _Time, _DeltaTime );

		// Now compose transform with parent to get our local2world
		if ( this.parent )
			this.local2world = this.local2parent.mul_( this.parent.local2world );
	},

	// Render the object
	//	_RenderCallback, a callback of the form function( _Primitive, _Material, _Local2World )
	//	opt_MaterialCallback, an optional callback that will be called whenever a material gets active
	//
	Render : function( _RenderCallback, opt_MaterialCallback )
	{
		// Render this object's primitives
		var	that = this;
		for ( var PrimitiveIndex=0; PrimitiveIndex < this.primitives.length; PrimitiveIndex++ )
		{
			var	Primitive = this.primitives[PrimitiveIndex];
			Primitive.material.Use(
				function( _Material )
				{
					_RenderCallback( Primitive, _Material, that.local2world );
				},
				opt_MaterialCallback );
		}

		// Recurse through children
		for ( var ChildIndex=0; ChildIndex < this.children.length; ChildIndex++ )
			this.children[ChildIndex].Render( _RenderCallback, opt_MaterialCallback );
	},

	// Render the object and override the material (i.e. only suggest primitive, don't force primitive material)
	//	_RenderCallback, a callback of the form function( _Primitive )
	RenderOverride : function( _RenderCallback )
	{
		var	that = this;
		for ( var PrimitiveIndex=0; PrimitiveIndex < this.primitives.length; PrimitiveIndex++ )
		{
			var	Primitive = this.primitives[PrimitiveIndex];
			_RenderCallback( Primitive );
		}
	},
}

// HARDCODED JSON CONTAINING THE ERROR SCENE : A red unit cube !
patapi.Scene.prototype.__ErrorSceneJSON =
{
	Version : 1,

	// List of shaders
	Shaders :
	[
		{	ID : 0,
			Name : "SimpleShader",
			VS : "attribute vec3 _vPosition;" +
				"attribute vec2 _vUV;" +
				"uniform mat4 _World2Proj;" +
				"varying vec2	_UV;" +
				"void	main()" +
				"{" +
				"	_UV = _vUV;" +
				"	gl_Position = _World2Proj * vec4( _vPosition, 1 );" +
				"}",
			PS : "precision highp float;"+
				"varying vec2	_UV;"+
				"uniform vec4	_Color;"+
				"void	main()"+
				"{"+
				"	gl_FragColor = _Color;"+
				"}",
		}
	],

	// List of materials
	Materials :
	[
		{	ID : 0,
			Name : "SimpleMat",
			ShaderID : 0,
			Uniforms :
			[
				{ Name : "_Color", Value : [1.0, 0, 0.25, 1] },	// Defines a vec4
			]
		}
	],

	// List of primitives (a bunch of triangles rendered with materials)
	Primitives :
	[
		{	ID : 0,
			Name : "CubePrim",
			MatID : 0,
			Topology : "TRIANGLES",
			IndexStream : [
				// Front
				0, 1, 2, 2, 1, 3,
				// Front
				4, 5, 6, 6, 5, 7,
				// Left
				8, 9, 10, 10, 9, 11,
				// Right
				12, 13, 14, 14, 13, 15,
				// Top
				16, 17, 18, 18, 17, 19,
				// Bottom
				20, 21, 22, 22, 21, 23
			],
			VertexStreams : 
			[
				{ Name : "_vPosition",
				  Type : "Float32Array",
				  Value : [
					// Front
					-1.0, +1.0, +1.0,
					-1.0, -1.0, +1.0,
					+1.0, +1.0, +1.0,
					+1.0, -1.0, +1.0,
					// Back
					+1.0, +1.0, -1.0,
					+1.0, -1.0, -1.0,
					-1.0, +1.0, -1.0,
					-1.0, -1.0, -1.0,
					// Left
					-1.0, +1.0, -1.0,
					-1.0, -1.0, -1.0,
					-1.0, +1.0, +1.0,
					-1.0, -1.0, +1.0,
					// Right
					+1.0, +1.0, +1.0,
					+1.0, -1.0, +1.0,
					+1.0, +1.0, -1.0,
					+1.0, -1.0, -1.0,
					// Top
					-1.0, +1.0, -1.0,
					-1.0, +1.0, +1.0,
					+1.0, +1.0, -1.0,
					+1.0, +1.0, +1.0,
					// Bottom
					-1.0, -1.0, +1.0,
					-1.0, -1.0, -1.0,
					+1.0, -1.0, +1.0,
					+1.0, -1.0, -1.0,
				 ] },
				{ Name : "_vUV",
				  Type : "Float32Array",
				  Value : [
					// Front
					0.0, 0.0,
					0.0, 1.0,
					1.0, 0.0,
					1.0, 1.0,
					// Back
					0.0, 0.0,
					0.0, 1.0,
					1.0, 0.0,
					1.0, 1.0,
					// Left
					0.0, 0.0,
					0.0, 1.0,
					1.0, 0.0,
					1.0, 1.0,
					// Right
					0.0, 0.0,
					0.0, 1.0,
					1.0, 0.0,
					1.0, 1.0,
					// Top
					0.0, 0.0,
					0.0, 1.0,
					1.0, 0.0,
					1.0, 1.0,
					// Bottom
					0.0, 0.0,
					0.0, 1.0,
					1.0, 0.0,
					1.0, 1.0,
				] },
			],
		},
	],

	// Hierarchical tree of objects
	Objects :
	[
		{	Name : "Cube",
			Primitives : [ 0 ],
			Transform : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
			Children : [],
		}
	],

	// Some textures
	Textures : []
}