////////////////////////////////////////////////////////////////
//
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

////////////////////////////////////////////////////////////////
attribute vec3	_P;
attribute vec3	_N;

uniform mat4	_Local2World;
uniform mat4	_World2Proj;
uniform vec3	_SunDirection;

varying float	_Phase;

void	main()
{
	vec4	WorldPosition = _Local2World * vec4( _P, 1.0 );

	gl_Position = _World2Proj * WorldPosition;
	gl_Position.z -= 0.1;	// Small bias so it passes ZTest

	// Compute phase with light to avoid rendering shafts on back-facing windows
	vec3	WorldNormal = (_Local2World * vec4( _N, 0.0 )).xyz;
//	_Phase = saturate( -1000.0 * dot( WorldNormal, _SunDirection ) );
	_Phase = saturate( -dot( WorldNormal, _SunDirection ) );
}
