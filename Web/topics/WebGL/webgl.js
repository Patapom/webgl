// Displays a funky spinning cube
//
o3djs.require( 'patapi' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );

var	g_Canvas;
var	gl;
var	g_Shader;
var g_Primitive;
var	g_StartTime, g_Time = 0.0;

// From http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame		|| 
		window.webkitRequestAnimationFrame	|| 
		window.mozRequestAnimationFrame		|| 
		window.oRequestAnimationFrame		|| 
		window.msRequestAnimationFrame		||
		function( callback ) { window.setTimeout( callback, 10 ); };
    })();



function Init()
{
    try
	{
		g_Canvas = document.getElementById( "viewgl" );
		gl = patapi.webgl.GetContext( g_Canvas );
		if ( !gl ) throw "Failed to retrieve WebGL context !";

		g_Shader = patapi.webgl.LoadShader( "CubeShader", "pipo_vs", "pipo_ps" );

		// Create a nice cube
		var	Vertices = 
		{
			_vPosition : new Float32Array( [
				-1.0, +1.0, +1.0,  -1.0, -1.0, +1.0,  +1.0, +1.0, +1.0,  +1.0, -1.0, +1.0,	// Front
				+1.0, +1.0, -1.0,  +1.0, -1.0, -1.0,  -1.0, +1.0, -1.0,  -1.0, -1.0, -1.0,	// Back
				-1.0, +1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, +1.0, +1.0,  -1.0, -1.0, +1.0,	// Left
				+1.0, +1.0, +1.0,  +1.0, -1.0, +1.0,  +1.0, +1.0, -1.0,  +1.0, -1.0, -1.0,	// Right
				-1.0, +1.0, -1.0,  -1.0, +1.0, +1.0,  +1.0, +1.0, -1.0,  +1.0, +1.0, +1.0,	// Top
				-1.0, -1.0, +1.0,  -1.0, -1.0, -1.0,  +1.0, -1.0, +1.0,  +1.0, -1.0, -1.0,	// Bottom
				] ),

			_vColor : new Float32Array( [
				1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,	// Front
				0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,	// Back
				0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,	// Left
				1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,	// Right
				0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,	// Top
				1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,	// Bottom
			] )
		};
		var	Indices = new Uint16Array( [
		0, 1, 2, 2, 1, 3,			// Front
		4, 5, 6, 6, 5, 7,			// Back
		8, 9, 10, 10, 9, 11,		// Left
		12, 13, 14, 14, 13, 15,		// Right
		16, 17, 18, 18, 17, 19,		// Top
		20, 21, 22, 22, 21, 23		// Bottom
		] );

		g_Primitive = patapi.webgl.CreatePrimitiveSynchronous( "CubePrimitive", g_Shader, Vertices, Indices, gl.TRIANGLES );

		// Setup default states
		gl.enable( gl.DEPTH_TEST );
		gl.enable( gl.CULL_FACE );
		gl.cullFace( gl.BACK );

		// Start render loop
		g_StartTime = 0.001 * (new Date()).getTime();
		(function()
		{
			requestAnimFrame( arguments.callee );

			var	Time = 0.001 * (new Date()).getTime() - g_StartTime;
			var	DeltaTime = Time - g_Time;
			g_Time = Time;

			// Build the 3D transform
			var	Rot = mat4.rotationZYX( 0.25 * Math.PI, g_Time, 0.25 * Math.PI );

			// Clear screen & render
			patapi.webgl.Clear( 0, 0, 0, 0, 1.0 );
			g_Shader.Use(
				function( _Shader )
				{
					_Shader.uniforms._Local2World.Set( Rot );
					g_Primitive.Use();
					g_Primitive.Draw();
				} )

		})();
	}
	catch ( _e )
	{
		LogError( "An error occurred while initializing the WebGL context:<br/>" + _e );
	}
}

function Exit()
{
    if ( !gl )
		return;
}

function LogError( _Error )
{
	while ( _Error.indexOf( '\n' )!= -1 )
		_Error = _Error.replace( '\n', '<br/>' );

	document.getElementById( "canvascontainer" ).innerHTML = "<font color=\"#FF5040\">" + _Error + "</font>";
}
