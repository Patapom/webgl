////////////////////////////////////////////////////////////////
//
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

precision highp float;

const float	SHAFT_PASSES_COUNT = 4.0;

////////////////////////////////////////////////////////////////
attribute vec4	_vPosition;

varying vec3	_Position;
varying vec2	_UV;
varying vec3	_View;
varying vec2	_SlabUV0;
varying vec2	_SlabUV1;
varying vec2	_SlabUV2;
varying vec2	_SlabUV3;

uniform mat4	_Camera2World;
uniform mat4	_World2Proj;
uniform vec3	_SunDirection;		// Direction of the Sun in world space
uniform vec2	_AspectRatio;
uniform float	_ShaftIndex;		// Index of the light shaft pass

void	main()
{
	gl_Position = _vPosition;
	_UV = 0.5 * (1.0 + _vPosition.xy);

	_View = (_Camera2World * vec4( (2.0 * _UV - 1.0) * _AspectRatio, 1.0, 0.0 )).xyz;

	// Project Sun's direction into screen space
	vec4	SunDirectionProj = _World2Proj * vec4( _SunDirection, 0.0 );
	vec3	SunDirection = SunDirectionProj.xyz / SunDirectionProj.w;
	vec2	SunUV = 0.5 * (1.0 + SunDirection.xy);	// Sun UV coordinates: the center of the light shaft

	// Compute slab UVs
	float	fSlabSizeMin = 1.0;
	float	fSlabSizeMax = 0.8;

	float	fSlabSize = lerp( fSlabSizeMin, fSlabSizeMax, (1.0+_ShaftIndex) / SHAFT_PASSES_COUNT );
	_SlabUV0 = vec2( SunUV.x + fSlabSize * (_UV.x - SunUV.x), SunUV.y + fSlabSize * (_UV.y - SunUV.y) );

	fSlabSize = lerp( fSlabSizeMin, fSlabSizeMax, (1.25+_ShaftIndex) / SHAFT_PASSES_COUNT );
	_SlabUV1 = vec2( SunUV.x + fSlabSize * (_UV.x - SunUV.x), SunUV.y + fSlabSize * (_UV.y - SunUV.y) );

	fSlabSize = lerp( fSlabSizeMin, fSlabSizeMax, (1.50+_ShaftIndex) / SHAFT_PASSES_COUNT );
	_SlabUV2 = vec2( SunUV.x + fSlabSize * (_UV.x - SunUV.x), SunUV.y + fSlabSize * (_UV.y - SunUV.y) );

	fSlabSize = lerp( fSlabSizeMin, fSlabSizeMax, (1.75+_ShaftIndex) / SHAFT_PASSES_COUNT );
	_SlabUV3 = vec2( SunUV.x + fSlabSize * (_UV.x - SunUV.x), SunUV.y + fSlabSize * (_UV.y - SunUV.y) );
}
