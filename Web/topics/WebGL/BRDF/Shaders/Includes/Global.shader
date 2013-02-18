////////////////////////////////////////////////////////////////
// Global include file
#ifndef _GLOBAL_INCLUDED_
#define _GLOBAL_INCLUDED_

precision highp float;

#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )


////////////////////////////////////////////////////////////////
// CONSTANTS
//
const float	PI = 3.1415926535897932384626433832795;
const float	TWOPI = 6.283185307179586476925286766559;
const float	HALFPI = 1.5707963267948966192313216916398;
const float	INV_PI = 0.31830988618379067153776752674503;
const float	INV_4PI = 0.07957747154594766788444188168626;
const float	INV_HALFPI = 0.63661977236758134307553505349006;	// 2/PI

const vec3	LUMINANCE = vec3( 0.2126, 0.7152, 0.0722 );			// Observer. = 2°, Illuminant = D65


////////////////////////////////////////////////////////////////
// HELPERS
//
uniform sampler2D	_TexWarp;			// Warp texture to scale Thetas with PhiD
uniform sampler2D	_TexBRDF;			// The 2D BRDF texture
uniform bool		_BRDFValid;			// True if the BRDF is available

uniform sampler2D	_TexHDREnvMap;
uniform float		_EnvMapPhi;

uniform float		_LightIntensity;

uniform float		_Exposure;
uniform bool		_ShowLogLuma;
uniform bool		_ShowChroma;
uniform bool		_ShowDeChromatized;
uniform bool		_ShowNormalized;
uniform vec3		_MaxReflectance;
uniform bool		_ShowIsolines;


vec3	RGB2XYZ( vec3 _RGB )
{
	// Observer. = 2°, Illuminant = D65
	vec3	XYZ;
	XYZ.x = _RGB.x * 0.4124 + _RGB.y * 0.3576 + _RGB.z * 0.1805;
	XYZ.y = _RGB.x * 0.2126 + _RGB.y * 0.7152 + _RGB.z * 0.0722;
	XYZ.z = _RGB.x * 0.0193 + _RGB.y * 0.1192 + _RGB.z * 0.9505;
	return XYZ;
}

vec3	XYZ2RGB( vec3 _XYZ )
{
	vec3	RGB;
	RGB.x =  2.04159 * _XYZ.x - 0.56501 * _XYZ.y - 0.34473 * _XYZ.z;
	RGB.y = -0.96924 * _XYZ.x + 1.87597 * _XYZ.y + 0.04156 * _XYZ.z;
	RGB.z =  0.01344 * _XYZ.x - 0.11836 * _XYZ.y + 1.01517 * _XYZ.z;
	return RGB;
}

vec3	XYZ2xyY( vec3 _XYZ )
{
	float	InvMag = 1.0 / (_XYZ.x + _XYZ.y + _XYZ.z);
	vec3	xyY;
	xyY.x = _XYZ.x * InvMag;
	xyY.y = _XYZ.y * InvMag;
	xyY.z = _XYZ.y;
	return xyY;
}

vec3	xyY2XYZ( vec3 _xyY )
{
	float	Mul = _xyY.z / _xyY.y;
	vec3	XYZ;
	XYZ.x = _xyY.x * Mul;
	XYZ.y = _xyY.z;
	XYZ.z = (1.0 - _xyY.x - _xyY.y) * Mul;
	return XYZ;
}

vec3	LogLuma( vec3 _RGB )
{
	float	Luma = max( 1e-4, _RGB.x * 0.2126 + _RGB.y * 0.7152 + _RGB.z * 0.0722 );
	float	LogLuma = max( 0.0, log( 1.0 + Luma ) * 0.43429448190325182765112891891661 );
	return _RGB * LogLuma / Luma;
}

vec3	Chroma( vec3 _RGB )
{
	float	Scale = 1.0 / max( 1e-3, max( max( _RGB.x, _RGB.y ), _RGB.z ) );
	return _RGB * Scale;
}

vec3	RotateVector( vec3 v, vec3 _Axis, float _Angle )
{
	float	CosAngle = sin( _Angle );
	float	SinAngle = cos( _Angle );

	float	Dot = dot( v, _Axis );
			Dot *= 1.0 - CosAngle;

	vec3	Ortho = cross( _Axis, v );
	
	return CosAngle * v + SinAngle * Ortho + Dot * _Axis;
}

vec3	RotateVector( vec3 v, vec3 _Axis, vec2 _SinCosAngle )
{
	float	Dot = dot( v, _Axis );
			Dot *= 1.0 - _SinCosAngle.y;

	vec3	Ortho = cross( _Axis, v );
	
	return _SinCosAngle.y * v + _SinCosAngle.x * Ortho + Dot * _Axis;
}


////////////////////////////////////////////////////////////////
// Samples the normal map
vec3	SampleNormalMap( sampler2D _TexNormalMap, vec2 _UV, float _Strength )
{
	vec3	NormalTS = 2.0 * texture2D( _TexNormalMap, _UV ).xyz - vec3(1.0);
			NormalTS.z *= 4.0;	// Attenuate strength

	NormalTS = lerp( vec3( 0, 0, 1 ), NormalTS, _Strength );
	return normalize( NormalTS );
}

////////////////////////////////////////////////////////////////
// Transform tangent space based on new normal from a normal map
void	RotateTangentSpace( inout vec3 _Tangent, inout vec3 _BiTangent, inout vec3 _Normal, vec3 _NormalTS )
{
	vec3	Ortho = cross( vec3( 0, 0, 1 ), _NormalTS );
	vec2	SinCos = vec2( length( Ortho ), 0.0 );
	if ( SinCos.x > 1e-6 )
		Ortho /= SinCos.x;
	else
		Ortho = vec3( 1, 0, 0 );
	SinCos.y = sqrt( 1.0 - SinCos.x*SinCos.x );

	_Normal = RotateVector( _Normal, Ortho, SinCos );
	_Tangent = RotateVector( _Tangent, Ortho, SinCos );
	_BiTangent = RotateVector( _BiTangent, Ortho, SinCos );
}


////////////////////////////////////////////////////////////////
// Isolines
float	IsoTest( float a, float b )
{
	float	LogFact = 0.43429448190325182765112891891661;	// 1/log(10) => Show isolines every 10s

	float	LogA = LogFact * log( a );
	float	LogB = LogFact * log( b );

// 	float	t = saturate( (3.0 + LogA) / 4.0 );
// 	float	Tolerance = lerp( 0.01, 0.15, t );
	float	Tolerance = 0.1 * pow( 2.0, LogA );// * lerp( 2.0, 0.0, saturate(abs( LogA - LogB )) );

	return abs( fract( LogA ) - fract( LogB ) ) > 1.0 - Tolerance ? 1.0 : 0.0;
}

// Returns 1 if the current reflectance is standing on an isoline of a power of 10, 0 otherwise
float	IsIsoline( vec2 _UV, vec3 _Reflectance )
{
	vec3	dUV = vec3( 1.0 / 90.0, -1.0 / 90.0, 0.0 );

	float	Vmm = dot( texture2D( _TexBRDF, _UV + dUV.xx ).xyz, LUMINANCE );
	float	Vm0 = dot( texture2D( _TexBRDF, _UV + dUV.zx ).xyz, LUMINANCE );
	float	Vmp = dot( texture2D( _TexBRDF, _UV + dUV.yx ).xyz, LUMINANCE );
	float	V0m = dot( texture2D( _TexBRDF, _UV + dUV.xz ).xyz, LUMINANCE );
	float	V00 = dot( _Reflectance, LUMINANCE );
	float	V0p = dot( texture2D( _TexBRDF, _UV + dUV.yz ).xyz, LUMINANCE );
	float	Vpm = dot( texture2D( _TexBRDF, _UV + dUV.xy ).xyz, LUMINANCE );
	float	Vp0 = dot( texture2D( _TexBRDF, _UV + dUV.zy ).xyz, LUMINANCE );
	float	Vpp = dot( texture2D( _TexBRDF, _UV + dUV.yy ).xyz, LUMINANCE );

	float	bIsoline  = IsoTest( V00, Vmm );
			bIsoline += IsoTest( V00, Vm0 );
			bIsoline += IsoTest( V00, Vmp );
			bIsoline += IsoTest( V00, V0m );
			bIsoline += IsoTest( V00, V0p );
			bIsoline += IsoTest( V00, Vpm );
			bIsoline += IsoTest( V00, Vp0 );
			bIsoline += IsoTest( V00, Vpp );

	return saturate( bIsoline );
}

////////////////////////////////////////////////////////////////
// HDR environment map sampling
//
vec3	SampleEnvMap( vec3 _Direction )
{
	vec2	UV = vec2( 0.5 * (1.0 + (atan( _Direction.x, -_Direction.z ) + _EnvMapPhi) * INV_PI), acos( -_Direction.y ) * INV_PI );
	return _LightIntensity * texture2D( _TexHDREnvMap, UV ).xyz;
}

////////////////////////////////////////////////////////////////
// BRDF Reflectance sampling

// Converts standard light/view vectors into Half/Diff angles
void	LightView2Angles( vec3 _LightTS, vec3 _ViewTS, out vec3 H, out vec3 _ThetaHD_PhiD )
{
	H = normalize( _ViewTS + _LightTS );

	float	PhiH = atan( H.y, H.x );
	_ThetaHD_PhiD.x = acos( H.z );				// ThetaH is the angle between the original normal and H

	// Compute diff vector
	vec3	Temp = RotateVector( _LightTS, vec3( 0, 0, 1 ), -PhiH );		// Rotate back in Tangent^Normal plane
	vec3	Diff = RotateVector( Temp, vec3( 0, 1, 0 ), -_ThetaHD_PhiD.x );	// Realign H with normal

	_ThetaHD_PhiD.y = acos( Diff.z );			// ThetaD is the half angle between view and light
	_ThetaHD_PhiD.z = atan( Diff.y, Diff.x );	// PhiD is the angle between the Light and the Normal^Half Vector plane

	if ( _ThetaHD_PhiD.z < 0.0 )
		_ThetaHD_PhiD.z += PI;	// Make sure we're always in [0,PI]

// NOTE: If we plan on not using PhiD then no need to rotate vectors and we simply have:
_ThetaHD_PhiD.y = acos( dot( _LightTS, H ) );
}

// Warps the (ThetaH, ThetaD) depending on PhiD using the warp texture
vec2	WarpIntoUV( vec3 _ThetaHD_PhiD )
{
return INV_HALFPI * _ThetaHD_PhiD.xy;	// Simple, no warping


	float	Slope = atan( _ThetaHD_PhiD.y, _ThetaHD_PhiD.x );							// This is the slope of the line starting from the origin (ThetaH&D = 0) and going through our (ThetaH,ThetaD)
	float	PhiD = _ThetaHD_PhiD.z > HALFPI ? PI - _ThetaHD_PhiD.z : _ThetaHD_PhiD.z;	// This is our PhiD in [0,PI/2]

	// Retrieve the scale factor to apply to current ThetaDH angles
	vec2	WarpUV = INV_HALFPI * vec2( Slope, PhiD );
			WarpUV.y = 1.0 - WarpUV.y;
	float	Scale = texture2D( _TexWarp, WarpUV ).x;

//return vec2( Slope * INV_HALFPI );//###
// return vec2( PhiD * INV_HALFPI );
// return vec2( Scale );

	vec2	UV = _ThetaHD_PhiD.xy * INV_HALFPI;	// Normalize [0,PI/2] angles into [0,1]
			UV *= Scale;						// Scale according to our warp table

	return UV;
}

vec3	GetReflectance( vec2 _UV, bool _ShowLogLuma )
{
	_UV.x = sqrt( _UV.x );

	vec3	Reflectance = texture2D( _TexBRDF, _UV ).xyz;
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

	return Reflectance;
}

// Samples the BRDF's reflectance
vec3	BRDF( vec3 _LightTS, vec3 _ViewTS, bool _ShowLogLuma )
{
	// Transform into half-vector space
	vec3	H;
	vec3	ThetaHD_PhiD;
	LightView2Angles( _LightTS, _ViewTS, H, ThetaHD_PhiD );

	// Warp Thetas based on PhiD
	vec2	WarpedThetaHD = WarpIntoUV( ThetaHD_PhiD );
//return WarpedThetaHD.xxx;//###

	return GetReflectance( WarpedThetaHD, _ShowLogLuma );
}

#endif	//  _GLOBAL_INCLUDED_
