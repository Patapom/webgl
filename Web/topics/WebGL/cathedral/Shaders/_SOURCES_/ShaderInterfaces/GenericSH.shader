// This is the interface for shaders wishing to use 2 bands of SH Coefficients encoding the environment lighting
//
// #interface "Generic SH"
//
float4		SH_Red;		// The 4 spherical harmonics coefficients encoding the environment's luminance
float4		SH_Green;
float4		SH_Blue;


// Function that rotates 2 Zonal Harmonic coefficients into an arbitrary direction provided by a normalized vector
//
half4	SHRotate( const in half3 _Direction, const in half2 _ZonalHarmonicCoefficients )
{
	// Compute sine & cosine of theta angle
	half2	Phi_SinCos = normalize( _Direction.xz );

	// Compute sine & cosine of phi angle
	half2	Theta_SinCos;
			Theta_SinCos.x = sqrt( 1.0h - _Direction.y * _Direction.y );	// Sin
			Theta_SinCos.y = _Direction.y;									// Cos

	// Compute result
	half4	Result;
			// The first band is rotation-independent
			Result.x = _ZonalHarmonicCoefficients.x;
			// Second band
			Result.y = -_ZonalHarmonicCoefficients.y * Theta_SinCos.x * Phi_SinCos.x;
			Result.z = -_ZonalHarmonicCoefficients.y * Theta_SinCos.y;
			Result.w = -_ZonalHarmonicCoefficients.y * Theta_SinCos.x * Phi_SinCos.y;

	return	Result;
}

// Function that generates 4 Spherical Harmonic coefficients for a cosine lobe rotated toward the provided direction
//
half4	SHComputeCosineLobe( const in half3 _Direction )
{
	static const half2	CosineLobeCoefficients = half2( 0.25h, 0.5h );
	return	SHRotate( _Direction, CosineLobeCoefficients );
}

// Function that generates 4 Spherical Harmonic coefficients for a cone projector rotated toward the provided direction
//
half4	SHComputeCone( const in half3 _Direction, uniform half _ConeAngle )
{
	static const half2	ConeCoefficients = half2(	0.5h * (1.0h - cos( _ConeAngle )),
													0.75h * sin( _ConeAngle ) * sin( _ConeAngle )
												);

	return	SHRotate( _Direction, ConeCoefficients );
}

