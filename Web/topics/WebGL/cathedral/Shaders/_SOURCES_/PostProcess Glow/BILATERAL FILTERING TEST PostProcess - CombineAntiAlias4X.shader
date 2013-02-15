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
	const float	fDepthThreshold = 1.0 / 256.0;

	float4	ColorReference = SampleInputTexture( image0, imageTexCoords0, _Input.UV );

	// TESTS for bilateral filtering
	float4	Color0 = SampleInputTexture( image0, imageTexCoords0, _Input.UV + float2( (0.42-0.5) * imageTexCoords0.z, (0.07-0.5) * imageTexCoords0.w ) );
			Color0 = lerp( Color0, ColorReference, step( abs( Color0.a - ColorReference.a ), fDepthThreshold ) );
 	float4	Color1 = SampleInputTexture( image0, imageTexCoords0, _Input.UV + float2( (0.92-0.5) * imageTexCoords0.z, (0.42-0.5) * imageTexCoords0.w ) );
			Color1 = lerp( Color1, ColorReference, step( abs( Color1.a - ColorReference.a ), fDepthThreshold ) );
 	float4	Color2 = SampleInputTexture( image0, imageTexCoords0, _Input.UV + float2( (0.07-0.5) * imageTexCoords0.z, (0.57-0.5) * imageTexCoords0.w ) );
			Color2 = lerp( Color2, ColorReference, step( abs( Color2.a - ColorReference.a ), fDepthThreshold ) );
 	float4	Color3 = SampleInputTexture( image0, imageTexCoords0, _Input.UV + float2( (0.57-0.5) * imageTexCoords0.z, (0.92-0.5) * imageTexCoords0.w ) );
			Color3 = lerp( Color3, ColorReference, step( abs( Color3.a - ColorReference.a ), fDepthThreshold ) );

// 	float4	Color0 = SampleInputTexture( image0, imageTexCoords0, _Input.UV + float2( 0.42 * imageTexCoords0.z, 0.07 * imageTexCoords0.w ) );
// 			Color0 = lerp( ColorReference, Color0, step( abs( Color0.a - ColorReference.a ), fDepthThreshold ) );
//  	float4	Color1 = SampleInputTexture( image0, imageTexCoords0, _Input.UV + float2( 0.92 * imageTexCoords0.z, 0.42 * imageTexCoords0.w ) );
// 			Color1 = lerp( ColorReference, Color1, step( abs( Color0.a - ColorReference.a ), fDepthThreshold ) );
//  	float4	Color2 = SampleInputTexture( image0, imageTexCoords0, _Input.UV + float2( 0.07 * imageTexCoords0.z, 0.57 * imageTexCoords0.w ) );
// 			Color2 = lerp( ColorReference, Color2, step( abs( Color0.a - ColorReference.a ), fDepthThreshold ) );
//  	float4	Color3 = SampleInputTexture( image0, imageTexCoords0, _Input.UV + float2( 0.57 * imageTexCoords0.z, 0.92 * imageTexCoords0.w ) );
// 			Color3 = lerp( ColorReference, Color3, step( abs( Color0.a - ColorReference.a ), fDepthThreshold ) );

	float4	Result0 = 0.25 * (Color0 + Color1 + Color2 + Color3);

 	float4	Result1 = SampleInputTexture( image1, imageTexCoords1, _Input.UV );

//	return	float4( Result0.rgb + GlowFactor * Result1.rgb, Result1.a );
	return	Result0;
}
