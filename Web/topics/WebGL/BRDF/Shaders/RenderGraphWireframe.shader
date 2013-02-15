////////////////////////////////////////////////////////////////
// Renders an object with a specific BRDF
#include "Includes/Global.shader"
#include "Includes/Graph.shader"


////////////////////////////////////////////////////////////////
// CONSTANTS
//


////////////////////////////////////////////////////////////////
// Varying values
varying vec3	_WorldPosition;
varying vec2	_UV;


////////////////////////////////////////////////////////////////
// Common uniforms


////////////////////////////////////////////////////////////////
// Vertex Shader
#ifdef VS

attribute vec3	_vPosition;
attribute vec2	_vUV;

uniform mat4	_Camera2World;
uniform mat4	_World2Proj;

void	main()
{
	float	Height = ComputeWorldHeight( _vUV );
	gl_Position = _World2Proj * vec4( _vPosition + vec3( 0, Height, 0 ), 1 );
	gl_Position.z -= 0.001 * gl_Position.w;	// Bias...

	_WorldPosition = _vPosition;
	_UV = _vUV;
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

void	main()
{
	gl_FragColor = ComputeGraphColor( _UV, true );
}

#endif
