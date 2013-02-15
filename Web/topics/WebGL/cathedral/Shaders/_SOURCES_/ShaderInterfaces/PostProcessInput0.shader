// This declares the first input of a post-process shader
//

sampler2D	ImageInput0;
float4		ImageInputTexCoords0;		// XY = The texture coordinates within the image, Z = The texture size (square), W = 1 / Texture size

float4		SampleInputTexture0( float2 _UV )
{
	return	tex2D( ImageInput0, _UV * ImageInputTexCoords0.xy );
}
