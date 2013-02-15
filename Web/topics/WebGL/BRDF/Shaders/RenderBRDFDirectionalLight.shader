////////////////////////////////////////////////////////////////
// Renders an object with a specific BRDF
#include "./Includes/Global.shader"


////////////////////////////////////////////////////////////////
// CONSTANTS
//


////////////////////////////////////////////////////////////////
// Varying values
varying vec3	_WorldPosition;
varying vec2	_UV;
varying vec3	_ViewTS;
varying vec3	_LightTS;

uniform vec3	_LightDirection;


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
	_ViewTS = vec3( dot( WorldView, WorldTangent ), dot( WorldView, WorldBiTangent ), dot( WorldView, WorldNormal ) );
	_LightTS = vec3( dot( _LightDirection, WorldTangent ), dot( _LightDirection, WorldBiTangent ), dot( _LightDirection, WorldNormal ) );
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

void	main()
{
	vec3	View = normalize( _ViewTS );
	vec3	Light = normalize( _LightTS );
	vec3	Reflectance = BRDF( View, Light, _ShowLogLuma );

	vec3	Radiance = PI * Reflectance * vec3( _LightIntensity ) * saturate( Light.z );	// BRDF * Li * (N.L)

	gl_FragColor = vec4( _BRDFValid ? Radiance : Light.zzz, 1 );
}

#endif
