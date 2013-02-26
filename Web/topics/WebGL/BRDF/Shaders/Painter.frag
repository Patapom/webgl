#ifdef GL_ES
precision mediump float;
#endif

/** painter **/

uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D backbuffer;

uniform vec3 color ;
uniform float size ;
// uniform float exponent ; 

void main()
{
    vec2 position = ( gl_FragCoord.xy / resolution.xy );
    vec2 mousepx = mouse * resolution;

    vec3 outColor = texture2D(backbuffer, position ).rgb;

    float d = distance(gl_FragCoord.xy , mousepx );
    if(d < size)
    {
	// TODO Work on the brush function
	outColor += 0.2*color * (1-d/size+.2);
    }

    gl_FragColor = vec4(outColor,1.);
}