// This contains standard common functions
//
const static float	PI = 3.1415926535897932384626433832795;


//	------------------------------------------------------
//	[PATANOTE] Since modulo is a pain on PS3 and stuff (seemingly a HLSL/CG compatibility problem), we use our own function here
//	------------------------------------------------------

float	Mod1( float x, float y )
{
    return	x - (floor(x / y) * y);
}

float2	Mod2( float2 x, float2 y )
{
    return	x - (floor(x / y) * y);
}

float3	Mod3( float3 x, float3 y )
{
    return	x - (floor(x / y) * y);
}

float4	Mod4( float4 x, float4 y )
{
    return	x - (floor(x / y) * y);
}


