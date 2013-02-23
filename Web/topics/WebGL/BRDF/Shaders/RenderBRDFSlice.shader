////////////////////////////////////////////////////////////////
// Renders a BRDF slice in the property viewer
#include "./Includes/Global.shader"


////////////////////////////////////////////////////////////////
// CONSTANTS
//

////////////////////////////////////////////////////////////////
// Varying values
varying vec2	_UV;


////////////////////////////////////////////////////////////////
// Vertex Shader
#ifdef VS

attribute vec4	_vPosition;

void	main()
{
	gl_Position = _vPosition;
	_UV = 0.5 * (1.0 + _vPosition.xy);
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

uniform int			_DisplayTypeThetaH;
uniform float		_Gamma;

void	main()
{
	if ( !_BRDFValid )
	{
		gl_FragColor = vec4( vec3( 0.2 ) + 0.5 * vec3( length( _UV ) ), 1.0 );
		return;
	}

	vec2	UV = _UV;
	UV.y = 1.0 - UV.y;
	if ( _DisplayTypeThetaH == 0 )
		UV.x = sqrt( UV.x );
	else if ( _DisplayTypeThetaH == 2 )
		UV = 1.0 - INV_HALFPI * acos( UV );

	vec4	TexColor = texture2D( _TexBRDF, UV );
	vec3	Reflectance = TexColor.xyz;

	if ( _ShowIsolines )
	{
		float	bIsoline = IsIsoline( UV, Reflectance );
//		float	IsolineColor = dot( Reflectance, LUMINANCE ) < 0.5 ? 1.0 : 0.0;
//		Reflectance = lerp( Reflectance, vec3( IsolineColor ), saturate( bIsoline ) );
		Reflectance = lerp( Reflectance, vec3( _ShowLogLuma ? 10.0 : (_ShowNormalized ? _MaxReflectance.x : 1.0), 0, 0 ), bIsoline );
	}

	if ( _ShowNormalized )
		Reflectance /= _MaxReflectance;

	if ( _ShowLogLuma )
	{
		Reflectance = LogLuma( Reflectance );
		Reflectance *= exp2( _Exposure );	// Also use exposure
	}
	else if ( _ShowChroma )
	{
		Reflectance = Chroma( Reflectance );
	}
	else if ( _ShowDeChromatized )
	{
		vec3	Chr = Chroma( Reflectance );
		Reflectance /= Chr;
	}
	else
	{
		Reflectance *= exp2( _Exposure );	// Use exposure
	}

	if ( Reflectance.x < 0.0 || Reflectance.y < 0.0 || Reflectance.z < 0.0 )
		Reflectance = vec3( 1, 0, 1 );

 	Reflectance = pow( Reflectance, vec3( 1.0 / _Gamma ) );

	gl_FragColor = lerp( vec4( Reflectance, 1.0 ), vec4( 0, 1, 0, 1 ), TexColor.w );	// We use alpha to display special events!
}

#endif
