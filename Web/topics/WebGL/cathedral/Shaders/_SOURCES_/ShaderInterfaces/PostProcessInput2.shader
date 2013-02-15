// This declares the third input of a post-process shader
//

sampler2D	ImageInput2;
float4		ImageInputTexCoords2;		// XY = The texture coordinates within the image, Z = The texture size (square), W = 1 / Texture size

float4		SampleInputTexture2( float2 _UV )
{
	return	tex2D( ImageInput2, _UV * ImageInputTexCoords2.xy );
}
