// This is the interface to camera data used by post-process to build view ray
//
// #interface "PostProcess Camera"
//

// These are camera data from the ACTUAL scene camera, not the dummy post-process camera
float4x4	World2Camera;
float4x4	Camera2World;
float4x4	Camera2Proj;
float4		CameraData;						// X=tan(Horizontal_FOV/2), Y=tan(Vertical_FOV/2), Z=Near, W=Far


// Function that build the view vector in WORLD space
//	_UV, the UV coordinates of the post-process quad => (0,0) is top left corner and (1,1) is bottom right
//
float3	ComputeWorldViewVector( float2 _UV )
{
	// Build the WORLD VIEW vector
	float3	LocalView = float3( CameraData.x * (2 * _UV.x - 1), CameraData.y * (1 - 2 * _UV.y), -1 );
	return	normalize( mul( float4( LocalView, 0 ), Camera2World ).xyz );
}