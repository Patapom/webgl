////////////////////////////////////////////////////////////////
//
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

precision highp float;

////////////////////////////////////////////////////////////////
// CONSTANTS
//
const float	PI = 3.1415926535897932384626433832795;

	// SH Luminance variation based on phase with light
const float	SH_LUMINANCE_FACING_LIGHT	= 0.5;			// [0,1.0] The factor to apply to SH when looking toward the light
const float	SH_LUMINANCE_POWER			= 2.5;			// [0,+oo[ The power to raise the luminance to

	// In-Scattering
// const float	SCATTERING_ALBEDO		= 0.25;				// [0,+oo[ The scattering albedo (scattering / extinction)
// const float	EXTINCTION_COEFFICIENT	= 0.002;			// [0,+oo[ The extinction coefficient (i.e. "amount of extinction" per unit length)
const float	SCATTERING_ANISOTROPY	= 0.5;				// ]-1.0,+1.0[ The prefered direction of scattering (e.g. -1.0 is backward, 0 is isotropic and +1.0 is forward)


////////////////////////////////////////////////////////////////
attribute vec3	_P;
attribute vec3	_N;
attribute vec3	_T;
attribute vec2	_UV;
attribute vec4	_SH0;
attribute vec4	_SH1;
attribute vec4	_SH2;

// varying vec3	_pPosition;
varying vec3	_pNormal;
varying vec3	_pTangent;
varying vec4	_pView;
varying vec2	_pUV;
varying vec4	_pInScattering;
varying vec4	_pSH0;
varying vec4	_pSH1;
varying vec4	_pSH2;

uniform vec3	_SunDirection;
uniform vec3	_SunColor;
uniform mat4	_Camera2World;
uniform mat4	_World2Proj;

uniform mat4	_Local2World;


// ### DEBUG Parameters
uniform float	_DEBUGScatteringStrength;
uniform float	_DEBUGScatteringAlbedo;
// ### DEBUG Parameters


void	main()
{
	// Calculate surface position in world space. Used for lighting.
	vec4	WorldPosition = _Local2World * vec4( _P, 1.0 );
	gl_Position = _World2Proj * WorldPosition;

	// Simply copy UVs
	_pUV = _UV;

	// Transform the Tangent frame into world space.
	_pNormal.xyz = (_Local2World * vec4( _N, 0.0 )).xyz;
	_pTangent.xyz = (_Local2World * vec4( _T, 0.0 )).xyz;

	// Simply copy SH coefficients
	_pSH0 = _SH0;
	_pSH1 = _SH1;
	_pSH2 = _SH2;


// Try and clamp these values
// vec4	TempSH0 = abs( _SH0 );
// vec4	TempSH1 = abs( _SH1 );
// vec4	TempSH2 = abs( _SH2 );
// float	MaxValue = max( max( max( TempSH0.x, TempSH0.y ), TempSH0.z ), TempSH0.w );
// 		MaxValue = max( MaxValue, max( max( max( TempSH1.x, TempSH1.y ), TempSH1.z ), TempSH1.w ) );
// 		MaxValue = max( MaxValue, max( max( max( TempSH2.x, TempSH2.y ), TempSH2.z ), TempSH2.w ) );
// 
// float	Scale = min( 1.0, MaxValue ) / MaxValue;
// _pSH0 *= Scale;
// _pSH1 *= Scale;
// _pSH2 *= Scale;


	// Compute a little in-scattering
	_pView.xyz = WorldPosition.xyz - _Camera2World[3].xyz;
	_pView.w = length( _pView.xyz );
	_pView.xyz /= _pView.w;

	float	LightPhase = dot( _pView.xyz, _SunDirection );

	float	g = SCATTERING_ANISOTROPY;
//	float	PhaseFunction = (1.0 + LightPhase*LightPhase);										// Rayleigh = 1.0+cos²(theta)
//	float	PhaseFunction = (1.0 - g * g) / (4.0*PI * (1.0+g*LightPhase) * (1.0+g*LightPhase));	// Schlick
	float	PhaseFunction = (1.0 - g * g) / (4.0*PI * pow( 1.0+g*g-2.0*g*LightPhase, 1.5 ));	// Henyey-Greenstein

// 	float	Extinction = exp( -EXTINCTION_COEFFICIENT * _pView.w );
// 	float	ScatteringFactor = _pView.w * SCATTERING_ALBEDO * PhaseFunction * (1.0 - Extinction);###
	float	Extinction = exp( -_DEBUGScatteringStrength * _pView.w );
	float	ScatteringFactor = _pView.w * _DEBUGScatteringAlbedo * PhaseFunction * (1.0 - Extinction);

	_pInScattering = vec4( _SunColor * ScatteringFactor, Extinction );
}
