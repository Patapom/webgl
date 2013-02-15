// #o3d VertexShaderEntryPoint VS
// #o3d PixelShaderEntryPoint PS
// #o3d MatrixLoadOrder RowMajor

#include "../ShaderInterfaces/PostProcessCamera.shader"
#include "../ShaderInterfaces/DirectionalLight.shader"

const static int	SHAFT_PASSES_COUNT = 4;


float4x4	worldViewProj : WorldViewProjection;

sampler2D	image0;
float4		imageTexCoords0;	// XY = The texture coordinates within the image, ZW = 1.0 / Image Width/Height

sampler2D	image1;
float4		imageTexCoords1;	// XY = The texture coordinates within the image, ZW = 1.0 / Image Width/Height

float		ShaftIndex;			// Index of the light shaft pass
float		ShaftPowerFactor;	// Power factor for luminosity of each pass


float4		SampleInputTexture( sampler2D _Sampler, const float4 _ImageTexCoords, float2 _UV )
{
	float2	UV = _UV * _ImageTexCoords.xy;

	return	tex2D( _Sampler, UV );
}

struct VertexShaderInput
{
	float4	position	: POSITION;
	float2	UV			: TEXCOORD0;
};

struct PixelShaderInput
{
	float4	position	: POSITION;
	float2	ScreenUV	: TEXCOORD0;
	float3	SlabUV		: TEXCOORD1;
	float3	SlabUV2		: TEXCOORD2;
	float3	SlabUV3		: TEXCOORD3;
	float3	SlabUV4		: TEXCOORD4;
};

PixelShaderInput VS( VertexShaderInput _Input )
{
	PixelShaderInput	output;
						output.position = mul(_Input.position, worldViewProj);
						output.ScreenUV = _Input.UV;

	// Compute light's position in screen space
	float3	CameraPosition = Camera2World[3].xyz;
	float3	LightVirtualPosition = CameraPosition + 1000.0 * LightWorldDirection;			// Light's virtual position in WORLD space
	float4	LightCameraPosition = mul( float4( LightVirtualPosition, 1 ), World2Camera );	// Light's virtual position in CAMERA space
	float4	LightScreenPosition = mul( LightCameraPosition, Camera2Proj );
			LightScreenPosition /= LightScreenPosition.w;									// Light's virtual position in SCREEN space

	float2	LightUVs = float2( 0.5 * (1 + LightScreenPosition.x), 0.5 * (1 - LightScreenPosition.y) );	// This is the light's position in screen UVs which represents our position invariant

	// Compute slab UVs
	float	fSlabSizeMin = 1.0;
	float	fSlabSizeMax = 0.7;

	float	fSlabSize = lerp( fSlabSizeMin, fSlabSizeMax, (1+ShaftIndex) / SHAFT_PASSES_COUNT );
	output.SlabUV.xy = float2(
		LightUVs.x + fSlabSize * (_Input.UV.x - LightUVs.x),
		LightUVs.y + fSlabSize * (_Input.UV.y - LightUVs.y)
	);

	fSlabSize = lerp( fSlabSizeMin, fSlabSizeMax, (1.25+ShaftIndex) / SHAFT_PASSES_COUNT );
	output.SlabUV2.xy = float2(
		LightUVs.x + fSlabSize * (_Input.UV.x - LightUVs.x),
		LightUVs.y + fSlabSize * (_Input.UV.y - LightUVs.y)
	);

	fSlabSize = lerp( fSlabSizeMin, fSlabSizeMax, (1.50+ShaftIndex) / SHAFT_PASSES_COUNT );
	output.SlabUV3.xy = float2(
		LightUVs.x + fSlabSize * (_Input.UV.x - LightUVs.x),
		LightUVs.y + fSlabSize * (_Input.UV.y - LightUVs.y)
	);

	fSlabSize = lerp( fSlabSizeMin, fSlabSizeMax, (1.75+ShaftIndex) / SHAFT_PASSES_COUNT );
	output.SlabUV4.xy = float2(
		LightUVs.x + fSlabSize * (_Input.UV.x - LightUVs.x),
		LightUVs.y + fSlabSize * (_Input.UV.y - LightUVs.y)
	);

	// Compute luminance factor
		// Linear attenuation
// 	output.SlabUV.z = 1 - ShaftIndex / SHAFT_PASSES_COUNT;
// 	output.SlabUV2.z = 1 - (0.25+ShaftIndex) / SHAFT_PASSES_COUNT;
// 	output.SlabUV3.z = 1 - (0.50+ShaftIndex) / SHAFT_PASSES_COUNT;
// 	output.SlabUV4.z = 1 - (0.75+ShaftIndex) / SHAFT_PASSES_COUNT;

// 		// Exp attenuation
// 	float	fSigmaExtinction = 0.1;
// 	float	fDistanceFactor = 10;
// 	output.SlabUV.z  = exp( -fSigmaExtinction * fDistanceFactor * ShaftIndex / SHAFT_PASSES_COUNT );
// 	output.SlabUV2.z = exp( -fSigmaExtinction * fDistanceFactor * (0.25+ShaftIndex) / SHAFT_PASSES_COUNT );
// 	output.SlabUV3.z = exp( -fSigmaExtinction * fDistanceFactor * (0.50+ShaftIndex) / SHAFT_PASSES_COUNT );
// 	output.SlabUV4.z = exp( -fSigmaExtinction * fDistanceFactor * (0.75+ShaftIndex) / SHAFT_PASSES_COUNT );

		// Power attenuation
	float	fPower = 0.5;
	output.SlabUV.z = pow( 1 - ShaftIndex / SHAFT_PASSES_COUNT, fPower );
	output.SlabUV2.z = pow( 1 - (0.25+ShaftIndex) / SHAFT_PASSES_COUNT, fPower );
	output.SlabUV3.z = pow( 1 - (0.50+ShaftIndex) / SHAFT_PASSES_COUNT, fPower );
	output.SlabUV4.z = pow( 1 - (0.75+ShaftIndex) / SHAFT_PASSES_COUNT, fPower );

	return	output;
}

// Combine render target with glow
float4 PS( PixelShaderInput _Input ) : COLOR
{
//	float4	ZBufferSource = SampleInputTexture( image0, imageTexCoords0, _Input.ScreenUV );

	float3	CameraView = ComputeWorldViewVector( _Input.ScreenUV );
	float	fCameraLightPhase = saturate( dot( CameraView, LightWorldDirection ) );

	// 1st tap
	float4	ZBufferSlab = SampleInputTexture( image0, imageTexCoords0, _Input.SlabUV.xy );
	float3	Color = _Input.SlabUV.z * ZBufferSlab.rgb * ZBufferSlab.a;

	// 2nd tap
	ZBufferSlab = SampleInputTexture( image0, imageTexCoords0, _Input.SlabUV2.xy );
	Color += _Input.SlabUV2.z * ZBufferSlab.rgb * ZBufferSlab.a;

	// 3rd tap
	ZBufferSlab = SampleInputTexture( image0, imageTexCoords0, _Input.SlabUV3.xy );
	Color += _Input.SlabUV3.z * ZBufferSlab.rgb * ZBufferSlab.a;

	// 4th tap
	ZBufferSlab = SampleInputTexture( image0, imageTexCoords0, _Input.SlabUV4.xy );
	Color += _Input.SlabUV4.z * ZBufferSlab.rgb * ZBufferSlab.a;


	// Ponder by light color
	float3	Luminance = dot( float3( 0.3, 0.5, 0.2 ), LightColor );
	float	fGlobalLightFactor = ShaftPowerFactor * 0.05 * Luminance * fCameraLightPhase;

	return	float4( fGlobalLightFactor * 0.25 * Color, 1 );
}
