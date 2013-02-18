////////////////////////////////////////////////////////////////
// 3D BRDF Helpers include file
#ifndef _3D_INCLUDED_
#define _3D_INCLUDED_

const float	GLOBAL_SCALE = 1.0;	// 1/10th of the actual value otherwise the graph is ginormous!

uniform vec3		_LightDirection;
uniform bool		_ShowLuminance;
uniform bool		_ShowChroma2;
uniform bool		_ShowLogLumaGeometry;
uniform bool		_UseBRDFColors;
uniform bool		_ShowX10;
uniform int			_SeparateRGB;

uniform bool		_ShowRefBRDF;	// Reference BRDF is displayed in 50% alpha blended mode

uniform bool		_RenderPickable;

uniform bool		_ShowMarker;
uniform vec2		_MarkerPosition;

// Compute the world height offset of a graph vertex given the 2D UV coordinates on the plane
vec3	ComputeWorldDisplacement( vec3 _Direction, vec2 _UV )
{
	vec3	Reflectance = (vec3( 0.1 ) + vec3( 0.05 * sin( 8.0 * PI * _UV.x ) * sin( 4.0 * PI * _UV.y ) ) ) / GLOBAL_SCALE;
	if ( _BRDFValid )
	{
		vec3	LightTS = _LightDirection.zxy;
		vec3	ViewTS = _Direction.zxy;
		Reflectance = BRDF( LightTS, ViewTS, _ShowLogLumaGeometry );
	}

	if ( _ShowLogLumaGeometry )
		Reflectance = LogLuma( Reflectance );

	if ( _SeparateRGB == 0 )
		return GLOBAL_SCALE * Reflectance.x * _Direction;
	else if ( _SeparateRGB == 1 )
		return GLOBAL_SCALE * Reflectance.y * _Direction;
	else if ( _SeparateRGB == 2 )
		return GLOBAL_SCALE * Reflectance.z * _Direction;

	return GLOBAL_SCALE * dot( Reflectance, LUMINANCE ) * _Direction;
}

void	BlendWithMarker( inout vec3 _Color, vec3 _Direction )
{
	if ( !_ShowMarker )
		return;

	vec3	LightTS = _LightDirection.zxy;
	vec3	ViewTS = _Direction.zxy;

	// Transform into half-vector space
	vec3	H;
	vec3	ThetaHD_PhiD;
	LightView2Angles( LightTS, ViewTS, H, ThetaHD_PhiD );
//	vec2	WarpedThetaHD = WarpIntoUV( ThetaHD_PhiD );		// Warp Thetas based on PhiD

	float	Distance2Marker = length( _MarkerPosition - ThetaHD_PhiD.xy );
	_Color = lerp( _Color, vec3( 1, 0, 0 ), smoothstep( 0.1, 0.0, Distance2Marker ) );
}


vec4	ComputeBRDFColor( vec3 _Direction, vec2 _UV, vec2 _DiffuseSpecular, bool _IsWireframe )
{
	if ( _RenderPickable )
	{	// Ignore everything and render as tiny pickable angles
		vec3	LightTS = _LightDirection.zxy;
		vec3	ViewTS = _Direction.zxy;

		// Transform into half-vector space
		vec3	H;
		vec3	ThetaHD_PhiD;
		LightView2Angles( LightTS, ViewTS, H, ThetaHD_PhiD );

		return vec4( INV_HALFPI * ThetaHD_PhiD.xy, 0, 1 );
	}

	// Special lighting
	if ( !_UseBRDFColors )
	{
		vec3	BaseColor = vec3( 1.0 );
		if ( _SeparateRGB == 0 )
			BaseColor = vec3( 1, 0, 0 );
		else if ( _SeparateRGB == 1 )
			BaseColor = vec3( 0, 1, 0 );
		else if ( _SeparateRGB == 2 )
			BaseColor = vec3( 0, 0, 1 );
		
		if ( _IsWireframe )
			BaseColor *= 0.1;
 		BaseColor *= _DiffuseSpecular.x;
 		BaseColor += _DiffuseSpecular.yyy;

		BlendWithMarker( BaseColor, _Direction );

		return vec4( BaseColor, _IsWireframe ? 0.8 : 1.0 );
	}

	// Use BRDF color directly
	vec3	Reflectance = _IsWireframe ? vec3( 0 ) : vec3( _UV, 0 );
	if ( _BRDFValid )
	{
		vec3	LightTS = _LightDirection.zxy;
		vec3	ViewTS = _Direction.zxy;
		Reflectance = BRDF( LightTS, ViewTS, _ShowLogLuma );

		if ( _IsWireframe )
			Reflectance = 1.0 - Reflectance;	// So it's clearly visible!
	}

	if ( _ShowX10 )
		Reflectance *= 10.0;	// Boost!
	if ( _ShowChroma2 )
		Reflectance /= max( 1e-3, max( max( Reflectance.x, Reflectance.y ), Reflectance.z ) );

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

	BlendWithMarker( Color, _Direction );

	float	Alpha = 1.0;
	if ( _BRDFValid )
	{
		if ( _ShowRefBRDF )
			Alpha = 0.5;
		else if ( _IsWireframe )
			Alpha = 0.5;
	}
	return vec4( Color, Alpha );
}

#endif	//  _3D_INCLUDED_
