// Compulsory lines for entry points
// #o3d VertexShaderEntryPoint VS
// #o3d PixelShaderEntryPoint PS
// #o3d MatrixLoadOrder RowMajor

// This shader uses the following inputs:
//	Position, Normal, Tangent, BiNormal, UV Set0 for texturing + 3 UV Sets that encode 2 SH Bands
//
// And the following uniform parameters:
//	SpecularPower
//
// It applies diffuse lighting using the SH encoded per vertex and the RGB SH coefficients encoding
//	the environment as provided by the GenericSH.shader interface
// Specular lighting is computed using the diffuse texture as specular color, the provided SpecularPower
//	to modulate glossiness and the same light color used for diffuse
//


////////////////////////////////////////////////////////////////
// CONSTANTS
//

	// Diffuse texture tweak & gamma
static const float	DIFFUSE_COLOR_OFFSET	= 0.0;				// [0,1] The offset to add to the diffuse texture color
static const float	DIFFUSE_COLOR_POWER		= 0.7;				// ]0,oo[ The power to raise the diffuse texture color to (i.e. gamma correction)

	// Detail texturing
static const float	DETAIL_WEIGHT			= 0.25;				// ]-oo,+oo[ The weight of the detail map compared to the weight of common diffuse/normal maps
static const float	DETAIL_UV_SCALE			= 2.0;				// ]-oo,+oo[ The tiling scale factor (i.e. UV_detail = UV_standard * SCALE)

	// SH variation based on normal map
static const float	NORMAL_SH_PERTURBATION_FACTOR	= 1.2;		// ]-oo,+oo[ The amount of perturbation on SH factors based on normal deviation (this makes the normal show even in shadow)

	// SH Luminance variation based on phase with light
static const float	SH_LUMINANCE_FACING_LIGHT	= 0.5;			// [0,1] The factor to apply to SH when looking toward the light
static const float	SH_LUMINANCE_POWER			= 2.5;			// [0,+oo[ The power to raise the luminance to

	// In-Scattering
static const float	SCATTERING_COEFFICIENT	= 0.02;			// [0,+oo[ The scattering coefficient (i.e. "amount of scattering" per unit length)
static const float	SCATTERING_ANISOTROPY	= 0.5;				// ]-1,+1[ The prefered direction of scattering (e.g. -1 is backward, 0 is isotropic and +1 is forward)

	// Specularity
static const float	SPECULAR_POWER_FAR		= 2.0;				// ]0,+oo[ The specular power to interpolate
static const float	SPECULAR_FAR_DISTANCE	= 20.0;
static const float	SPECULAR_FACTOR			= 1.0;


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
#include "ShaderInterfaces\GenericSH.shader"
#include "ShaderInterfaces\Common.shader"


////////////////////////////////////////////////////////////////
// UNIFORMS
//

float		SpecularPower;

sampler2D	SamplerDiffuse;
sampler2D	SamplerNormal;

sampler2D	SamplerDetailDiffuse;
sampler2D	SamplerDetailNormal;


////////////////////////////////////////////////////////////////
//
struct	VertexShaderInput
{
	float4 	Position		: POSITION;
 	float4 	Normal			: NORMAL;
 	float4 	Tangent			: TANGENT;
 	float4 	BiNormal		: BINORMAL;
	float2	UV				: TEXCOORD0;

	// Encoded SH bands
	float4	SH_Red			: TEXCOORD1;
	float4	SH_Green		: TEXCOORD2;
	float4	SH_Blue			: TEXCOORD3;
};

struct	PixelShaderInput
{
	float4 	Position		: POSITION;
 	float3 	WorldPosition	: TEXCOORD0;
 	float3	UV_CamDistance	: TEXCOORD1;
 	float4 	Normal			: TEXCOORD2;
 	float4 	Tangent			: TEXCOORD3;
 	float4 	BiNormal		: TEXCOORD4;
 	float4 	SH_Red			: TEXCOORD5;
 	float4 	SH_Green		: TEXCOORD6;
 	float4 	SH_Blue			: TEXCOORD7;
};


////////////////////////////////////////////////////////////////
//
PixelShaderInput VS( VertexShaderInput _Input )
{
	PixelShaderInput	Output;

	// Transform Position into clip space.
	Output.Position = mul( _Input.Position, worldViewProjection );

	// Calculate surface Position in world space. Used for lighting.
	Output.WorldPosition = mul( _Input.Position, world ).xyz;

	// Simply copy UVs
	Output.UV_CamDistance.xy = _Input.UV;

	// Transform the Tangent frame into world space.
	Output.Normal.xyz = mul( float4( _Input.Normal.xyz, 0 ), world ).xyz;
	Output.Tangent.xyz = mul( float4( _Input.Tangent.xyz, 0 ), world ).xyz;
	Output.BiNormal.xyz = mul( float4( _Input.BiNormal.xyz, 0 ), world ).xyz;

	// Simply copy SH coefficients
	Output.SH_Red = _Input.SH_Red;
	Output.SH_Green = _Input.SH_Green;
	Output.SH_Blue = _Input.SH_Blue;

	// Compute a little in-scattering
	float3	ToCamera = viewInverse[3].xyz - Output.WorldPosition;
	float	fCameraDistance = length( ToCamera );
			ToCamera /= fCameraDistance;

	float	fLightPhase = dot( ToCamera, LightWorldDirection );

//	float	fPhaseFunction = (1 + fLightPhase*fLightPhase);		// Rayleigh = 1+cos²(theta)

	float	k = SCATTERING_ANISOTROPY;
	float	fPhaseFunction = (1 - k * k) / (4*PI * (1+k*fLightPhase) * (1+k*fLightPhase));	// Schlick

	float	fScatteringFactor = fCameraDistance * SCATTERING_COEFFICIENT * fPhaseFunction * (1 - exp( -SCATTERING_COEFFICIENT * fCameraDistance ));

	float3	InScattering = LightColor * fScatteringFactor;

	Output.Normal.w = InScattering.r;
	Output.Tangent.w = InScattering.g;
	Output.BiNormal.w = InScattering.b;

	// Write camera distance
	Output.UV_CamDistance.z = min( 0.99, fCameraDistance / 50 );	// Don't go over 0.99 (1 is considered infinity and is only written by stained glass windows representing light sources)



// TEST Attenuate with phase
fLightPhase = lerp( 1, SH_LUMINANCE_FACING_LIGHT, pow( saturate( -fLightPhase ), SH_LUMINANCE_POWER ) );

Output.SH_Red *= fLightPhase;
Output.SH_Green *= fLightPhase;
Output.SH_Blue *= fLightPhase;
// TEST


	return Output;
}

float4	PS( PixelShaderInput _Input ) : COLOR
{
//*	// Rebuild tangent space
	float3x3	TS2World;
				TS2World[0] = normalize( _Input.Tangent.xyz );
				TS2World[1] = normalize( _Input.BiNormal.xyz );
				TS2World[2] = normalize( _Input.Normal.xyz );

	// Compute view vector
	float3	ToCamera = viewInverse[3].xyz - _Input.WorldPosition;
	float	fCameraDistance = length( ToCamera );
			ToCamera /= fCameraDistance;

	// Read diffuse color from texture
	float3	TextureDiffuseColor = tex2D( SamplerDiffuse, _Input.UV_CamDistance.xy ).rgb;
			TextureDiffuseColor = pow( DIFFUSE_COLOR_OFFSET + TextureDiffuseColor, DIFFUSE_COLOR_POWER );

	// Read normal from texture
	float3	Normal = 2 * tex2D( SamplerNormal, _Input.UV_CamDistance.xy ) - 1;

	// Read detail diffuse & normal
	float3	DetailDiffuseColor = DETAIL_WEIGHT * (2 * tex2D( SamplerDetailDiffuse, _Input.UV_CamDistance.xy * DETAIL_UV_SCALE ).xyz - 1);
//	float3	DetailNormal = DETAIL_WEIGHT * (2 * tex2D( SamplerDetailDiffuse, _Input.UV_CamDistance.xy * DETAIL_UV_SCALE ).xyz - 1);


	/////////////////////////// APPLY DETAIL ///////////////////////////

	TextureDiffuseColor += DetailDiffuseColor;
// 	Normal = normalize( Normal + DetailNormal );


	/////////////////////////// GET NORMAL IN WORLD SPACE ///////////////////////////

	Normal = mul( Normal, TS2World );	// Normal is now in WORLD space


	/////////////////////////// COMPUTE LIGHT COLOR ///////////////////////////

// NOTE: Ideally, we should be rotating SH using normal deviation but PS2.0 don't have enough instructions :(
//
// 	// Compute rotation matrix to transform source normal into target normal
// 	// (routine from Thomas Moller) (which is actually the same as converting from a quaternion to a matrix)
// 	//
// 	float	e = dot( _Input.Normal, Normal );
// //	if ( e < 1.0f - 0.000001f )
// 	{
// 		float3		Ortho = cross( _Input.Normal, Normal );
// 		
// 		float		h = 1.0f / (1.0f + e);      // Optimization by Gottfried Chen
// 		
// 		float3x3	Transform;
// 		Transform[0].x = e + h * Ortho.x * Ortho.x;
// 		Transform[0].y = h * Ortho.x * Ortho.y - Ortho.z;
// 		Transform[0].z = h * Ortho.x * Ortho.z + Ortho.y;
// 
// 		Transform[1].x = h * Ortho.x * Ortho.y + Ortho.z;
// 		Transform[1].y = e + h * Ortho.y * Ortho.y;
// 		Transform[1].z = h * Ortho.y * Ortho.z - Ortho.x;
// 
// 		Transform[2].x = h * Ortho.x * Ortho.z - Ortho.y;
// 		Transform[2].y = h * Ortho.y * Ortho.z + Ortho.x;
// 		Transform[2].z = e + h * Ortho.z * Ortho.z;
// 
// 		// Transform SH vectors using that matrix
// 		_Input.SH_Red.yzw = mul( Transform, _Input.SH_Red.yzw );
// 		_Input.SH_Green.yzw = mul( Transform, _Input.SH_Green.yzw );
// 		_Input.SH_Blue.yzw = mul( Transform, _Input.SH_Blue.yzw );
// 	}

	// Compute the deviation in WORLD space from original normal
	float3	Deviation = TS2World[2] - Normal;
			Deviation = float3( Deviation.y, Deviation.z, -Deviation.x );	// Re-order to match SH orientation

	// Use the deviation to perturbate SH
 	float4	SHFactor = float4( 1, 1 + NORMAL_SH_PERTURBATION_FACTOR * Deviation );

	_Input.SH_Red *= SHFactor;
	_Input.SH_Green *= SHFactor;
	_Input.SH_Blue *= SHFactor;

	// Calculate color using SH coefficients
	float3	LightColor;
			LightColor.x = max( 0, dot( SH_Red, _Input.SH_Red ) );
			LightColor.y = max( 0, dot( SH_Green, _Input.SH_Green ) );
			LightColor.z = max( 0, dot( SH_Blue, _Input.SH_Blue ) );


	/////////////////////////// COMPUTE IN-SCATTERING ///////////////////////////

	float3	InScattering = float3( _Input.Normal.w, _Input.Tangent.w, _Input.BiNormal.w );


	/////////////////////////// COMPUTE DIFFUSE COLOR ///////////////////////////

	float3	DiffuseColor = saturate( TextureDiffuseColor );


	/////////////////////////// COMPUTE SPECULAR COLOR ///////////////////////////

	float3	ReflectedVector = reflect( -ToCamera, Normal );
	float	fSpecularPower = lerp( SpecularPower.x, SPECULAR_POWER_FAR, saturate( fCameraDistance / SPECULAR_FAR_DISTANCE ) );
	float	fSpecularFactor = pow( saturate( dot( ReflectedVector, LightWorldDirection ) ), fSpecularPower );

fSpecularFactor *= SPECULAR_FACTOR;


	/////////////////////////// COMPUTE FINAL LIGHTING ///////////////////////////

	float3	Result = InScattering + LightColor * DiffuseColor * (1 + fSpecularFactor);

	// Write color in RGB & normalized camera distance in Alpha
	return	float4( Result, _Input.UV_CamDistance.z );
}
