////////////////////////////////////////////////////////////////
// Renders a 3D graph of the BRDF
#include "Includes/Global.shader"
#include "Includes/3D.shader"


////////////////////////////////////////////////////////////////
// CONSTANTS
//


////////////////////////////////////////////////////////////////
// Varying values
varying vec3	_Direction;
varying vec2	_UV;
varying vec2	_DiffuseSpecular;


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


	_Direction = _vPosition;
	_UV = _vUV;

	// Compute fake diffuse + specular
	vec3	FakeLightDirection = normalize( 1.0 * _Camera2World[0].xyz - _Camera2World[2].xyz );	// Somewhere on the right of the camera
	vec3	View = normalize( _Camera2World[3].xyz - Displacement );
	vec3	H = normalize( FakeLightDirection + View );

//	vec3	FresnelView = View;
	vec3	FresnelView = -_Camera2World[2].xyz;
	vec3	H2 = normalize( reflect( FresnelView, _vPosition ) + FresnelView );

	_DiffuseSpecular = vec2(
			0.5 * saturate( 0.5 + 0.5 * dot( FakeLightDirection, _vPosition ) ) +		// Wrap around Lambert

			0.5 * pow( saturate( (dot( FresnelView, H2 ) - 0.8) / 0.2 ), 4.0 ),			// "Fresnel-like"

			1.0 * pow( saturate( dot( H, _vPosition ) ), 20.0 )
		);

// Fake electronic microscope effect
vec2	CameraNormal = vec2( dot( _vPosition, _Camera2World[0].xyz ), dot( _vPosition, _Camera2World[1].xyz ) );
_DiffuseSpecular.x = length( CameraNormal );
_DiffuseSpecular.x *= _DiffuseSpecular.x;
_DiffuseSpecular.x *= _DiffuseSpecular.x;
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

void	main()
{
	gl_FragColor = ComputeBRDFColor( _Direction, _UV, _DiffuseSpecular, false );
}

#endif
