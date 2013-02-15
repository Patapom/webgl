////////////////////////////////////////////////////////////////
//
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

precision highp float;

////////////////////////////////////////////////////////////////
attribute vec3	_P;
attribute vec3	_N;
attribute vec3	_T;
attribute vec2	_UV;

varying vec3	_pP;
varying vec3	_pN;
varying vec2	_pUV;

uniform mat4	_Local2World;
uniform mat4	_World2Proj;

void	main()
{
	_pUV = _UV;

	vec4	WorldPosition = _Local2World * vec4( _P, 1.0 );
	gl_Position = _World2Proj * WorldPosition;

	_pP = WorldPosition.xyz;
	_pN = (_Local2World * vec4( _N, 0.0 )).xyz;
}
