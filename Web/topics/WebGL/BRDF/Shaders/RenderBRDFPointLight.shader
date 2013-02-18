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
varying vec3	_View;
varying vec3	_Tangent;
varying vec3	_BiTangent;
varying vec3	_Normal;

uniform vec3	_LightPosition;


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

uniform float		_NormalStrength;
uniform sampler2D	_TexNormalMap;			// Optional normal map

void	main()
{
	vec3	View = normalize( _View );
	vec3	Tangent = normalize( _Tangent );
	vec3	BiTangent = normalize( _BiTangent );
	vec3	Normal = normalize( _Normal );

	// Rotate tangent space with new normal
	{

// Remap planar into pipo spherical
vec3	Pipo = normalize( _WorldPosition );
vec2	UV = vec2( 1.0 + atan( Pipo.x, Pipo.z ) * INV_PI, acos( Pipo.y ) * INV_PI );

		vec3	NormalTS = SampleNormalMap( _TexNormalMap, _UV, _NormalStrength );
		RotateTangentSpace( Tangent, BiTangent, Normal, NormalTS );
	}

	vec3	LightDirection = _LightPosition - _WorldPosition;
	float	LightDistance = length( LightDirection );
	LightDirection /= LightDistance;

	vec3	ViewTS = vec3( dot( View, Tangent ), dot( View, BiTangent ), dot( View, Normal ) );
	vec3	LightTS = vec3( dot( LightDirection, Tangent ), dot( LightDirection, BiTangent ), dot( LightDirection, Normal ) );

	vec3	Reflectance = BRDF( ViewTS, LightTS, _ShowLogLuma );

	vec3	Radiance = PI * Reflectance * vec3(_LightIntensity) * saturate( LightTS.z ) / (LightDistance*LightDistance);	// PI * BRDF * Li * (N.L) / r²

	gl_FragColor = vec4( _BRDFValid ? Radiance : LightTS.zzz, 1 );
}

#endif
