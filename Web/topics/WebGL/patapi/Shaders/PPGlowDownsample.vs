////////////////////////////////////////////////////////////////
//
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

precision highp float;

////////////////////////////////////////////////////////////////
attribute vec4	_vPosition;

varying vec3	_Position;
varying vec2	_UV;

void	main()
{
	gl_Position = _vPosition;
	_UV = 0.5 * (1.0 + _vPosition.xy);
}
