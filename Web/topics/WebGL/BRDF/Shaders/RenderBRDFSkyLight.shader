////////////////////////////////////////////////////////////////
// Renders an object with a specific BRDF lit by a sky light
//
#define LIGHT_TYPE	1


////////////////////////////////////////////////////////////////
// CONSTANTS
//
const int	MC_SAMPLES_COUNT = 32;	// Amount of samples per pass for monte carlo integration

#include "./Includes/Global.shader"


////////////////////////////////////////////////////////////////
// Varying values
varying vec3	_WorldPosition;
varying vec2	_UV;
varying vec3	_ViewTS;
varying vec3	_Tangent;
varying vec3	_BiTangent;
varying vec3	_Normal;


////////////////////////////////////////////////////////////////
// Vertex Shader
#ifdef VS

attribute vec3	_vPosition;
//attribute vec3	_vNormal;
attribute vec3	_vTangent;
attribute vec2	_vUV;

uniform mat4	_Camera2World;
uniform mat4	_World2Proj;

void	main()
{
	vec3	WorldNormal = _vPosition;
	vec3	WorldTangent = _vTangent;
	vec3	WorldBiTangent = cross( WorldNormal, WorldTangent );

	vec3	WorldView = _vPosition - _Camera2World[2].xyz;

	gl_Position = _World2Proj * vec4( _vPosition + vec3( 0, 0, 0 ), 1 );
	_WorldPosition = _vPosition;
	_UV = _vUV;
	_ViewTS = vec3( dot( WorldView, WorldTangent ), dot( WorldView, WorldBiTangent ), dot( WorldView, WorldNormal ) );
	_Tangent = WorldTangent;
	_BiTangent = WorldBiTangent;
	_Normal = WorldNormal;
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

void	main()
{
	gl_FragColor = vec4( IntegrateBRDF( normalize( _ViewTS ), _WorldPosition, _Tangent, _BiTangent, _Normal ), 1 );
}

#endif
