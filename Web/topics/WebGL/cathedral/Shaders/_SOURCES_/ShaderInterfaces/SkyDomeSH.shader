// This is the interface for shaders wishing to use the skydome's SH coefficients
//
// #interface "SkyDome SH"
//
float3		SkyAmbientSH0;	// The 9 spherical harmonics coefficients encoding the skydome's luminance
float3		SkyAmbientSH1;
float3		SkyAmbientSH2;
float3		SkyAmbientSH3;
float3		SkyAmbientSH4;
float3		SkyAmbientSH5;
float3		SkyAmbientSH6;
float3		SkyAmbientSH7;
float3		SkyAmbientSH8;

// Function that computes the color of the skydome given a world direction
//
// SH Coefficients up to order 2 are devised analytically using the formulas given
//	by Ramamoorthi & Hanrahan in http://www-graphics.stanford.edu/papers/envmap/
//
float3	ComputeSkyDomeColorFromSH( float3 _WorldDirection )
{
 	_WorldDirection.y = max( 0, _WorldDirection.y );
// 	_WorldDirection = normalize( _WorldDirection );

	// Retrieve the SH coefficients for the provided direction
	float	x = _WorldDirection.x;
	float	y = _WorldDirection.y;
	float	z = -_WorldDirection.z;


	float	CoeffAmbient =		0.282095f;					// Y00
	float4	Coeffs0 = float4(	0.488603f * z,				// Y1-1
								0.488603f * y,				// Y10
								0.488603f * x,				// Y1+1
								1.092548f * x * z );		// Y2-2
	float4	Coeffs1 = float4(	1.092548f * y * z,			// Y2-1
								0.315392f * (3*y*y - 1),	// Y20
								1.092548f * x * y,			// Y2+1
								0.546274f * (x*x - z*z) );	// Y2+2

	// Dot with the SH coefficients that were uploaded for us
	float3	Result = CoeffAmbient * SkyAmbientSH0;
			Result += Coeffs0.x * SkyAmbientSH1;
			Result += Coeffs0.y * SkyAmbientSH2;
			Result += Coeffs0.z * SkyAmbientSH3;
			Result += Coeffs0.w * SkyAmbientSH4;
			Result += Coeffs1.x * SkyAmbientSH5;
			Result += Coeffs1.y * SkyAmbientSH6;
			Result += Coeffs1.z * SkyAmbientSH7;
			Result += Coeffs1.w * SkyAmbientSH8;
	
	return	Result;
}
