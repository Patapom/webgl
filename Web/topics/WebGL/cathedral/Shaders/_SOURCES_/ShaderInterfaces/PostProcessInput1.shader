// This declares the second input of a post-process shader
//

sampler2D	ImageInput1;
float4		ImageInputTexCoords1;		// XY = The texture coordinates within the image, Z = The texture size (square), W = 1 / Texture size

float4		SampleInputTexture1( float2 _UV )
{
	return	tex2D( ImageInput1, _UV * ImageInputTexCoords1.xy );
}
