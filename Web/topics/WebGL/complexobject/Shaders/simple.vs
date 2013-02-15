attribute vec3	_vPosition;
attribute vec2	_vUV;

varying vec2	_UV;

uniform mat4	_World2Proj;

void	main()
{
	_UV = _vUV;
	gl_Position = _World2Proj * vec4( _vPosition, 1 );
}
