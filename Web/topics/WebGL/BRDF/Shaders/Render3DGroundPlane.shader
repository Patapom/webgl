////////////////////////////////////////////////////////////////
// Draws the ground plane
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

precision highp float;


////////////////////////////////////////////////////////////////
// Varying values
varying vec2	_UV;

////////////////////////////////////////////////////////////////
// Vertex Shader
#ifdef VS

attribute vec4	_vPosition;

uniform mat4	_World2Proj;

void	main()
{
	vec3	Position = vec3( 2.0 * _vPosition.x, 0.0, 2.0 * _vPosition.y );
	gl_Position = _World2Proj * vec4( Position, 1 );
	_UV = 0.5 * (1.0 + _vPosition.xy);
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

void	main()
{
	gl_FragColor = vec4( 0.5, 0.5, 0.5, 1 );
}

#endif
