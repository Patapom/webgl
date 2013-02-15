/*
 Defines the GLViewport class
 This helper class allows us to manage several canvas elements
 */
o3djs.provide( 'BRDF.GLViewport' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );

GLViewport = function( _Name, _canvas )
{
	this.name = _Name;
	this.errorState = true;

	if ( _canvas[0] )
		_canvas = _canvas[0];	// If it's a jQuery wrapper then extract the actual canvas...
	this.canvas = _canvas;
	if ( this.canvas === undefined )
	{
		this.error = "Canvas element not found!";
		throw this.error;
	}

	// Retrieve the GL context
	this.gl = patapi.webgl.GetContext( this.canvas );
	if ( this.gl == null )
	{
		this.error = "Your web-browser does not support webgl!";
		throw this.error;
	}

	// Save the render context
	this.gl.renderContext = patapi.webgl.BackupRenderingContext();

	// Initialize our variables
	this.time = 0;
	this.errorState = false;
	this.error = "";
	this.reThrowException = true;

	// Resize...
	this.CheckResize();
}

GLViewport.prototype =
{
	Dispose : function()
	{
		var	gl = this.setupGL__();

		// TODO...
	}

	, GetGL : function()
	{
		return this.setupGL__();
	}

	// Checks if the canvas was resized then resizes the GL viewport as well and calls the optional callback with the new size
	// 
	, CheckResize : function( opt_Callback )
	{
		if ( this.errorState )
			return;

		var	gl = this.setupGL__();

		// Check if it was resized
		if ( this.canvas.width == this.canvas.clientWidth && this.canvas.height == this.canvas.clientHeight )
			return;

		patapi.webgl.Resize( this.canvas.clientWidth, this.canvas.clientHeight );
		if ( opt_Callback )
			opt_Callback( patapi.webgl.width, patapi.webgl.height );
	}

	// Prepares the viewport for rendering then calls _RenderCallback( gl, time, deltaTime ) passing the gl context
	, Render : function( _DeltaTime, _RenderCallback, opt_ResizeCallback )
	{
		if ( this.errorState )
			return;	// Can't render anymore...

		var	gl = this.setupGL__();

		// Check if it was resized
		this.CheckResize( opt_ResizeCallback );

		// Accumulate our own time
		patapi.webgl.FrameUpdate();
		this.time += _DeltaTime;

		// Actual rendering
		try
		{
			_RenderCallback( gl, this.time, _DeltaTime );
		}
		catch ( _e )
		{
			this.errorState = true;
			this.error = "An error occurred while rendering: " + _e;
			if ( this.reThrowException )
				throw this.error;
		}

		// Save the rendering context
		this.gl.renderContext = patapi.webgl.BackupRenderingContext();
	}

	, setupGL__ : function()
	{
		patapi.webgl.RestoreRenderingContext( this.gl.renderContext );
		return this.gl;
	}
};
