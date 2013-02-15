// #o3d VertexShaderEntryPoint VS
// #o3d PixelShaderEntryPoint PS
// #o3d MatrixLoadOrder RowMajor

float4x4	worldViewProj : WorldViewProjection;

sampler2D	image0;
float4		imageTexCoords0;	// XY = The texture coordinates within the image, ZW = 1.0 / Image Width/Height

sampler2D	image1;
float4		imageTexCoords1;	// XY = The texture coordinates within the image, ZW = 1.0 / Image Width/Height

float		GlowFactor;

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
  float2	UV			: TEXCOORD0;
};

PixelShaderInput VS( VertexShaderInput _Input )
{
	PixelShaderInput	output;
						output.position = mul(_Input.position, worldViewProj);
						output.UV = _Input.UV;

	return	output;
}

// Combine render target with glow
float4 PS( PixelShaderInput _Input ) : COLOR
{
 	float4	Result0 = SampleInputTexture( image0, imageTexCoords0, _Input.UV );
 	float4	Result1 = SampleInputTexture( image1, imageTexCoords1, _Input.UV );

	return	float4( Result0.rgb + GlowFactor * Result1.rgb, Result1.a );
}
