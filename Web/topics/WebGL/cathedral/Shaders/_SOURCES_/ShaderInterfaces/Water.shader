// This is the interface for standard water
//
// #interface "Water"
//
float3		WaterTransportColor;		// The internal color of water (= 1 - actual perceived color)
float4		WaterCoefficients;			// X=Absorption coefficient, Y=Scattering coefficient, Z=Scattering anisotropy, W=?

sampler2D	WaterNormalLF;				// Low frequency normal map
sampler2D	WaterNormalHF;				// High frequency normal map

float4		NormalScrollingVelocity;	// The scrolling velocity of the normal map (XY=LoFreq, ZW=HiFreq)


const static float	WATER_REFRACTION_INDEX = 1.33;
const static float2	WATER_TRANSPARENCY = float2( 0, 1 );	// Min / Max


// Computes the water deformation (used by a vertex shader to deform its vertex position)
//	_UV, an UV set (e.g. WorldPosition.xz)
//	_Time, the time at which one is sampling the normal
//
// Returns a unit 3D vector to add to a vertex to make it move
//
float3	ComputeWaterVertexOffset( float2 _UV, float _Time )
{
	float2	UV_LF = _UV + 1.0 * NormalScrollingVelocity.xy * _Time;
	float2	UV_MF = _UV + 2.5 * NormalScrollingVelocity.xy * _Time;
	float2	UV_HF = _UV * 4 * NormalScrollingVelocity.zw * _Time;

	float	AngularVelocity = 2 * 3.14159263535;

	float2	Direction0 = normalize( float2( 1, 1 ) );
	float2	Direction1 = normalize( float2( -1, 1 ) );
	float2	Direction2 = normalize( float2( 10, 1 ) );

	float	Height  = cos( AngularVelocity * dot( Direction0, UV_LF ) );
			Height *= cos( AngularVelocity * dot( Direction1, UV_MF ) );
			Height *= cos( AngularVelocity * dot( Direction1, UV_HF ) );

	return	float3( 0, Height, 0 );
}

// Computes the water normal
//	_UV, an UV set (e.g. WorldPosition.xz)
//	_Time, the time at which one is sampling the normal
//	_OriginalNormal, the original water surface normal (can be different than [0,1,0] to support arbitrary orientations)
//
float3	ComputeWaterNormal( float2 _UV, float _Time, float3 _OriginalNormal )
{
	float2	UV_LF = _UV + 0.1 * NormalScrollingVelocity.xy * _Time;
	float2	UV_MF = 1.5 * _UV + 0.5 * NormalScrollingVelocity.xy * _Time;
	float2	UV_HF = 4 * _UV + NormalScrollingVelocity.zw * _Time;

	float3	NormalLF = 10 * 2 * tex2D( WaterNormalLF, UV_LF ).xzy - 10 * 1;
	float3	NormalMF =  5 * 2 * tex2D( WaterNormalLF, UV_MF ).xzy -  5 * 1;
	float3	NormalHF =  1 * 2 * tex2D( WaterNormalHF, UV_HF ).xzy -  1 * 1;

	return	normalize( NormalLF + NormalMF + NormalHF );
}

// Computes the transparency of water given the view vector (pointing FROM the camera) and the water surface normal
// Returns a value in [0,1] that can be used like this :
//
//	FinalColor = lerp( ReflectedColor, RefractedColor, Transparency );
//
float	ComputeWaterTransparencyAbove( float3 _View, float3 _Normal )
{
//	float	IBrewsterAngle = 1.0 / cos( atan( WATER_REFRACTION_INDEX ) );	// Angle of total internal reflection
	float	IBrewsterAngle = 1.6640012019226428431372058198437;	// One over Angle of total internal reflection

	float	CosIncidence = abs( dot( _View, _Normal ) );
//	float	Transparency = lerp( WATER_TRANSPARENCY.x, WATER_TRANSPARENCY.y, saturate( (1.0 - CosIncidence) * IBrewsterAngle ) );
	float	Transparency = saturate( (1.0 - CosIncidence) * IBrewsterAngle );

	return	Transparency;
}

// Computes the transparency of water given the view vector (pointing FROM the camera) and the water surface normal
// Returns a value in [0,1] that can be used like this :
//
//	FinalColor = lerp( ReflectedColor, RefractedColor, Transparency );
//
float	ComputeWaterTransparencyUnder( float3 _View, float3 _Normal )
{
//	float	IBrewsterAngle = 1.0 / cos( atan( 1.0 / WATER_REFRACTION_INDEX ) );	// Angle of total internal reflection
	float	IBrewsterAngle = 1.2511287232501074008550419698079;	// Angle of total internal reflection

	float	CosIncidence = abs( dot( _View, _Normal ) );
//	float	Transparency = lerp( WATER_TRANSPARENCY.x, WATER_TRANSPARENCY.y, saturate( (1.0 - CosIncidence) * IBrewsterAngle ) );
	float	Transparency = saturate( (1.0 - CosIncidence) * IBrewsterAngle );

	return	Transparency;
}


// Computes the color of the water, assuming the camera is standing above the water plane (height = 0)
//	_View, the view ray
//	_LightDirection, the light's direction (WORLD)
//	_LightColor, the color of the light
//	_BackgroundColor, the color at the end of the view ray
//	_Length, the length of the ray under water
//
float3	ComputeWaterColorAbove( float3 _View, float3 _LightDirection, float3 _LightColor, float3 _BackgroundColor, float _Length )
{
	// Compute RGB extinction coefficient
	float3	SigmaExtinction = WaterTransportColor * (WaterCoefficients.x + WaterCoefficients.y);	// Extinction = absorption + scattering
	float3	SigmaScattering = WaterTransportColor * WaterCoefficients.y;

	// Scale the extinction by the magic coefficient
	SigmaExtinction *= 1 - _View.y / max( 0.1, _LightDirection.y );

	// Compute the phase between camera and light using Heynyey-Greenstein formula
 	float	OneOver4PI = 0.079577471545947667884441881686257;
 
 	float	CosTheta = dot( _View, _LightDirection );
 	float	Den = 1 + WaterCoefficients.z * WaterCoefficients.z - 2 * WaterCoefficients.z * CosTheta;
 			Den = sqrt( Den * Den * Den );
 
 	float	Phase = OneOver4PI * (1 - WaterCoefficients.z) * (1 - WaterCoefficients.z) / Den;

	// Compute extinction along the ray
	float3	ExtinctionFactor = exp( -SigmaExtinction * _Length );

	// Compute final color:
	//
	// Color = BackgroundColor * exp( -SigmaExtinction * Distance_along_ray )						<== Attenuated back color * Extinction along the ray
	//		 + SunColor * Distance_along_ray * SigmaScattering * Phase( View, Sun )					<== Sun factors that are constant along the ray
	//		 * [1 - exp( -SigmaExtinction * Distance_along_ray )] / SigmaExtinction					<== Integral of the in-scattered energy along the ray
	//
	float3	Color = _BackgroundColor * ExtinctionFactor
				  + _LightColor * _Length * SigmaScattering / SigmaExtinction * Phase * (1 - ExtinctionFactor);

	return	Color;
}

// Computes the color of the water, assuming the camera is standing under the water plane (height = 0)
//	_Position, the start position of the ray
//	_View, the view ray
//	_LightDirection, the vector pointing toward the light (WORLD)
//	_LightColor, the color of the light
//	_BackgroundColor, the color at the end of the view ray
//	_Length, the length of the ray under water before hitting the background object
//
float3	ComputeWaterColorUnder( float3 _Position, float3 _View, float3 _LightDirection, float3 _LightColor, float3 _BackgroundColor, float _Length )
{
	// Clamp length to prevent getting out of water
	float	IView = 1.0 / max( 0.0001, _View.y );
	_Length = min( _Length, -_Position.y * IView );

	// Compute end position
	float3	EndPosition = _Position + _View * _Length;

	// Compute RGB extinction coefficient
	float3	SigmaExtinction = WaterTransportColor * (WaterCoefficients.x + WaterCoefficients.y);	// Extinction = absorption + scattering
	float3	SigmaScattering = WaterTransportColor * WaterCoefficients.y;

	// Compute the lengths the sun has to walk through water at both start and end point
	float	ICosSunAngle = 1.0 / max( 0.0001, _LightDirection.y );
	float	d0 = -EndPosition.y * ICosSunAngle;		// Length the sun has to walk to reach end point
	float	d1 = -_Position.y * ICosSunAngle;		// Length the sun has to walk to reach start point

	// Compute start and end extinctions, as well as extinction along the ray
	float3	ExtinctionFactorStart = exp( -SigmaExtinction * d0 );
	float3	ExtinctionFactorEnd = exp( -SigmaExtinction * d1 );
	float3	ExtinctionFactorRay = exp( -SigmaExtinction * _Length );

	// Given the background color, we assume it has been computed without taking the water into account
	// Since usually the lighting equation for standard objects is simply  Color = LightColor * dot( Normal, LightDirection )
	//	it's easy to attenuate the object's color by multiplying it by the extinction the LightColor should
	//	have sustained while underwater, that is : exp( -SigmaExtinction * start_distance )
	//
	_BackgroundColor *= ExtinctionFactorStart;

	// Compute the phase between camera and light using Heynyey-Greenstein formula
	float	OneOver4PI = 0.079577471545947667884441881686257;

	float	CosTheta = dot( _View, _LightDirection );
	float	Den = 1 + WaterCoefficients.z * WaterCoefficients.z - 2 * WaterCoefficients.z * CosTheta;
			Den = sqrt( Den * Den * Den );

	float	Phase = OneOver4PI * (1 - WaterCoefficients.z) * (1 - WaterCoefficients.z) / Den;

	// Compute final color:
	//
	// Color = BackgroundColor * exp( -SigmaExtinction * Distance_along_ray )																	<== Attenuated back color * Extinction along the ray
	//		 + SunColor * Distance_along_ray * SigmaScattering * Phase( View, Sun )																<== Sun factors that are constant along the ray
	//		 * [exp( -SigmaExtinction * start_distance ) - exp( -SigmaExtinction * (Distance_along_ray + end_distance) )] / SigmaExtinction		<== Integral of the in-scattered energy along the ray
	//
	float3	Color = _BackgroundColor * ExtinctionFactorRay
//				  + _LightColor * _Length * SigmaScattering / SigmaExtinction * Phase
				  + _LightColor * SigmaScattering / SigmaExtinction * Phase
//				  * (ExtinctionFactorStart - ExtinctionFactorEnd * ExtinctionFactorRay);
				  * (1 - ExtinctionFactorRay);

	// This formula seems to work better with absorption = 4 and scattering = 0.1
	// It gives a clear blue background which is quite realistic, I can't understand why the scattering has to burn that much though... I prefer the other formula despite its darkness, it looks like more "submarine" to me :)
// 	float3	Color = _BackgroundColor * ExtinctionFactorRay;
// 				  + _LightColor * _Length * SigmaScattering / SigmaExtinction * Phase
// 				  * (ExtinctionFactorStart - ExtinctionFactorEnd * ExtinctionFactorRay);


//	Color = _BackgroundColor * ExtinctionFactorRay;
//	Color = _LightColor * Phase;

	return	Color;
}