////////////////////////////////////////////////////////////////
// Renders helper widgets to properly visualize camera and light orientations
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

precision highp float;


////////////////////////////////////////////////////////////////
// CONSTANTS
//


////////////////////////////////////////////////////////////////
// Varying values
varying vec3	_Color;


////////////////////////////////////////////////////////////////
// Common uniforms
uniform bool	_DrawLight;
uniform vec3	_LightDirection;

////////////////////////////////////////////////////////////////
// Vertex Shader
#ifdef VS

attribute vec3	_vPosition;
attribute vec3	_vColor;

uniform mat4	_World2Camera;
uniform mat4	_World2Proj;
uniform float	_AspectRatio;

void	main()
{
//	gl_Position = _World2Proj * vec4( _vPosition, 1 );

	if ( _DrawLight )
	{
		gl_Position = _World2Proj * vec4( 2.0 * _LightDirection * _vPosition, 1 );
	}
	else
	{
		vec4	CamPosition = _World2Camera * vec4( _vPosition, 0 );
//		vec4	CamPosition = vec4( _vPosition, 0 );

		// Scale and offset
		vec3	ClipPosition = vec3( -0.9, -0.9, 0.0 ) + 0.09 * vec3( CamPosition.x, _AspectRatio * CamPosition.y, CamPosition.z );
		gl_Position = vec4( ClipPosition, 1 );
	}

	_Color = _vColor;
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

void	main()
{
	gl_FragColor = vec4( _Color, 1 );
//	gl_FragColor = vec4( 1, 0, 0, 1 );
}

#endif
