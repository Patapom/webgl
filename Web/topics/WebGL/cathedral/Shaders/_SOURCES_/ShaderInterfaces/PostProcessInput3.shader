// This declares the fourth input of a post-process shader
//

sampler2D	ImageInput3;
float4		ImageInputTexCoords3;		// XY = The texture coordinates within the image, Z = The texture size (square), W = 1 / Texture size

float4		SampleInputTexture3( float2 _UV )
{
	return	tex2D( ImageInput3, _UV * ImageInputTexCoords3.xy );
}
