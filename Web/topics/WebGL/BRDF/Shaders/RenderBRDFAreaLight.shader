////////////////////////////////////////////////////////////////
// Renders an object with a specific BRDF lit by an area light
// Area light type is setup by a #define LIGHT_TYPE X where X can be:
//	0 for a rectangular area light sitting atop the object
//	1 for a CIE sky light model
//	2 for IBL by an importance-sampled HDR envmap
//
#include "./Includes/Global.shader"


////////////////////////////////////////////////////////////////
// CONSTANTS
//


////////////////////////////////////////////////////////////////
// Varying values
varying vec3	_WorldPosition;
varying vec2	_UV;
varying vec3	_View;
varying vec3	_Tangent;
varying vec3	_BiTangent;
varying vec3	_Normal;


////////////////////////////////////////////////////////////////
// Vertex Shader
#ifdef VS

attribute vec3	_vPosition;
attribute vec3	_vNormal;
attribute vec3	_vTangent;
attribute vec2	_vUV;

uniform mat4	_Camera2World;
uniform mat4	_World2Proj;

void	main()
{
	vec3	WorldNormal = _vNormal;
	vec3	WorldTangent = _vTangent;
	vec3	WorldBiTangent = cross( WorldNormal, WorldTangent );

	vec3	WorldView = _vPosition - _Camera2World[2].xyz;

	gl_Position = _World2Proj * vec4( _vPosition + vec3( 0, 0, 0 ), 1 );
	_WorldPosition = _vPosition;
	_UV = _vUV;
	_View = WorldView;
	_Tangent = WorldTangent;
	_BiTangent = WorldBiTangent;
	_Normal = WorldNormal;
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

#include "./Includes/Integration.shader"

void	main()
{
	gl_FragColor = vec4( IntegrateBRDF( _UV, normalize( _View ), _WorldPosition, normalize( _Tangent ), normalize( _BiTangent ), normalize( _Normal ) ), 1 );
}

#endif
