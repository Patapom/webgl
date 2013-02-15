////////////////////////////////////////////////////////////////
// Light Models include file
#ifndef _LIGHT_MODELS_INCLUDED_
#define _LIGHT_MODELS_INCLUDED_

#if 0	// Use this for uniform distribution
// Standard mapping without cosine lobe weighting
//	_SolidAngleCosine returns (L.N) . dw
//
vec3	UV2Direction( vec2 _UV, out float _SolidAngleCosine )
{
	float	CosTheta = cos( HALFPI * _UV.y );
	float	SinTheta = sqrt( 1.0 - CosTheta*CosTheta );

	float	Phi = _UV.x * TWOPI;
	float	CosPhi = cos( Phi );
	float	SinPhi = sin( Phi );

	vec3	Dir;
	Dir.x = SinPhi * SinTheta;
	Dir.y = CosPhi * SinTheta;
	Dir.z = CosTheta;

	// Solid angle
	_SolidAngleCosine = SinTheta * PI*PI;	// dPhi * sin(Theta) * dTheta = (2PI/Nx) * sin(Theta) * (PI/2Ny) = PI²/N * sin(Theta) where N=Nx.Ny=MC_SAMPLES_COUNT which is divided by later
	_SolidAngleCosine *= CosTheta;

	return Dir;
}
#else
// Converts a 2D UV into an upper hemisphere direction (tangent space) + solid angle
// The direction is weighted by the surface cosine lobe
vec3	UV2Direction( vec2 _UV, out float _SolidAngleCosine )
{
	_UV.y += 1e-5;	// 0 is completely useless..

	float	Radius = sqrt(_UV.y);	// Also = sin(Theta)
	float	Phi = _UV.x * TWOPI;
	float	CosPhi = cos( Phi );
	float	SinPhi = sin( Phi );

	vec3	Dir;
	Dir.x = Radius * SinPhi;
	Dir.y = Radius * CosPhi;
	Dir.z = sqrt( 1.0 - _UV.y );

	// Solid angle
	_SolidAngleCosine = PI;

	return Dir;
}
#endif

////////////////////////////////////////////////////////////////
// Area Light
// The UVs are used to sample a large rectangular light at the ceiling N units above the sphere
//
#if defined(LIGHT_TYPE0)

uniform float	_AreaLightSize;
uniform vec3	_LightPosition;
uniform vec3	_LightX;
uniform vec3	_LightY;
uniform vec3	_LightDirection;

void	GetLightRadiance( vec2 _RandomUV, vec3 _Position, vec3 _Tangent, vec3 _BiTangent, vec3 _Normal, out vec3 _LightRadiance, out vec3 _LightDirectionTS )
{
	vec2	LightSize = _AreaLightSize * vec2( 2, 8 );
	vec3	LightX = LightSize.x * _LightX;
	vec3	LightY = LightSize.y * _LightY;
	vec3	LightZ = -_LightDirection;

	// compute light direction
	vec3	LightSourcePosition = _LightPosition + (_RandomUV.x - 0.5) * LightX + (_RandomUV.y - 0.5) * LightY;

	vec3	ToLight = LightSourcePosition - _Position;
	float	Distance2Light = length( ToLight );
	ToLight /= Distance2Light;

	_LightDirectionTS = vec3( dot( ToLight, _Tangent ), dot( ToLight, _BiTangent ), dot( ToLight, _Normal ) );

	// Compute solid angle
	float	CosineSurface = saturate( dot( ToLight, _Normal ) );
	float	CosineLight = saturate( -dot( ToLight, LightZ ) );
	float	dw = LightSize.x * LightSize.y * CosineLight;

	// Final radiance
	_LightRadiance = vec3( _LightIntensity ) * (dw / (Distance2Light * Distance2Light)) * CosineSurface;	// Li * dw / r² * (n.w_i)
}

////////////////////////////////////////////////////////////////
// Sky Light
// From http://mathinfo.univ-reims.fr/IMG/pdf/CIE_DS011_2.pdf
//
#elif defined(LIGHT_TYPE1)

uniform vec3	_SunDirection;
uniform vec4	_SkyParams0;	// Contains a, b, c, d
uniform vec4	_SkyParams1;	// Contains e, 0, 0, 0

// Computes the luminance gradation (relates the luminance of the sky element to its zenith value)
float	GetPhi( float _CosTheta )
{
	return 1.0 + _SkyParams0.x * exp( _SkyParams0.y / max( 1e-3, _CosTheta ) );
}

// Computes the scattering indicatrix (relates the relative luminance of a sky element to its angular distance from the sun)
float	GetF( float _Chi, float _CosChi )
{
	return 1.0 + _SkyParams0.z * (exp( _SkyParams0.w * _Chi ) - exp( _SkyParams0.w * HALFPI )) + _SkyParams1.x * _CosChi * _CosChi;
}

float	GetRelativeLuminance( vec3 _ToLight )
{
	if ( _ToLight.y < 0.0 )
		return 0.0;

	float	CosZs = _SunDirection.y;
	float	SinZs = sqrt( 1.0 - CosZs * CosZs );
	float	CosZ = _ToLight.y;
	float	SinZ = sqrt( 1.0 - CosZ * CosZ );

	float	AlphaS = atan( _SunDirection.x, _SunDirection.z );
	float	Alpha = atan( _ToLight.x, _ToLight.z );

	float	CosChi = CosZs * CosZ + SinZs * SinZ * cos( Alpha - AlphaS );
	float	Chi = acos( CosChi );

	float	Ls = GetPhi( 0.0 ) * GetF( acos( CosZs ), CosZs );
	float	La = GetPhi( CosZ ) * GetF( Chi, CosChi );

	return La / Ls;
}

void	GetLightRadiance( vec2 _RandomUV, vec3 _Position, vec3 _Tangent, vec3 _BiTangent, vec3 _Normal, out vec3 _LightRadiance, out vec3 _LightDirectionTS )
{
	// Retrieve light direction + solid angle
	float	dw;
	_LightDirectionTS = UV2Direction( _RandomUV, dw );

	// Use CIE sky model
	vec3	LightDirection = _LightDirectionTS.x * _Tangent + _LightDirectionTS.y * _BiTangent + _LightDirectionTS.z * _Normal;
	vec3	LightRadiance = vec3( _LightIntensity ) * GetRelativeLuminance( LightDirection );

	// Li * (L.N) . dw
	_LightRadiance = LightRadiance * dw;
}


////////////////////////////////////////////////////////////////
// Image Based Lighting
//
#elif defined(LIGHT_TYPE2)

void	GetLightRadiance( vec2 _RandomUV, vec3 _Position, vec3 _Tangent, vec3 _BiTangent, vec3 _Normal, out vec3 _LightRadiance, out vec3 _LightDirectionTS )
{
	// Retrieve light direction + solid angle
	float	dw;
	_LightDirectionTS = UV2Direction( _RandomUV, dw );

	// Use CIE sky model
	vec3	LightDirection = _LightDirectionTS.x * _Tangent + _LightDirectionTS.y * _BiTangent + _LightDirectionTS.z * _Normal;
	vec3	LightRadiance = SampleEnvMap( LightDirection );

	// Li * (L.N) . dw
	_LightRadiance = LightRadiance * dw;
}


////////////////////////////////////////////////////////////////
// No light
#else

void	GetLightRadiance( vec2 _RandomUV, vec3 _Position, vec3 _Tangent, vec3 _BiTangent, vec3 _Normal, out vec3 _LightRadiance, out vec3 _LightDirectionTS )
{
	_LightRadiance = vec3( 0.0 );
	_LightDirectionTS = vec3( 0.0, 1.0, 0.0 );
}

#endif	//	LIGHT_TYPE

#endif	//  _LIGHT_MODELS_INCLUDED_
