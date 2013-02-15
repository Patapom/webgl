////////////////////////////////////////////////////////////////
// Clears the BRDF renderer with a nice background
#define saturate( a )	clamp( a, 0.0, 1.0 )
#define lerp( a, b, t )	mix( a, b, t )

precision highp float;


////////////////////////////////////////////////////////////////
// Varying values
varying vec2	_UV;

////////////////////////////////////////////////////////////////
// Vertex Shader
#ifdef VS

attribute vec4	_vPosition;

void	main()
{
	gl_Position = _vPosition;
	_UV = 0.5 * (1.0 + _vPosition.xy);
}

////////////////////////////////////////////////////////////////
// Pixel Shader
#else

void	main()
{
	vec3	View = normalize( vec3( 2.0 * _UV - 1.0, 1.0 ) );
	vec3	DummyLight = normalize( vec3( 1, 2, -0.1 ) );	// From behind
	float	Dot = dot( View, DummyLight );
			Dot = 0.25 + 0.8 * smoothstep( -0.9, 2.0, Dot );
	gl_FragColor = vec4( Dot, Dot, Dot, 1 );

gl_FragColor = vec4( 0, 0, 0, 0 );
}

#endif
