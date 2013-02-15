// This is the interface to spot lights
//
// #interface "Spot Light"
//
float3		LightWorldDirection;	// Vector pointing TOWARD the light
float3		LightWorldPosition;
float4		LightColor;

float3		RangeData;				// X= RangeMin (The range at which the light's power starts to decrease)
									// Y= RangeMax (The range at which the light's power is 0)
									// Z= RangePower (The power at which range is decreasing (<1 is rapidly, >1 is slowly))

float3		AngleData;				// X= CosAngleMin (The cos(angle/2) at which the light's power starts to decrease)
									// Y= CosAngleMax (The cos(angle/2) at which the light's power is 0)
									// Z= AngleAttenuationPower (The power at which angle is decreasing (<1 is rapidly, >1 is slowly))


////////////////////////////////////////////////////////////////
// Function declaration for Spotlight attenuation
//

// _Position, the world position to light with the spot
// Returns the spot attenuation to multiply the light color with and use in the lighting equation
// NOTE: This is ONE possible implementation of a spotlight, it's not "THE SPOTLIGHT CODE" ! :)
// 
float ComputeSpotAttenuation( float3 _Position )
{
	float3	ToPixel = _Position - LightWorldPosition;
	float	fDistance = length( ToPixel );				// This also gives us the distance of the pixel from the spotlight
			ToPixel /= fDistance;						// Normalize

	float	fRangeAttenuation = saturate( (RangeData.y - fDistance) / (RangeData.y - RangeData.x) );
	float	fAngularAttenuation = saturate( (dot( ToPixel, LightWorldDirection ) - AngleData.y) / (AngleData.x - AngleData.y) );
	
	return pow( fRangeAttenuation, RangeData.z ) * pow( fAngularAttenuation, AngleData.z );
}
