////////////////////////////////////////////////////////////////
// Clears the BRDF renderer with a nice background
#include "./Includes/Global.shader"


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

uniform sampler2D	_TexImageHDR;
uniform bool		_Enabled;
uniform float		_Overbright;
uniform float		_Range;
uniform float		_Gamma;

uniform bool		_ShowEnvMap;
uniform mat4		_Camera2World;
uniform vec3		_RayBasis;

uniform bool		_PatchLog10;

vec3	ToneMap( vec3 _HDR )
{
	return vec3( _Overbright ) - _Overbright * exp( -_Range * _HDR );
}

vec3	ExpLuma( vec3 _RGB )
{
	float	Luma = _RGB.x * 0.2126 + _RGB.y * 0.7152 + _RGB.z * 0.0722;
	float	ExpLuma = exp( Luma * 2.3025850929940456840179914546844 ) - 1.0;
	return _RGB * ExpLuma / Luma;
}

void	main()
{
	// Devise a simple background color
	vec3	View = normalize( vec3( (2.0 * _UV - 1.0) * _RayBasis.xy, 1.0 ) );
	vec3	DummyLight = normalize( vec3( 1, 2, -0.1 ) );	// From behind
	float	Dot = dot( View, DummyLight );
			Dot = 0.25 + 0.8 * smoothstep( -0.9, 2.0, Dot );
	vec3	BackgroundColor = vec3( Dot );
	if ( _ShowEnvMap )
	{	// Compute actual view vector and sample environment
		View = (_Camera2World * vec4( View, 0.0 )).xyz;
		BackgroundColor = SampleEnvMap( View );
	}

	// Blend with opaque objects
	vec4	ImageColor = texture2D( _TexImageHDR, _UV );
	vec3	ColorHDR = max( vec3( 0.0 ), ImageColor.xyz );

	ColorHDR = lerp( BackgroundColor, ColorHDR, ImageColor.w );

// This works quite okay and reduces variance!
// I guess it's something worth digging...
if ( _PatchLog10 )
	ColorHDR = ExpLuma( ColorHDR );

	// Apply tone mapping
	vec3	ColorLDR = _Enabled ? ToneMap( ColorHDR ) : ColorHDR;

			ColorLDR = pow( ColorLDR, vec3( 1.0 / _Gamma ) );

	gl_FragColor = vec4( ColorLDR, 1 );
}

#endif
