////////////////////////////////////////////////////////////////
// Graph Helpers include file
#ifndef _GRAPH_INCLUDED_
#define _GRAPH_INCLUDED_

const float	VERTICAL_SCALE = 0.1;	// 1/10th of the actual value otherwise the graph is ginormous!

#define	LINEAR_THETA

uniform int			_DisplayTypeThetaH;

uniform bool		_ShowLuminance;
uniform bool		_ShowLumaX10;
uniform int			_SeparateRGB;

uniform bool		_IsolateThetaD;
uniform bool		_IsolateThetaH;
uniform float		_IsolatedThetaValue;

// Compute the world height offset of a graph vertex given the 2D UV coordinates on the plane
float	ComputeWorldHeight( vec2 _UV )
{
	if ( _DisplayTypeThetaH == 0 )
		_UV.x = sqrt( _UV.x );
	else if ( _DisplayTypeThetaH == 2 )
		_UV = 1.0 - INV_HALFPI * acos( _UV );

	vec3	Reflectance = 10.0 * vec3( 0.2 * sin( 16.0 * _UV.x ) * sin( 16.0 * _UV.y ) );
	if ( _BRDFValid )
	{
		vec4	Color = texture2D( _TexBRDF, _UV );
		Reflectance = lerp( Color.xyz, vec3( 0, 1, 0 ), Color.w );
	}

	if ( _IsolateThetaD )
		Reflectance *= 1.0 - saturate( 100.0 * abs( _UV.y - _IsolatedThetaValue ) );
	else if ( _IsolateThetaH )
		Reflectance *= 1.0 - saturate( 100.0 * abs( _UV.x - _IsolatedThetaValue ) );

	if ( _ShowLogLuma )
		Reflectance = LogLuma( Reflectance );
	else if ( _ShowLumaX10 )
		Reflectance *= 10.0;

	if ( _SeparateRGB == 0 )
		return VERTICAL_SCALE * Reflectance.x;
	else if ( _SeparateRGB == 1 )
		return VERTICAL_SCALE * Reflectance.y;
	else if ( _SeparateRGB == 2 )
		return VERTICAL_SCALE * Reflectance.z;

	return VERTICAL_SCALE * dot( Reflectance, LUMINANCE );
}

vec4	ComputeGraphColor( vec2 _UV, bool _IsWireframe )
{
	if ( _DisplayTypeThetaH == 0 )
		_UV.x = sqrt( _UV.x );
	else if ( _DisplayTypeThetaH == 2 )
		_UV = 1.0 - INV_HALFPI * acos( _UV );

	vec3	Reflectance = _IsWireframe ? vec3( 0 ) : vec3( _UV, 0 );
	if ( _BRDFValid )
	{
		vec4	Color = texture2D( _TexBRDF, _UV );
		Reflectance = lerp( Color.xyz, vec3( 0, 1, 0 ), Color.w );
	}

	if ( _ShowIsolines )
	{
		float	bIsoline = IsIsoline( _UV, Reflectance );
		Reflectance = lerp( Reflectance, vec3( _ShowLogLuma ? 10.0 : 1.0, 0, 0 ), bIsoline );
	}

	if ( _ShowLogLuma )
		Reflectance = LogLuma( Reflectance );

	vec3	Color = Reflectance;
	if ( _ShowLuminance )
		Color = vec3( dot( Reflectance, LUMINANCE ) );
	else
	{
		if ( _SeparateRGB == 0 )
			Color = vec3( Reflectance.x, 0, 0 );
		else if ( _SeparateRGB == 1 )
			Color = vec3( 0, Reflectance.y, 0 );
		else if ( _SeparateRGB == 2 )
			Color = vec3( 0, 0, Reflectance.z );
	}

	return vec4( Color, _BRDFValid && _IsWireframe ? 0.5 : 1.0 );
}

#endif	//  _GRAPH_INCLUDED_
