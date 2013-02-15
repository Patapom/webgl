// This declares a generic input sampler for a post-process shader
//



// Samples an input texture that was previously rendered by a render to texture operation
//
// As O3D restricts render target textures to power of 2 textures, only a subset of the
//	entire texture was rendered to and so we need to specify the texture coordinates of
//	the lower-right corner of that rendered image.
//
//
// Example: If you have the following sampler & texture coords data declared
//
//	sampler2D	InputImage;
//	float4		InputImageTexCoords;					// XY = The texture coordinates within the image
//
// then call the function like this :
//
//	SampleInputTexture( InputImage, InputImageTexCoords, SomeUVs )
//
//
float4		SampleInputTexture( sampler2D _Sampler, const float4 _ImageTexCoords, float2 _UV )
{
	float2	UV = _UV * _ImageTexCoords.xy;

	return	tex2D( _Sampler, UV );
}
