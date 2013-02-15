// #o3d VertexShaderEntryPoint VS
// #o3d PixelShaderEntryPoint PS
// #o3d MatrixLoadOrder RowMajor

static const float3	LUMINANCE_DOT = { 0.2125f, 0.7154f, 0.0721f };

float4x4	worldViewProj : WorldViewProjection;

sampler2D	image;
float4		imageTexCoords;	// XY = The texture coordinates within the image, ZW = 1 / Texture size

float		LuminanceThreshold;

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

// Computes the luminance of a color above a given threshold and scales it back in [0,1]
// 
float3	ComputeLuminance( const float3 _Color, const float _Threshold )
{
	float	Lum = dot( _Color, LUMINANCE_DOT );		// [0..1]
			Lum = max( 0, Lum - _Threshold );		// [0..1.0 - threshold]
			Lum = Lum / (1.001f - _Threshold);		// [0..1]

	return	_Color * Lum;
}

// Averages 4 pixel luminances together
//
float4 PS( PixelShaderInput _Input ) : COLOR
{
	float	Threshold = LuminanceThreshold;

	float4	Color00 = SampleInputTexture( image, imageTexCoords, _Input.UV + float2( -1, 0 ) * imageTexCoords.zw );
	float4	Color01 = SampleInputTexture( image, imageTexCoords, _Input.UV + float2( +1, 0 ) * imageTexCoords.zw );
	float4	Color10 = SampleInputTexture( image, imageTexCoords, _Input.UV + float2( 0, -1 ) * imageTexCoords.zw );
	float4	Color11 = SampleInputTexture( image, imageTexCoords, _Input.UV + float2( 0, +1 ) * imageTexCoords.zw );

 	float3	Result  = ComputeLuminance( Color00.rgb, Threshold );
 			Result += ComputeLuminance( Color01.rgb, Threshold );
 			Result += ComputeLuminance( Color10.rgb, Threshold );
 			Result += ComputeLuminance( Color11.rgb, Threshold );

	// Bilateral filtering
	Color01.a = lerp( Color00.a, Color01.a, step( abs( Color01.a - Color00.a ), 0.05 ) );
	Color10.a = lerp( Color00.a, Color10.a, step( abs( Color10.a - Color00.a ), 0.05 ) );
	Color11.a = lerp( Color00.a, Color11.a, step( abs( Color11.a - Color00.a ), 0.05 ) );

	return	float4( 0.25 * Result, 0.25 * (Color00.a + Color01.a + Color10.a + Color11.a) );
}
