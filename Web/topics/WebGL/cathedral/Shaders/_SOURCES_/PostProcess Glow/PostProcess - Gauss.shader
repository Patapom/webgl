// #o3d VertexShaderEntryPoint VS
// #o3d PixelShaderEntryPoint PS
// #o3d MatrixLoadOrder RowMajor

float4x4	worldViewProj : WorldViewProjection;

sampler2D	image;
float4		imageTexCoords;	// XY = The texture coordinates within the image, ZW = 1 / Texture size

float2		Offset;			// XY = Offset
float4		Weights0;		// XYZW = 4 Gaussian Weights
float4		Weights1;		// XYZW = 4 Gaussian Weights


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

// Perform separated Gaussian blur (horizontally or vertically according to the pass)
//
float4 PS( PixelShaderInput _Input ) : COLOR
{
 	float4	Result = { 0.0, 0.0, 0.0, 0.0 };

	float4	Color0 = SampleInputTexture( image, imageTexCoords, _Input.UV + 0 * Offset );
	float4	Color1 = SampleInputTexture( image, imageTexCoords, _Input.UV + 1 * Offset );
	float4	Color2 = SampleInputTexture( image, imageTexCoords, _Input.UV + 2 * Offset );
	float4	Color3 = SampleInputTexture( image, imageTexCoords, _Input.UV + 3 * Offset );
	float4	Color4 = SampleInputTexture( image, imageTexCoords, _Input.UV + 4 * Offset );
	float4	Color5 = SampleInputTexture( image, imageTexCoords, _Input.UV + 5 * Offset );
	float4	Color6 = SampleInputTexture( image, imageTexCoords, _Input.UV + 6 * Offset );
	float4	Color_1 = SampleInputTexture( image, imageTexCoords, _Input.UV - 1 * Offset );
	float4	Color_2 = SampleInputTexture( image, imageTexCoords, _Input.UV - 2 * Offset );
	float4	Color_3 = SampleInputTexture( image, imageTexCoords, _Input.UV - 3 * Offset );
	float4	Color_4 = SampleInputTexture( image, imageTexCoords, _Input.UV - 4 * Offset );
	float4	Color_5 = SampleInputTexture( image, imageTexCoords, _Input.UV - 5 * Offset );
	float4	Color_6 = SampleInputTexture( image, imageTexCoords, _Input.UV - 6 * Offset );

// 	// Bilateral filtering on alpha
// 	Color1.a = lerp( Color0.a, Color1.a, step( abs( Color1.a - Color0.a ), 0.05 ) );
// 	Color2.a = lerp( Color0.a, Color1.a, step( abs( Color2.a - Color0.a ), 0.05 ) );
// //	Color3.a = lerp( Color0.a, Color1.a, step( abs( Color3.a - Color0.a ), 0.05 ) );
// // 	Color4.a = lerp( Color0.a, Color1.a, step( abs( Color4.a - Color0.a ), 0.05 ) );
// // 	Color5.a = lerp( Color0.a, Color1.a, step( abs( Color5.a - Color0.a ), 0.05 ) );
// // 	Color6.a = lerp( Color0.a, Color1.a, step( abs( Color6.a - Color0.a ), 0.05 ) );
// 	Color3.a = Color0.a;
// 	Color4.a = Color0.a;
// 	Color5.a = Color0.a;
// 	Color6.a = Color0.a;
// 
// 	Color_1.a = lerp( Color0.a, Color1.a, step( abs( Color_1.a - Color0.a ), 0.05 ) );
// 	Color_2.a = lerp( Color0.a, Color1.a, step( abs( Color_2.a - Color0.a ), 0.05 ) );
// //	Color_3.a = lerp( Color0.a, Color1.a, step( abs( Color_3.a - Color0.a ), 0.05 ) );
// // 	Color_4.a = lerp( Color0.a, Color1.a, step( abs( Color_4.a - Color0.a ), 0.05 ) );
// // 	Color_5.a = lerp( Color0.a, Color1.a, step( abs( Color_5.a - Color0.a ), 0.05 ) );
// // 	Color_6.a = lerp( Color0.a, Color1.a, step( abs( Color_6.a - Color0.a ), 0.05 ) );
// 	Color_3.a = Color0.a;
// 	Color_4.a = Color0.a;
// 	Color_5.a = Color0.a;
// 	Color_6.a = Color0.a;


		// Limit gaussian on alpha
	Color4.a = Color5.a = Color6.a = Color0.a;
	Color_4.a = Color_5.a = Color_6.a = Color0.a;


 	Result += Color0 * Weights0.x;

 	Result += Color1 * Weights0.y;
 	Result += Color2 * Weights0.z;
 	Result += Color3 * Weights0.w;
 	Result += Color4 * Weights1.x;
 	Result += Color5 * Weights1.y;
 	Result += Color6 * Weights1.z;

 	Result += Color_1 * Weights0.y;
 	Result += Color_2 * Weights0.z;
 	Result += Color_3 * Weights0.w;
 	Result += Color_4 * Weights1.x;
 	Result += Color_5 * Weights1.y;
 	Result += Color_6 * Weights1.z;

 	return	Result;
}
