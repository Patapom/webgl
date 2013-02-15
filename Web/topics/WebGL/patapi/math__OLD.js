// Simple extensions of the standard math library & the O3D library
//
o3djs.require('patapi.base');
o3djs.provide('patapi.math__OLD');

patapi.math = patapi.math || {};
//var Math3D = patapi.math;	// Our math lib
var Math3D = function() {}


////////////////////////////////////////////////////////////////////////////
// Extends the standard math object
//
patapi.helpers.Extend( Math,
{
	FOURPI : 12.566370614359172953850573533118,		// 4PI
	TWOPI : 6.283185307179586476925286766559,		// 2PI
	HALFPI : 1.5707963267948966192313216916398,		// PI/2
	INVPI : 0.31830988618379067153776752674503,		// 1/PI
	INV2PI : 0.15915494309189533576888376337251,	// 1/(2PI)
	INV4PI : 0.07957747154594766788444188168626,	// 1/(4PI)
	FLOAT32_MAX : 3.402823466e+38,

	sign : function( a )				{ return a < 0 ? -1 : (a > 0 ? +1 : 0); },
	clamp : function( x, min, max )		{ return Math.max( min, Math.min( x, max ) ); },
	saturate : function( x )			{ return Math.max( 0.0, Math.min( x, 1.0 ) ); },
	deg2rad : function( a )				{ return a * Math.PI / 180.0; },
	rad2deg : function( a )				{ return a * 180.0 / Math.PI; },
	lerp : function( a, b, t )			{ return a + (b - a) * t; },
	smoothlerp : function( a, b, x )	{ var t = Math.saturate( (x - a) / (b - a) ); return t * t * (3 - 2 * t); },
} );


////////////////////////////////////////////////////////////////////////////
// Vectors

// 2D Vector
Object.prototype.vec2 = function( x, y )
{
	switch ( arguments.length )
	{
	case 0:
		this.x = this.y = 0.0;
		break;
	
	case 1:	// Assume another vec2 or an array
		if ( x instanceof Array )
		{
			this.x = x[0];
			this.y = x[1];
		}
		else
		{
			this.x = x.x;
			this.y = x.y;
		}
		break;

	case 2:
		this.x = x;
		this.y = y;
	}

	return this;
}

/*
Object.prototype.vec2unitX = function() { return {x:1, y:0}; }
Object.prototype.vec2unitY = function() { return {x:0, y:1}; }
Object.prototype.vec2zero = function() { return {x:0, y:0}; }
Object.prototype.vec2one = function() { return {x:1, y:1}; }

function vec2neg( a )			{ return {}.vec2( -a.x, -a.y ); }
function vec2add( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec2( a.x + b.x, a.y + b.y ) : {}.vec2( a + b.x, a + b.y )) : {}.vec2( a.x + b, a.y + b ); }
function vec2sub( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec2( a.x - b.x, a.y - b.y ) : {}.vec2( a - b.x, a - b.y )) : {}.vec2( a.x - b, a.y - b ); }
function vec2mul( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec2( a.x * b.x, a.y * b.y ) : {}.vec2( a * b.x, a * b.y )) : {}.vec2( a.x * b, a.y * b ); }
function vec2div( a, b )		{ return b instanceof Object ? {}.vec2( a.x / b.x, a.y / b.y ) : {}.vec2( a.x / b, a.y / b ); }
function vec2lengthSq( a )		{ return a.x*a.x + a.y*a.y; }
function vec2length( a )		{ return Math.sqrt( vec2lengthSq( a ) ); }
function vec2normalize( a )		{ var l = 1.0 / vec2length( a ); a.x *= l; a.y *= l; return a; }
function vec2normalized( a )	{ var l = 1.0 / vec2length( a ); return {}.vec2( a.x * l, a.y * l ); }
function vec2dot( a, b )		{ return a.x*b.x + a.y*b.y; }
function vec2cross( a, b )		{ return {}.vec3( 0.0, 0.0, a.x*b.y - a.y*b.x ); }

// 3D Vector
Object.prototype.vec3 = function( x, y, z )
{
	switch ( arguments.length )
	{
	case 0:
		this.x = this.y = this.z = 0.0;
		break;
	
	case 1:	// Assume another vec3 or an array
		if ( x instanceof Array )
		{
			this.x = x[0];
			this.y = x[1];
			this.z = x[2];
		}
		else
		{
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		}
		break;

	case 2:	// Assume a vec2 and a float
		this.x = x.x;
		this.y = x.y;
		this.z = y;
		break;

	case 3:	// Assume 3 floats
		this.x = x;
		this.y = y;
		this.z = z;
		break;
	}

	return this;
}
Object.prototype.vec3unitX = function() { return {x:1, y:0, z:0}; }
Object.prototype.vec3unitY = function() { return {x:0, y:1, z:0}; }
Object.prototype.vec3unitZ = function() { return {x:0, y:0, z:1}; }
Object.prototype.vec3zero = function() { return {x:0, y:0, z:0}; }
Object.prototype.vec3one = function() { return {x:1, y:1, z:1}; }

function vec3neg( a )			{ return {}.vec3( -a.x, -a.y, -a.z ); }
function vec3add( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec3( a.x + b.x, a.y + b.y, a.z + b.z ) : {}.vec3( a + b.x, a + b.y, a + b.z )) : {}.vec3( a.x + b, a.y + b, a.z + b ); }
function vec3sub( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec3( a.x - b.x, a.y - b.y, a.z - b.z ) : {}.vec3( a - b.x, a - b.y, a - b.z )) : {}.vec3( a.x - b, a.y - b, a.z - b ); }
function vec3mul( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec3( a.x * b.x, a.y * b.y, a.z * b.z ) : {}.vec3( a * b.x, a * b.y, a * b.z )) : {}.vec3( a.x * b, a.y * b, a.z * b ); }
function vec3div( a, b )		{ return b instanceof Object ? {}.vec3( a.x / b.x, a.y / b.y, a.z / b.z ) : {}.vec3( a.x / b, a.y / b, a.z / b ); }
function vec3lengthSq( a )		{ return a.x*a.x + a.y*a.y + a.z*a.z; }
function vec3length( a )		{ return Math.sqrt( vec3lengthSq( a ) ); }
function vec3normalize( a )		{ var l = 1.0 / vec3length( a ); a.x *= l; a.y *= l; a.z *= l; return a; }
function vec3normalized( a )	{ var l = 1.0 / vec3length( a ); return {}.vec3( a.x * l, a.y * l, a.z * l ); }
function vec3dot( a, b )		{ return a.x*b.x + a.y*b.y + a.z*b.z; }
function vec3cross( a, b )		{ return {}.vec3( a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x ); }

// 4D Vector
Object.prototype.vec4 = function( x, y, z, w )
{
	switch ( arguments.length )
	{
	case 0:
		this.x = this.y = this.z = this.w = 0.0;
		break;
	
	case 1:	// Assume another vec4 or an array
		if ( x instanceof Array )
		{
			this.x = x[0];
			this.y = x[1];
			this.z = x[2];
			this.w = x[3];
		}
		else
		{
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
			this.w = x.w;
		}
		break;

	case 2:	// Assume a vec3 and a float
		this.x = x.x;
		this.y = x.y;
		this.z = x.z;
		this.w = y;
		break;

	case 4:	// Assume 4 floats
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		break;
	}

	return this;
}
Object.prototype.vec4unitX = function() { return {x:1, y:0, z:0, w:0}; }
Object.prototype.vec4unitY = function() { return {x:0, y:1, z:0, w:0}; }
Object.prototype.vec4unitZ = function() { return {x:0, y:0, z:1, w:0}; }
Object.prototype.vec4unitW = function() { return {x:0, y:0, z:0, w:1}; }
Object.prototype.vec4zero = function() { return {x:0, y:0, z:0, w:0}; }
Object.prototype.vec4one = function() { return {x:1, y:1, z:1, w:1}; }

function vec4neg( a )			{ return {}.vec4( -a.x, -a.y, -a.z, -a.w ); }
function vec4add( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec4( a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w ) : {}.vec4( a + b.x, a + b.y, a + b.z, a + b.w )) : {}.vec4( a.x + b, a.y + b, a.z + b, a.w + b ); }
function vec4sub( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec4( a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w ) : {}.vec4( a - b.x, a - b.y, a - b.z, a - b.w )) : {}.vec4( a.x - b, a.y - b, a.z - b, a.w - b ); }
function vec4mul( a, b )		{ return b instanceof Object ? (a instanceof Object ? {}.vec4( a.x * b.x, a.y * b.y, a.z * b.z, a.w * b.w ) : {}.vec4( a * b.x, a * b.y, a * b.z, a * b.w )) : {}.vec4( a.x * b, a.y * b, a.z * b, a.w * b ); }
function vec4div( a, b )		{ return b instanceof Object ? {}.vec4( a.x / b.x, a.y / b.y, a.z / b.z, a.w / b.w ) : {}.vec4( a.x / b, a.y / b, a.z / b, a.w / b ); }
function vec4lengthSq( a )		{ return a.x*a.x + a.y*a.y + a.z*a.z + a.w*a.w; }
function vec4length( a )		{ return Math.sqrt( vec4lengthSq( a ) ); }
function vec4normalize( a )		{ var l = 1.0 / vec4length( a ); a.x *= l; a.y *= l; a.z *= l; a.w *= l; return a; }
function vec4normalized( a )	{ var l = 1.0 / vec4length( a ); return {}.vec4( a.x * l, a.y * l, a.z * l, a.w * l ); }
function vec4dot( a, b )		{ return a.x*b.x + a.y*b.y + a.z*b.z + a.w*b.w; }


////////////////////////////////////////////////////////////////////////////
// Quaternions
Object.prototype.quat = function( s, i, j, k )
{
	switch ( arguments.length )
	{
	case 0:	// Make identity
		this.s = 1.0;
		this.i = this.j = this.k = 0.0;
		break;
	
	case 1:	// Assume another quat or an array
		if ( x instanceof Array )
		{
			this.s = x[0];
			this.i = x[1];
			this.j = x[2];
			this.k = x[3];
		}
		else
		{
			this.s = x.s;
			this.i = x.i;
			this.j = x.j;
			this.k = x.k;
		}
		break;

	case 2:	// Assume a float and a vec3
		this.s = x;
		this.i = y.x;
		this.j = y.y;
		this.k = y.z;
		break;

	case 4:	// Assume 4 floats
		this.s = s;
		this.i = i;
		this.j = j;
		this.k = k;
		break;
	}

	return this;
}
Object.prototype.quatIdentity = function() { return { s:1, i:0, j:0, k:0 }; }


function quatVector( a )	{ return {}.vec3( a.i, a.j, a.k ); }	// Returns the vector part of the quaternion
function quatNeg( a )		{ return {}.quat( -a.s, -a.i, -a.j, -a.k ); }
function quatAdd( a, b )	{ return {}.quat( a.s + b.s, a.i + b.i, a.j + b.j, a.k + b.k ); }
function quatMul( a, b )
{
	var	aObj = a instanceof Object;
	var	bObj = b instanceof Object;
	if ( aObj && bObj )
	{	// Quaternion product
		var	VecA = quatVector( a );
		var	VecB = quatVector( b );

		var	Angle = a.s * b.s - vec3dot( VecA, VecB );
		var	Axis = vec3add( vec3add( vec3mul( a.s * VecB ), vec3mul( b.s, VecA ) ), vec3cross( VecA, VecB ) );
		return {}.quat( Angle, Axis );
	}
	else if ( aObj )
	{	// Multiply by scalar on the right
		return {}.quat( a.s * b, a.i * b, a.j * b, a.k * b );
	}
	else
	{	// Multiply by scalar on the left
		return {}.quat( a * b.s, a * b.i, a * b.j, a * b.k );
	}
}
function quatLengthSq( a )	{ return a.s*a.s + a.i*a.i + a.j*a.j + a.k*a.k; }
function quatLength( a )	{ return Math.sqrt( quatLengthSq( a ) ); }
function quatNormalize( a )	{ var l = 1.0 / quatLength( a ); return {}.quat( l*a.s, l*a.i, l*a.j, l*a.z ); return a; }
function quatFromAngleAxis( angle, axis ) { return {}.quat( Math.cos( 0.5 * angle ), vec3mul( Math.sin( 0.5 * angle ), axis ) ); }
function quat2Matrix( a )
{
	a = quatNormalize( a );	// A cast to a matrix only works with normalized quaternions!

	var	Ret = {}.mat4Identity();

	var xs = 2.0 * a.i,	ys = 2.0 * a.j,	zs = 2.0 * a.k;

	var	wx = a.s * xs, wy = a.s * ys, wz = a.s * zs;
	var	xx = a.i * xs, xy = a.i * ys, xz = a.i * zs;
	var	yy = a.j * ys, yz = a.j * zs, zz = a.k * zs;

	mat4setElement( Ret, 0, 0,	1.0 -	yy - zz );
	mat4setElement( Ret, 0, 1,			xy + wz );
	mat4setElement( Ret, 0, 2,			xz - wy );

	mat4setElement( Ret, 1, 0,			xy - wz );
	mat4setElement( Ret, 1, 1,	1.0 -	xx - zz );
	mat4setElement( Ret, 1, 2,			yz + wx );

	mat4setElement( Ret, 2, 0, 			xz + wy );
	mat4setElement( Ret, 2, 1,			yz - wx );
	mat4setElement( Ret, 2, 2,	1.0 -	xx - yy );

	return	Ret;
}
function quatSetElement( a, sijk, value )
{
	switch ( sijk & 3 )
	{
	case 0: a.s = value; break;
	case 1: a.i = value; break;
	case 2: a.j = value; break;
	case 3: a.k = value; break;
	}
}
function quatSetVectorElement( a, ijk, value )
{
	switch ( ijk % 3 )
	{
	case 0: a.i = value; break;
	case 1: a.j = value; break;
	case 2: a.k = value; break;
	}
}

////////////////////////////////////////////////////////////////////////////
// Matrices
// Should be initialized with an array of 16 floats or an array of 4 vec4
Object.prototype.mat4 = function( a )
{
	var	ArraySize = !!a ? (a instanceof Array ? a.length : 1) : 0;
	switch ( ArraySize )
	{
	case 0:	// No argument : build identity
		this.r0 = {}.vec4( 1, 0, 0, 0 );
		this.r1 = {}.vec4( 0, 1, 0, 0 );
		this.r2 = {}.vec4( 0, 0, 1, 0 );
		this.r3 = {}.vec4( 0, 0, 0, 1 );
		break;

	case 1:	// Assume another mat4
		this.r0 = {}.vec4( a.r0 );
		this.r1 = {}.vec4( a.r1 );
		this.r2 = {}.vec4( a.r2 );
		this.r3 = {}.vec4( a.r3 );
		break;

	case 4:	// Assume an array of vec4
		this.r0 = a[0];
		this.r1 = a[1];
		this.r2 = a[2];
		this.r3 = a[3];
		break;

	case 16: // Assume an array of 16 floats
		this.r0 = {}.vec4( a[4*0+0], a[4*0+1], a[4*0+2], a[4*0+3] );
		this.r1 = {}.vec4( a[4*1+0], a[4*1+1], a[4*1+2], a[4*1+3] );
		this.r2 = {}.vec4( a[4*2+0], a[4*2+1], a[4*2+2], a[4*2+3] );
		this.r3 = {}.vec4( a[4*3+0], a[4*3+1], a[4*3+2], a[4*3+3] );
		break;

	default:
		throw "Only [4*vec4] or [16*float] are expected to build a matrix";
	}

	return this;
}
Object.prototype.mat4Identity = function() { return {}.mat4(); }


function mat4add( a, b )		{ return {}.mat4( [ vec4add( a.r0, b.r0 ), vec4add( a.r1, b.r1 ), vec4add( a.r2, b.r2 ), vec4add( a.r3, b.r3 ) ] ); }
function mat4sub( a, b )		{ return {}.mat4( [ vec4sub( a.r0, b.r0 ), vec4sub( a.r1, b.r1 ), vec4sub( a.r2, b.r2 ), vec4sub( a.r3, b.r3 ) ] ); }
function mat4mul( a, b )
{
	var	aObj = a instanceof Object;
	var	bObj = b instanceof Object;

	if ( aObj && bObj )
	{
		if ( a.x !== undefined )
		{	// Vector * Matrix
			return {}.vec4(
				a.x*b.r0.x + a.y*b.r1.x + a.z*b.r2.x + a.w*b.r3.x,
				a.x*b.r0.y + a.y*b.r1.y + a.z*b.r2.y + a.w*b.r3.y,
				a.x*b.r0.z + a.y*b.r1.z + a.z*b.r2.z + a.w*b.r3.z,
				a.x*b.r0.w + a.y*b.r1.w + a.z*b.r2.w + a.w*b.r3.w
			);
		}
		else if ( b.x !== undefined )
		{	// Matrix * Vector
			return {}.vec4(
				a.r0.x*b.x + a.r0.y*b.y + a.r0.z*b.z + a.r0.w*b.w,
				a.r1.x*b.x + a.r1.y*b.y + a.r1.z*b.z + a.r1.w*b.w,
				a.r2.x*b.x + a.r2.y*b.y + a.r2.z*b.z + a.r2.w*b.w,
				a.r3.x*b.x + a.r3.y*b.y + a.r3.z*b.z + a.r3.w*b.w
			);
		}
		else
		{	// Matrix multiplication
			return {}.mat4( [
				{}.vec4( a.r0.x*b.r0.x + a.r0.y*b.r1.x + a.r0.z*b.r2.x + a.r0.w*b.r3.x, a.r0.x*b.r0.y + a.r0.y*b.r1.y + a.r0.z*b.r2.y + a.r0.w*b.r3.y, a.r0.x*b.r0.z + a.r0.y*b.r1.z + a.r0.z*b.r2.z + a.r0.w*b.r3.z, a.r0.x*b.r0.w + a.r0.y*b.r1.w + a.r0.z*b.r2.w + a.r0.w*b.r3.w ),
				{}.vec4( a.r1.x*b.r0.x + a.r1.y*b.r1.x + a.r1.z*b.r2.x + a.r1.w*b.r3.x, a.r1.x*b.r0.y + a.r1.y*b.r1.y + a.r1.z*b.r2.y + a.r1.w*b.r3.y, a.r1.x*b.r0.z + a.r1.y*b.r1.z + a.r1.z*b.r2.z + a.r1.w*b.r3.z, a.r1.x*b.r0.w + a.r1.y*b.r1.w + a.r1.z*b.r2.w + a.r1.w*b.r3.w ),
				{}.vec4( a.r2.x*b.r0.x + a.r2.y*b.r1.x + a.r2.z*b.r2.x + a.r2.w*b.r3.x, a.r2.x*b.r0.y + a.r2.y*b.r1.y + a.r2.z*b.r2.y + a.r2.w*b.r3.y, a.r2.x*b.r0.z + a.r2.y*b.r1.z + a.r2.z*b.r2.z + a.r2.w*b.r3.z, a.r2.x*b.r0.w + a.r2.y*b.r1.w + a.r2.z*b.r2.w + a.r2.w*b.r3.w ),
				{}.vec4( a.r3.x*b.r0.x + a.r3.y*b.r1.x + a.r3.z*b.r2.x + a.r3.w*b.r3.x, a.r3.x*b.r0.y + a.r3.y*b.r1.y + a.r3.z*b.r2.y + a.r3.w*b.r3.y, a.r3.x*b.r0.z + a.r3.y*b.r1.z + a.r3.z*b.r2.z + a.r3.w*b.r3.z, a.r3.x*b.r0.w + a.r3.y*b.r1.w + a.r3.z*b.r2.w + a.r3.w*b.r3.w ),
			  ] );
		}
	}
	else if ( aObj )
	{	// Multiply right by scalar
		return {}.mat4( [ vec4mul( a.r0, b ), vec4mul( a.r1, b ), vec4mul( a.r2, b ), vec4mul( a.r3, b ) ] );
	}
	else
	{	// Multiply left by scalar
		return {}.mat4( [ vec4mul( a, b.r0 ), vec4mul( a, b.r1 ), vec4mul( a, b.r2 ), vec4mul( a, b.r3 ) ] );
	}
}

function mat4getRow( a, row )
{
	switch ( row&3 )
	{
	case 0: return a.r0;
	case 1: return a.r1;
	case 2: return a.r2;
	case 3: return a.r3;
	}
}

function mat4getElement( a, row, column )
{
	var	v = mat4getRow( a, row );
	switch ( column&3 )
	{
	case 0: return v.x;
	case 1: return v.y;
	case 2: return v.z;
	case 3: return v.w;
	}
}

function mat4getElementSingleIndex( a, index )
{
	return mat4getElement( a, index >> 2, index );
}

function mat4setElement( a, row, column, value )
{
	var	v = mat4getRow( a, row );
	switch ( column&3 )
	{
	case 0: v.x = value; break;
	case 1: v.y = value; break;
	case 2: v.z = value; break;
	case 3: v.w = value; break;
	}
}

function mat4asArray( a )
{
	var	Result = [
				a.r0.x, a.r0.y, a.r0.z, a.r0.w,
				a.r1.x, a.r1.y, a.r1.z, a.r1.w,
				a.r2.x, a.r2.y, a.r2.z, a.r2.w,
				a.r3.x, a.r3.y, a.r3.z, a.r3.w
			];
	return Result;
}

function mat4setElementSingleIndex( a, index, value )
{
	return mat4setElement( a, index >> 2, index, value );
}

// Gets the XYZ Euler angles from a matrix
// Can be used later in the rotationZYX() method to reconstruct the matrix
function mat4getEuler( m )
{
	var	Ret = {}.vec3();
	var	fSinY = Math.clamp( m.r0.z, -1.0, +1.0 );
	var	fCosY = Math.sqrt( 1.0 - fSinY*fSinY );
	if ( m.r0.x < 0.0 && m.r2.z < 0.0 )
		fCosY = -fCosY;

	if ( Math.abs( fCosY ) > 1e-6 )
	{
		Ret.x =  Math.atan2( m.r1.z / fCosY, m.r2.z / fCosY );
		Ret.y = -Math.atan2( fSinY, fCosY );
		Ret.z =  Math.atan2( m.r0.y / fCosY, m.r0.x / fCosY );
	}
	else
	{
		Ret.x =  Math.atan2( -m.r2.y, m.r1.y );
		Ret.y = -Math.asin( fSinY );
		Ret.z = 0.0;
	}

	return	Ret;
}

// Creates a 4x4 rotation matrix.
//	_EulerXYZ, a vector of 3 Euler angles (in radians).
// Returns a matrix which rotates around the x-axis first, then the y-axis, then the z-axis.
//
function	mat4rotationZYX( _AngleX, _AngleY, _AngleZ )
{
	switch ( arguments.length )
	{
	case 1:	// Assume a vec3
		_AngleZ = _AngleX.z;
		_AngleY = _AngleX.y;
		_AngleX = _AngleX.x;	// Replace as a scalar
		break;
	case 3:	// Assume 3 scalars
		break;
	default: throw "Invalid arguments count for mat4rotationZYX() !";
	}

	var sinx = Math.sin( _AngleX );
	var cosx = Math.cos( _AngleX );
	var siny = Math.sin( _AngleY );
	var cosy = Math.cos( _AngleY );
	var sinz = Math.sin( _AngleZ );
	var cosz = Math.cos( _AngleZ );

	var coszsiny = cosz * siny;
	var sinzsiny = sinz * siny;

	var	Result = {}.mat4(
	[
		cosz * cosy, sinz * cosy, -siny, 0,
		coszsiny * sinx - sinz * cosx, sinzsiny * sinx + cosz * cosx, cosy * sinx, 0,
		coszsiny * cosx + sinz * sinx, sinzsiny * cosx - cosz * sinx, cosy * cosx, 0,
		0, 0, 0, 1
	] );
	return Result;
};

// Computes the determinant of the matrix
function mat4cofactor( a, row, column )
{
	return	((	mat4getElement( a, row+1, column+1 )*mat4getElement( a, row+2, column+2 )*mat4getElement( a, row+3, column+3 ) +
				mat4getElement( a, row+1, column+2 )*mat4getElement( a, row+2, column+3 )*mat4getElement( a, row+3, column+1 ) +
				mat4getElement( a, row+1, column+3 )*mat4getElement( a, row+2, column+1 )*mat4getElement( a, row+3, column+2 ) )

			-(	mat4getElement( a, row+3, column+1 )*mat4getElement( a, row+2, column+2 )*mat4getElement( a, row+1, column+3 ) +
				mat4getElement( a, row+3, column+2 )*mat4getElement( a, row+2, column+3 )*mat4getElement( a, row+1, column+1 ) +
				mat4getElement( a, row+3, column+3 )*mat4getElement( a, row+2, column+1 )*mat4getElement( a, row+1, column+2 ) ))
			* (((row + column) & 1) == 1 ? -1.0 : +1.0);
}

// Computes the determinant of the matrix
function mat4determinant( a )
{
	return a.r0.x * mat4cofactor( a, 0, 0 ) + a.r0.y * mat4cofactor( a, 0, 1 ) + a.r0.z * mat4cofactor( a, 0, 2 ) + a.r0.w * mat4cofactor( a, 0, 3 );
}

// Returns the inverse of the matrix
function mat4inverse( a )
{
	var	Det = mat4determinant( a );
	if ( Math.abs( Det ) < 1e-6 )
		throw "Matrix is not inversible !";

	Det = 1.0 / Det;

	var	Result = {}.mat4( [
		{}.vec4( mat4cofactor( a, 0, 0 ) * Det, mat4cofactor( a, 1, 0 ) * Det, mat4cofactor( a, 2, 0 ) * Det, mat4cofactor( a, 3, 0 ) * Det ),
		{}.vec4( mat4cofactor( a, 0, 1 ) * Det, mat4cofactor( a, 1, 1 ) * Det, mat4cofactor( a, 2, 1 ) * Det, mat4cofactor( a, 3, 1 ) * Det ),
		{}.vec4( mat4cofactor( a, 0, 2 ) * Det, mat4cofactor( a, 1, 2 ) * Det, mat4cofactor( a, 2, 2 ) * Det, mat4cofactor( a, 3, 2 ) * Det ),
		{}.vec4( mat4cofactor( a, 0, 3 ) * Det, mat4cofactor( a, 1, 3 ) * Det, mat4cofactor( a, 2, 3 ) * Det, mat4cofactor( a, 3, 3 ) * Det ),
	] );

	return	Result;
}

function mat4trace( a )
{
	return mat4getElement( a, 0, 0 ) + mat4getElement( a, 1, 1 ) + mat4getElement( a, 2, 2 ) + mat4getElement( a, 3, 3 );
}

function mat2Quat( a )
{
	var	Result = {}.quat();

	var	Trace = mat4trace( a );
	if ( Trace > 1.0 )
	{
		var	s = Math.sqrt( Trace );
		Result.s = 0.5 * s;
		s = 0.5 / s;
		Result.i = s * (mat4getElement( a, 2, 1 ) - mat4getElement( a, 1, 2 ));
		Result.j = s * (mat4getElement( a, 0, 2 ) - mat4getElement( a, 2, 0 ));
		Result.k = s * (mat4getElement( a, 1, 0 ) - mat4getElement( a, 0, 1 ));
	}
	else
	{
		var		i,  j,  k;
		var		mi, mj, mk;

		i = mi = 0;
		if ( mat4getElement( a, 1, 1 ) > mat4getElement( a, 0, 0 ) )
			i = mi = 1;
		if ( mat4getElement( a, 2, 2 ) > mat4getElement( a, i, i ) )
			i = mi = 2;

		j = i + 1;
		mj = (mi+1) % 3;
		k = j + 1;
		mk = (mj+1) % 3;

		s = Math.sqrt( (mat4getElement( a, mi, mi ) - (mat4getElement( a, mj, mj ) + mat4getElement( a, mk, mk ))) + 1.0 );
		quatSetVectorElement( Result, i, s * 0.5 );

		if ( Math.abs( s ) > 1e-10 )
			s = 0.5 / s;

		Result.s = s * (mat4getElement( a, mj, mk ) - mat4getElement( a, mk, mj ));
		quatSetVectorElement( Result, j, s * (mat4getElement( a, mj, mi ) + mat4getElement( a, mi, mj )) );
		quatSetVectorElement( Result, k, s * (mat4getElement( a, mk, mi ) + mat4getElement( a, mi, mk )) );
	}

	return	Result;
}

// Creates a look at camera matrix
function mat4lookAt( position, target, up )
{

}

// Creates a perspective projection matrix
//	_FOV in radians
//	_Near, near clip distance
//	_Far, far clip distance
function mat4Perspective( _FOV, _Near, _Far )
{
	
}


// 	static NjFloat4x4	PRS( const NjFloat3& P, const NjFloat4& R, const NjFloat3& S );


//////////////////////////////////////////////////////////////////////////
// Polynomial solver
patapi.helpers.Extend( Math,
{
	// Returns the array of roots for any polynomial of degree 0 to 4
	//
	SolvePolynomial : function( a, b, c, d, e )
	{
		if ( e != 0.0 )
			return Math.SolveQuartic( a, b, c, d, e );
		else if ( d != 0.0 )
			return Math.SolveCubic( a, b, c, d );
		else if ( c != 0.0 )
			return Math.SolveQuadratic( a, b, c );

		return Math.SolveLinear( a, b );
	},

	// Returns the array of 1 real root of a linear polynomial  a + b x = 0
	//
	SolveLinear : function( a, b )
	{
		if ( b == 0.0 )
			return [undefined];

		return [-a / b];
	},

	// Returns the array of 2 real roots of a quadratic polynomial  a + b x + c x^2 = 0
	// NOTE: If roots are imaginary, the returned value in the array will be "undefined"
	//
	SolveQuadratic : function( a, b, c )
	{
		if ( c == 0.0 )
			throw "3th coefficient is 0! You should resolve a linear polynomial instead !"

		var	Delta = b * b - 4 * a * c;
		if ( Delta < 0.0 )
			return	[undefined, undefined];

		Delta = Math.sqrt( Delta );
		var	OneOver2a = 0.5 / a;

		return	[OneOver2a * (-b - Delta), OneOver2a * (-b + Delta)];
	},

	// Returns the array of 3 real roots of a cubic polynomial  a + b x + c x^2 + d x^3 = 0
	// NOTE: If roots are imaginary, the returned value in the array will be "undefined"
	// Code from http://www.codeguru.com/forum/archive/index.php/t-265551.html (pretty much the same as http://mathworld.wolfram.com/CubicFormula.html)
	//
	SolveCubic : function( a, b, c, d )
	{
		if ( d == 0.0 )
			throw "4th coefficient is 0! You should resolve a quadratic polynomial instead !"

		// Adjust coefficients
		var a1 = c / d;
		var a2 = b / d;
		var a3 = a / d;

		var Q = (a1 * a1 - 3 * a2) / 9;
		var R = (2 * a1 * a1 * a1 - 9 * a1 * a2 + 27 * a3) / 54;
		var Qcubed = Q * Q * Q;
		var d = Qcubed - R * R;

		var	Result = [];
		if ( d >= 0 )
		{	// Three real roots
			if ( Q < 0.0 )
				return [undefined, undefined, undefined];

			var theta = Math.acos( R / Math.sqrt(Qcubed) );
			var sqrtQ = Math.sqrt( Q );

			Result[0] = -2 * sqrtQ * Math.cos( theta / 3) - a1 / 3;
			Result[1] = -2 * sqrtQ * Math.cos( (theta + 2 * Math.PI) / 3 ) - a1 / 3;
			Result[2] = -2 * sqrtQ * Math.cos( (theta + 4 * Math.PI) / 3 ) - a1 / 3;
		}
		else
		{	// One real root
			var e = Math.pow( Math.sqrt( -d ) + Math.abs( R ), 1.0 / 3.0 );
			if ( R > 0 )
				e = -e;

			Result[0] = Result[1] = Result[2] = (e + Q / e) - a1 / 3.0;
		}

		return	Result;
	},

	// Returns the array of 4 real roots of a quartic polynomial  a + b x + c x^2 + d x^3 + e x^4 = 0
	// NOTE: If roots are imaginary, the returned value in the array will be "undefined"
	// Code from http://mathworld.wolfram.com/QuarticEquation.html
	//
	SolveQuartic : function( a, b, c, d, e )
	{
		if ( e == 0.0 )
			throw "5th coefficient is 0! You should resolve a cubic polynomial instead !"

		// Adjust coefficients
		var a0 = a / e;
		var a1 = b / e;
		var a2 = c / e;
		var a3 = d / e;

		// Find a root for the following cubic equation : y^3 - a2 y^2 + (a1 a3 - 4 a0) y + (4 a2 a0 - a1 ^2 - a3^2 a0) = 0
		var	b0 = 4 * a2 * a0 - a1 * a1 - a3 * a3 * a0;
		var	b1 = a1 * a3 - 4 * a0;
		var	b2 = -a2;
		var	Roots = Math.SolveCubic( b0, b1, b2, 1 );
		var	y = Math.max( Roots[0], Math.max( Roots[1], Roots[2] ) );

		// Compute R, D & E
		var	R = 0.25 * a3 * a3 - a2 + y;
		if ( R < 0.0 )
			return [undefined, undefined, undefined, undefined];
		R = Math.sqrt( R );

		var	D, E;
		if ( R == 0.0 )
		{
			D = Math.sqrt( 0.75 * a3 * a3 - 2 * a2 + 2 * Math.sqrt( y * y - 4 * a0 ) );
			E = Math.sqrt( 0.75 * a3 * a3 - 2 * a2 - 2 * Math.sqrt( y * y - 4 * a0 ) );
		}
		else
		{
			var	Rsquare = R * R;
			var	Rrec = 1.0 / R;
			D = Math.sqrt( 0.75 * a3 * a3 - Rsquare - 2 * a2 + 0.25 * Rrec * (4 * a3 * a2 - 8 * a1 - a3 * a3 * a3) );
			E = Math.sqrt( 0.75 * a3 * a3 - Rsquare - 2 * a2 - 0.25 * Rrec * (4 * a3 * a2 - 8 * a1 - a3 * a3 * a3) );
		}

		// Compute the 4 roots
		var	Result =
		[
			-0.25 * a3 + 0.5 * R + 0.5 * D,
			-0.25 * a3 + 0.5 * R - 0.5 * D,
			-0.25 * a3 - 0.5 * R + 0.5 * E,
			-0.25 * a3 - 0.5 * R - 0.5 * E
		];

		return	Result;
	}
} );




// 3D Vector
// Math3D.vec3 = function( x, y, z )
// {
// 	x = x || 0.0;
// 	y = y || 0.0;
// 	z = z || 0.0;
// }
// 
// Math3D.vec3.prototype =
// {
// 	set : function( x, y, z )	{ this.x = x; this.y = y; this.z = z; },
// 	add : function( b )		{ return new Math3D.vec3( this.x+b.x, this.y+b.y, this.z+b.z ); },
// 	sub : function( b )		{ return new Math3D.vec3( this.x-b.x, this.y-b.y, this.z-b.z ); },
// 	mul : function( b )		{ return new Math3D.vec3( this.x*b.x, this.y*b.y, this.z*b.z ); },
// 	div : function( b )		{ return new Math3D.vec3( this.x/b.x, this.y/b.y, this.z/b.z ); },
// 	lengthSq : function()	{ return this.x*this.x + this.y*this.y + this.z*this.z; },
// 	length : function()		{ return Math.sqrt( this.lengthSq() ); },
// 	normalized : function()	{ var l = 1.0 / this.length(); return new Math3D.vec3( this.x * l, this.y * l, this.z * l ); },
// 	dot : function( b )		{ return this.x*b.x + this.y*b.y + this.z*b.z; },
// 	cross : function( b )	{ return new Math3D.vec3( this.y*b.z - this.z*b.y, this.z*b.x - this.x*b.z, this.x*b.y - this.y*b.x ); },
// 
// 	// 2-terms swizzle
// 	xx : function()	{ return new Math3D.vec2( this.x, this.x ); },
// 	xy : function()	{ return new Math3D.vec2( this.x, this.y ); },
// 	xz : function()	{ return new Math3D.vec2( this.x, this.z ); },
// 	yx : function()	{ return new Math3D.vec2( this.y, this.x ); },
// 	yy : function()	{ return new Math3D.vec2( this.y, this.y ); },
// 	yz : function()	{ return new Math3D.vec2( this.y, this.z ); },
// 	zx : function()	{ return new Math3D.vec2( this.z, this.x ); },
// 	zy : function()	{ return new Math3D.vec2( this.z, this.y ); },
// 	zz : function()	{ return new Math3D.vec2( this.z, this.z ); },
// 
// 	// Funky 3-terms swizzle
// 	xxx : function()	{ return new Math3D.vec3( this.x, this.x, this.x ); },
// 	xxy : function()	{ return new Math3D.vec3( this.x, this.x, this.y ); },
// 	xxz : function()	{ return new Math3D.vec3( this.x, this.x, this.z ); },
// 	xyx : function()	{ return new Math3D.vec3( this.x, this.y, this.x ); },
// 	xyy : function()	{ return new Math3D.vec3( this.x, this.y, this.y ); },
// 	xyz : function()	{ return new Math3D.vec3( this.x, this.y, this.z ); },
// 	xzx : function()	{ return new Math3D.vec3( this.x, this.z, this.x ); },
// 	xzy : function()	{ return new Math3D.vec3( this.x, this.z, this.y ); },
// 	xzz : function()	{ return new Math3D.vec3( this.x, this.z, this.z ); },
// 	yxx : function()	{ return new Math3D.vec3( this.y, this.x, this.x ); },
// 	yxy : function()	{ return new Math3D.vec3( this.y, this.x, this.y ); },
// 	yxz : function()	{ return new Math3D.vec3( this.y, this.x, this.z ); },
// 	yyx : function()	{ return new Math3D.vec3( this.y, this.y, this.x ); },
// 	yyy : function()	{ return new Math3D.vec3( this.y, this.y, this.y ); },
// 	yyz : function()	{ return new Math3D.vec3( this.y, this.y, this.z ); },
// 	yzx : function()	{ return new Math3D.vec3( this.y, this.z, this.x ); },
// 	yzy : function()	{ return new Math3D.vec3( this.y, this.z, this.y ); },
// 	yzz : function()	{ return new Math3D.vec3( this.y, this.z, this.z ); },
// 	zxx : function()	{ return new Math3D.vec3( this.z, this.x, this.x ); },
// 	zxy : function()	{ return new Math3D.vec3( this.z, this.x, this.y ); },
// 	zxz : function()	{ return new Math3D.vec3( this.z, this.x, this.z ); },
// 	zyx : function()	{ return new Math3D.vec3( this.z, this.y, this.x ); },
// 	zyy : function()	{ return new Math3D.vec3( this.z, this.y, this.y ); },
// 	zyz : function()	{ return new Math3D.vec3( this.z, this.y, this.z ); },
// 	zzx : function()	{ return new Math3D.vec3( this.z, this.z, this.x ); },
// 	zzy : function()	{ return new Math3D.vec3( this.z, this.z, this.y ); },
// 	zzz : function()	{ return new Math3D.vec3( this.z, this.z, this.z ); },
// };


// alert( Math.sign( -4 ) );
// alert( Math.abs( -4 ) );
// alert( Math3D.matrix4.getEulerAngles( Math3D.matrix4.rotationX( 0.1 ) ) )

// mul : function( b )	{ b instanceof Object ? this.x *= b.x, this.y *= b.y : this.x *= b, this.y *= b; },
// 
// 
// Object.prototype.vec2 = function(x, y)		{ this.x = x; this.y = y; }
// {}.vec2( 1, 2 )
// 
// 
// 
// var Toto = new Pipo();
// 
// 
// 
// function new(constructor, args)			{
// 	var NouvelObject = {};
// 	constructor.call(NouvelObject, args);
// 	return NouvelObject;
// }	
// 
// 
// function Patapom() {
//    this.trouducul = ToutNoir;
// }
// Patapom.prototype = {
// 
// };
// Patapom.prototype.constructor = Patapom;
*/