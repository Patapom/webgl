////////////////////////////////////////////////////////////////
// Converts ZBuffer positions into shadow map positions
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

precision highp float;

////////////////////////////////////////////////////////////////
attribute vec2		_vUV;

varying vec2		_Z;				// X=Distance to light Y=Clip face (i.e. invalid Z)

uniform sampler2D	_TexZBuffer;
uniform bool		_InvertZBuffer;

uniform vec3		_dUV;
uniform vec2		_ClipZ;			// X=Z far clip  Y=Delta Z clip
uniform vec4		_TileUV;		// XY=UV start ZW=UV end

uniform vec4		_CameraData;

// Shadow map data
uniform vec3		_ShadowCenter;
uniform vec3		_ShadowX;
uniform vec3		_ShadowY;
uniform vec3		_ShadowZ;

void	main()
{
	vec2	UV = lerp( _TileUV.xz, _TileUV.yw, _vUV );

	// Sample the ZBuffer
	float	Z = texture2D( _TexZBuffer, UV ).x;
	float	Z_Xp = texture2D( _TexZBuffer, UV + _dUV.xz ).x;
	float	Z_Yp = texture2D( _TexZBuffer, UV + _dUV.zy ).x;

	float	ClipZ = saturate( 1000.0 * (abs( Z_Xp - Z ) - _ClipZ.y) + 1000.0 * (abs( Z_Yp - Z ) - _ClipZ.y) );	// 1 if any Z discrepancy is more than the tolerated limit...

	if ( _InvertZBuffer )
		Z = 1.0 - Z;

	ClipZ = saturate( ClipZ + 1000.0 * (Z - _ClipZ.x) );	// 1 if Z is further than far clip limit..


	// Retrieve the world space position
//	vec3	Position = Z * vec3( _CameraData.x * (2.0 * UV.x - 1.0), _CameraData.y * (2.0 * UV.y - 1.0), 1.0 );
	vec3	Position = Z * vec3( 2.0 * UV.x - 1.0, 2.0 * UV.y - 1.0, 1.0 );

	// Project into shadow map space
	vec3	ShadowPosition = Position - _ShadowCenter;	// Relative to shadow map's center
	float	LightZ = dot( ShadowPosition, _ShadowZ );
			ShadowPosition = vec3( dot( ShadowPosition, _ShadowX ), dot( ShadowPosition, _ShadowY ), 2.0 * LightZ - 1.0 );

	gl_Position = vec4( ShadowPosition, 1.0 );
//	gl_Position = vec4( 2.0 * UV.x - 1.0, 2.0 * UV.y - 1.0, 2.0 * Z - 1.0, 1.0 );
//	gl_Position = vec4( 2.0 * UV.x - 1.0, 2.0 * UV.y - 1.0, 0.0, 1.0 );

	_Z = vec2( LightZ, ClipZ );
}
