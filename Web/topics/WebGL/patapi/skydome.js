/// This file hosts an adaptation of the article "A Practical Analytic Model for Daylight" by Preetham et al.
/// It has been stripped of the actual skydome computation just to keep the sky SH coefficients needed by the cathedral
/// 
/// Phi is the azimuth and Theta is the elevation where 0 is the dome's zenith.
/// 
/// The convention for transformation between spherical and cartesian coordinates should be chosen to be the same
///	as for Spherical Harmonics (cf. SphericalHarmonics.SHFunctions) :
///
///		_ Azimuth Phi is zero on +Z and increases CW (i.e. PI/2 at -X, PI at -Z and 3PI/2 at +X)
///		_ Elevation Theta is zero on +Y and PI on -Y
/// 
/// 
///                     Y Theta=0
///                     |
///                     |
///                     |
///  Phi=PI/2 -X........o------+X Phi=3PI/2
///                    /
///                   / 
///                 +Z Phi=0
/// 
/// 
/// Here is the sample conversion from spherical to cartesian coordinates :
///		X = Sin( Theta ) * Sin( -Phi )
///		Y = Cos( Theta )
///		Z = Sin( Theta ) * Cos( -Phi )
/// 
/// So cartesian to polar coordinates is computed this way:
///		Theta = acos( Y );
///		Phi = -atan2( X, Z );
/// 
///
o3djs.provide( 'patapi.skydome' );

o3djs.require( 'patapi' );
o3djs.require( 'patapi.math' )
o3djs.require( 'patapi.skydome_SHCoefficients' )

////////////////////////////////////////////////////////////////////////////
// Declares a class holding informations on the skydome
// The skydome parameters are SunDirection and Turbidity
//
//	opt_SunDirection, the optional vector pointing toward the Sun
//	opt_Turbidity, the optional atmospheric turbidity (amount of pollution in the air)
//
patapi.SkyDome = function( opt_SunDirection, opt_Turbidity, opt_UpdateCallback )
{
	this.setSunDirection( opt_SunDirection ? opt_SunDirection : vec3.one() );
	this.m_Turbidity = opt_Turbidity ? opt_Turbidity : 4.0;
	this.m_GlobalLuminanceFactor = 1.0;
	this.m_SunColor = vec3.zero();
};

patapi.SkyDome.prototype = 
{
	Destroy : function()
	{

	},

	// Gets or sets the sun direction
	getSunDirection : function()			{ return this.m_SunDirection; },
	setSunDirection : function( value )
	{
		if ( !value )
			value = vec3.one();	// Prevent stupid assignment

		this.m_SunDirection = value.normalize();
	},

	// Gets or sets the atmospheric turbidity
	getTurbidity : function()				{ return this.m_Turbidity; },
	setTurbidity : function( value )
	{
		this.m_Turbidity = value;
	},

	// Gets or sets the global luminance factor that will be applied to Sun & Sky & SH coefficients
	getGlobalLuminanceFactor : function()			{ return this.m_GlobalLuminanceFactor; },
	setGlobalLuminanceFactor : function( value )
	{
		this.m_GlobalLuminanceFactor = value;
	},

	// Gets the sun color (updated by the ComputeSkySHCoefficients() function)
	getSunColor : function()			{ return this.m_SunColor; },

	// Update all the global sky values used by later computations
	//
	UpdateSkyValues : function()
	{
		var	BELOW_HORIZON_ANGLE = 1.7308109;

		var	SunCosTheta = Math.max( Math.cos( BELOW_HORIZON_ANGLE ), this.m_SunDirection.y );	// Here, we clamp the Sun's elevation so we can't reach "underground" sky values which are buggy (out of sampling range)
		var	SunTheta = Math.acos( SunCosTheta );

		var	Turbidity = Math.max( 2.0, this.m_Turbidity );

		////////////////////////////////////////////////////////////////////////////
		// Compute the Perez functions' coefficients
		this.Coefficients_x = [	-0.0193 * Turbidity - 0.2592,
								-0.0665 * Turbidity + 0.0008,
								-0.0004 * Turbidity + 0.2125,
								-0.0641 * Turbidity - 0.8989,
								-0.0033 * Turbidity + 0.0452 ];
		this.Coefficients_y = [	-0.0167 * Turbidity - 0.2608,
								-0.0950 * Turbidity + 0.0092,
								-0.0079 * Turbidity + 0.2102,
								-0.0441 * Turbidity - 1.6537,
								-0.0109 * Turbidity + 0.0529 ];
		this.Coefficients_Y = [	+0.1787 * Turbidity - 1.4630,
								-0.3554 * Turbidity + 0.4275,
								-0.0227 * Turbidity + 5.3251,
								+0.1206 * Turbidity - 2.5771,
								-0.0670 * Turbidity + 0.3703 ];

		var	SKY_ZENITH_x = [[ +0.00165, -0.00374,  0.00208,  0.00000 ],
							[ -0.02902,  0.06377, -0.03202,  0.00394 ],
							[ +0.11693, -0.21196,  0.06052,  0.25885 ]];

		var	SKY_ZENITH_y = [[ +0.00275, -0.00610,  0.00316,  0.00000 ],
							[ -0.04214,  0.08970, -0.04153,  0.00515 ],
							[ +0.15346, -0.26756,  0.06669,  0.26688 ]];

		////////////////////////////////////////////////////////////////////////////
		// Compute the sky's zenith values
		var	Chi = (4.0 / 9.0 - Turbidity / 120.0) * (Math.PI - 2.0 * SunTheta);
		var	ZenithConstants = [				( (SKY_ZENITH_x[2][3] + SunTheta * (SKY_ZENITH_x[2][2] + SunTheta * (SKY_ZENITH_x[2][1] + SunTheta * SKY_ZENITH_x[2][0]))) +
								Turbidity *	( (SKY_ZENITH_x[1][3] + SunTheta * (SKY_ZENITH_x[1][2] + SunTheta * (SKY_ZENITH_x[1][1] + SunTheta * SKY_ZENITH_x[1][0]))) +
								Turbidity *	  (SKY_ZENITH_x[0][3] + SunTheta * (SKY_ZENITH_x[0][2] + SunTheta * (SKY_ZENITH_x[0][1] + SunTheta * SKY_ZENITH_x[0][0]))) ) ),

											( (SKY_ZENITH_y[2][3] + SunTheta * (SKY_ZENITH_y[2][2] + SunTheta * (SKY_ZENITH_y[2][1] + SunTheta * SKY_ZENITH_y[2][0]))) +
								Turbidity *	( (SKY_ZENITH_y[1][3] + SunTheta * (SKY_ZENITH_y[1][2] + SunTheta * (SKY_ZENITH_y[1][1] + SunTheta * SKY_ZENITH_y[1][0]))) +
								Turbidity *	  (SKY_ZENITH_y[0][3] + SunTheta * (SKY_ZENITH_y[0][2] + SunTheta * (SKY_ZENITH_y[0][1] + SunTheta * SKY_ZENITH_y[0][0]))) ) ),

								1000.0 * ((4.0453 * Turbidity - 4.9710) * Math.tan( Chi ) - 0.2155 * Turbidity + 2.4192)	// in cd/m²
							];

		////////////////////////////////////////////////////////////////////////////
		// Compute zenith Perez values
		this.Zenith = [	ZenithConstants[0] / this.Perez_( this.Coefficients_x, 0.0, SunTheta ),
						ZenithConstants[1] / this.Perez_( this.Coefficients_y, 0.0, SunTheta ),
						ZenithConstants[2] / this.Perez_( this.Coefficients_Y, 0.0, SunTheta )
					 ];
	},

	////////////////////////////////////////////////////////////////////////////
	// Compute sky color in the specified direction
	ComputeSkyColor : function( _Direction )
	{
		var	fTheta = Math.acos( _Direction.y );
		var	fGamma = Math.acos( Math.min( 1.0, _Direction.dot( this.m_SunDirection ) ) );

		var	SkyColorxyY = [	this.Perez_( this.Coefficients_x, fTheta, fGamma ) * this.Zenith[0],
							this.Perez_( this.Coefficients_y, fTheta, fGamma ) * this.Zenith[1],
							this.Perez_( this.Coefficients_Y, fTheta, fGamma ) * this.Zenith[2] ];


		SkyColorxyY[2] *= this.m_GlobalLuminanceFactor;	// Scale luminance !
		

		var XYZ_TO_RGB		= [ [  3.240790, -0.969256,  0.055648 ],
								[ -1.537150,  1.875992, -0.204043 ],
								[ -0.498535,  0.041556,  1.057311 ] ];
			
		var	SkyColorXYZ = [	SkyColorxyY[0] * SkyColorxyY[2] / SkyColorxyY[1],
							SkyColorxyY[2],
							(1.0 - SkyColorxyY[0] - SkyColorxyY[1]) * SkyColorxyY[2] / SkyColorxyY[1] ];

		var SkyColorRGB = new vec3(
			SkyColorXYZ[0] * XYZ_TO_RGB[0][0] + SkyColorXYZ[1] * XYZ_TO_RGB[1][0] + SkyColorXYZ[2] * XYZ_TO_RGB[2][0],
			SkyColorXYZ[0] * XYZ_TO_RGB[0][1] + SkyColorXYZ[1] * XYZ_TO_RGB[1][1] + SkyColorXYZ[2] * XYZ_TO_RGB[2][1],
			SkyColorXYZ[0] * XYZ_TO_RGB[0][2] + SkyColorXYZ[1] * XYZ_TO_RGB[1][2] + SkyColorXYZ[2] * XYZ_TO_RGB[2][2]
		);

		return	SkyColorRGB;
	},

	// The monochromatic Perez function modeling sky appearance using a single parameter : Turbidity
	// \param the 5 coefficients for the Perez function
	// \param the polar angle for the Sun
	// \param the phase angle between Sun direction and view direction
	// \return the result of the Perez function
	//
	Perez_ : function( _Coefficients, _Theta, _Phase )
	{
		// Horizon is a singularity... Make sure we're always a bit above it...
		_Theta = Math.min( 0.5 * Math.PI - 0.00001, _Theta );

		var		fCosGamma = Math.cos( _Phase );
		return	(1.0 + _Coefficients[0] * Math.exp( _Coefficients[1] / Math.cos( _Theta ) )) *
				(1.0 + _Coefficients[2] * Math.exp( _Coefficients[3] * _Phase ) + _Coefficients[4] * fCosGamma * fCosGamma);
	},

	////////////////////////////////////////////////////////////////////////////
	// Compute SH coefficients for the first 3 bands (i.e. an array of 9 RGB vectors)
	// Code borrowed from http://www.cg.tuwien.ac.at/research/publications/2008/Habel_08_SSH/
	//
	ComputeSkySHCoefficients : function()
	{
		// Clamp eleveation because we get an ugly blue color for values above that threshold...
		var	ClampedElevation = Math.min( 0.6, this.m_SunDirection.y );

		var	_SunTheta = Math.acos( ClampedElevation );
		var	_SunPhi = 0.5 * Math.PI - Math.atan2( this.m_SunDirection.z, this.m_SunDirection.x );
		var	_Turbidity = Math.clamp( this.m_Turbidity, 5.0, 7.0 );		// After testing, using a turbidity out of that range yields too strange results

		var	fTheta = Math.min( 0.45 * Math.PI, _SunTheta );

		var	SHCoefficients = new Array( 3 * 3 );	// An array of 9 SH Coefficients (the first 3 bands)
		for ( var i=0; i < SHCoefficients.length; i++ )
			SHCoefficients[i] = [0, 0, 0];

 		// Generate the parameter matrix
		var	Matrix = new Array( 14 );//[14,8];
		for ( var i=0; i < 14; i++ )
			Matrix[i] = new Array( 8 );

		var	ThetaPow = new Array( 14 );
		var	TurbidityPow = new Array( 8 );

		ThetaPow[0] = Matrix[0][0] = 1.0;
		ThetaPow[1] = Matrix[1][0] = fTheta;
		for ( var i=2; i < 14; ++i )
		{
			ThetaPow[i] = ThetaPow[i-1] * fTheta;
			Matrix[i][0] = ThetaPow[i];
		}

		TurbidityPow[0] = 1.0;
		TurbidityPow[1] = Matrix[0][1] = _Turbidity;
		for ( var j=2; j < 8; ++j )
		{
			TurbidityPow[j] = TurbidityPow[j-1] * _Turbidity;
			Matrix[0][j] = TurbidityPow[j];
		}

		for ( var i=0; i < 14; ++i )
			for ( var j = 0; j < 8; ++j )
				Matrix[i][j] = ThetaPow[i] * TurbidityPow[j];

		// Execute coefficient multiplication for each coefficient
		for ( var l=0; l < 3; ++l )
			for ( var m=-l; m <= l ; ++m )
			{
				var bandindex = l+m;

				var	cr = 0, cg = 0, cb = 0;
				
				for ( var i=0; i < 14; ++i )
					for ( var j=0; j < 8; ++j )
					{
						cr += Matrix[i][j] * patapi.Skydome_Internal_GetSHBand( l )[bandindex][i][j][0];
						cg += Matrix[i][j] * patapi.Skydome_Internal_GetSHBand( l )[bandindex][i][j][1];
						cb += Matrix[i][j] * patapi.Skydome_Internal_GetSHBand( l )[bandindex][i][j][2];
					}

				var	k = l*(l+1) + m;

				SHCoefficients[k][0] = cr;
				SHCoefficients[k][1] = cg;
				SHCoefficients[k][2] = cb;
			}

		for ( var l=0; l < 3; ++l )
			for ( var m=1; m <= l; ++m )
			{
				var k_m = l*(l+1) + m;
				var k_minus_m = l*(l+1) - m;

				var	c_m_r = SHCoefficients[k_m][0];
				var	c_m_g = SHCoefficients[k_m][1];
				var	c_m_b = SHCoefficients[k_m][2];

				var	c_minus_m_r = SHCoefficients[k_minus_m][0];
				var	c_minus_m_g = SHCoefficients[k_minus_m][1];
				var	c_minus_m_b = SHCoefficients[k_minus_m][2];
					
				var	tcos = Math.cos( m * _SunPhi );
				var	tsin = Math.sin( m * _SunPhi );

				SHCoefficients[k_m][0] = c_m_r*tcos - c_minus_m_r*tsin;
				SHCoefficients[k_m][1] = c_m_g*tcos - c_minus_m_g*tsin;
				SHCoefficients[k_m][2] = c_m_b*tcos - c_minus_m_b*tsin;
					
				SHCoefficients[k_minus_m][0] = c_minus_m_r*tcos + c_m_r*tsin;
				SHCoefficients[k_minus_m][1] = c_minus_m_g*tcos + c_m_g*tsin;
				SHCoefficients[k_minus_m][2] = c_minus_m_b*tcos + c_m_b*tsin;
			}

		// Gibbs suppression (avoids ringing)
		for ( var l=1; l < 3; ++l )
		{
			var	k = l*(l+1);
			var	fAngle = Math.PI * l / 3;
			var	fFactor = Math.sin( fAngle ) / fAngle;

			SHCoefficients[k][0] *= fFactor;
			SHCoefficients[k][1] *= fFactor;
			SHCoefficients[k][2] *= fFactor;
		}

		// Apply scale
		for ( var i=0; i < 9; i++ )
		{
			SHCoefficients[i][0] *= this.m_GlobalLuminanceFactor;
			SHCoefficients[i][1] *= this.m_GlobalLuminanceFactor;
			SHCoefficients[i][2] *= this.m_GlobalLuminanceFactor;
		}

		return	SHCoefficients;
	},
};
