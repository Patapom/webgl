// #o3d VertexShaderEntryPoint VS
// #o3d PixelShaderEntryPoint PS
// #o3d MatrixLoadOrder RowMajor

float4x4	worldViewProj : WorldViewProjection;

sampler2D	image;
float4		imageTexCoords;	// XY = The texture coordinates within the image, ZW = 1 / Texture size

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

PixelShaderInput VS(VertexShaderInput input)
{
	PixelShaderInput	output;
						output.position = mul(input.position, worldViewProj);
						output.UV = input.UV;

	return	output;
}

// Downsample X2
float4 PS(PixelShaderInput input) : COLOR
{
 	float4	Color00 = SampleInputTexture( image, imageTexCoords, input.UV + float2( -1, 0 ) * imageTexCoords.zw );
 	float4	Color01 = SampleInputTexture( image, imageTexCoords, input.UV + float2( +1, 0 ) * imageTexCoords.zw );
 	float4	Color10 = SampleInputTexture( image, imageTexCoords, input.UV + float2( 0, -1 ) * imageTexCoords.zw );
 	float4	Color11 = SampleInputTexture( image, imageTexCoords, input.UV + float2( 0, +1 ) * imageTexCoords.zw );

	// Bilateral filtering
	Color01.a = lerp( Color00.a, Color01.a, step( abs( Color01.a - Color00.a ), 0.05 ) );
	Color10.a = lerp( Color00.a, Color10.a, step( abs( Color10.a - Color00.a ), 0.05 ) );
	Color11.a = lerp( Color00.a, Color11.a, step( abs( Color11.a - Color00.a ), 0.05 ) );

	return	0.25 * (Color00 + Color01 + Color10 + Color11);
}
