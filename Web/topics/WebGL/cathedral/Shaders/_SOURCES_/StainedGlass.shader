// Compulsory lines for entry points
// #o3d VertexShaderEntryPoint VS
// #o3d PixelShaderEntryPoint PS
// #o3d MatrixLoadOrder RowMajor

// This shader uses the following inputs:
//	Position, Normal, UV Set0
//
// If applies emissive lighting as if the material was lit from behind
//

////////////////////////////////////////////////////////////////
// CONSTANTS
//


	// In-Scattering
static const float	SCATTERING_COEFFICIENT	= 0.02;				// [0,+oo[ The scattering coefficient (i.e. "amount of scattering" per unit length)
static const float	SCATTERING_ANISOTROPY	= 0.5;				// ]-1,+1[ The prefered direction of scattering (e.g. -1 is backward, 0 is isotropic and +1 is forward)

	// COLOR MULTIPLIER
static const float	COLOR_MULTIPLIER		= 5.0;				// [0,+oo[ The multiplier to apply to the emissive texture colors



////////////////////////////////////////////////////////////////
// SAS

float4x4	worldViewProjection		: WorldViewProjection;			// The 4x4 world view projection matrix.
float4x4	worldInverseTranspose	: WorldInverseTranspose;
float4x4	world					: World;
float4x4	viewInverse				: ViewInverse;
float4x4	view					: VIEW;


////////////////////////////////////////////////////////////////
// Includes & Interfaces

#include "ShaderInterfaces\DirectionalLight.shader"
#include "ShaderInterfaces\AmbientLight.shader"
#include "ShaderInterfaces\Common.shader"


////////////////////////////////////////////////////////////////
// UNIFORMS
//

sampler2D	SamplerEmissive;


////////////////////////////////////////////////////////////////
//
struct	VertexShaderInput
{
	float4 	Position		: POSITION;
 	float4 	Normal			: NORMAL;
	float2	UV				: TEXCOORD0;
};

struct	PixelShaderInput
{
	float4 	Position		: POSITION;
 	float3 	Normal			: TEXCOORD0;
 	float3 	WorldPosition	: TEXCOORD1;
 	float2	UV				: TEXCOORD2;
};


////////////////////////////////////////////////////////////////
//
PixelShaderInput VS( VertexShaderInput _Input )
{
	PixelShaderInput	Output;

	// Transform Position into clip space.
	Output.Position = mul( _Input.Position, worldViewProjection );

	// Transform the Tangent frame into world space.
	Output.Normal = mul( float4( _Input.Normal.xyz, 0 ), world ).xyz;

	// Calculate surface Position in world space. Used for lighting.
	Output.WorldPosition = mul( _Input.Position, world ).xyz;

	// Copy UVs
	Output.UV = _Input.UV;

	return Output;
}

float4	PS( PixelShaderInput _Input ) : COLOR
{
	float3	ToCamera = viewInverse[3].xyz - _Input.WorldPosition;
	float	fCameraDistance = length( ToCamera );
			ToCamera /= fCameraDistance;

	float3	ToLight = LightWorldDirection;
	float	Dot = 0.5 * (1 + saturate( dot( ToLight, -ToCamera ) ));

	// Read the emissive color
	float3	EmissiveColor = (tex2D( SamplerEmissive, _Input.UV ).rgb + 0.02) * COLOR_MULTIPLIER;

	// Apply lighting in world space
	float3	Result = lerp( AmbientColor.rgb, LightColor.rgb, Dot ) * EmissiveColor;


	// Add a little in-scattering
	float	fLightPhase = dot( ToCamera, LightWorldDirection );

//	float	fPhaseFunction = (1 + fLightPhase*fLightPhase);		// Rayleigh = 1+cos²(theta)

	float	k = SCATTERING_ANISOTROPY;
	float	fPhaseFunction = (1 - k * k) / (4*PI * (1+k*fLightPhase) * (1+k*fLightPhase));	// Schlick

	float	fScatteringFactor = fCameraDistance * SCATTERING_COEFFICIENT * fPhaseFunction * (1 - exp( -SCATTERING_COEFFICIENT * fCameraDistance ));

	float3	InScattering = LightColor * fScatteringFactor;

	Result += InScattering;

	return	float4( Result, 1 );
}
