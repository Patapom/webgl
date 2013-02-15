////////////////////////////////////////////////////////////////
// Renders a 3D graph of the BRDF (wireframe version)
#include "Includes/Global.shader"
#include "Includes/3D.shader"


////////////////////////////////////////////////////////////////
// CONSTANTS
//


////////////////////////////////////////////////////////////////
// Varying values
varying vec3	_Direction;
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
	vec3	Displacement = ComputeWorldDisplacement( _vPosition, _vUV );
//	gl_Position = _World2Proj * vec4( _vPosition + Displacement, 1 );
	gl_Position = _World2Proj * vec4( Displacement, 1 );
	gl_Position.z -= 0.001 * gl_Position.w;	// Bias...

	_Direction = _vPosition;
	_UV = _vUV;
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

void	main()
{
	gl_FragColor = ComputeBRDFColor( _Direction, _UV, vec2( 0.0 ), true );
}

#endif
