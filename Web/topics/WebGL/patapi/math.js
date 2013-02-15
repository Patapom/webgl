// Extensions of the standard math library
// We define vector types that look like and are used like the vector types of GLSL (including swizzling!).
// We also define convenient quat and mat4 types.
//
o3djs.require('patapi.base');
o3djs.provide('patapi.math');

patapi.math = patapi.math || {};


////////////////////////////////////////////////////////////////////////////
// Extends the standard math object
//
patapi.helpers.Extend( Math,
{
	FOURPI : 12.566370614359172953850573533118,		// 4PI
	TWOPI : 6.283185307179586476925286766559,		// 2PI
	HALFPI : 1.5707963267948966192313216916398,		// PI/2
	INVPI : 0.31830988618379067153776752674503,		// 1/PI
	INVHALFPI : 0.63661977236758134307553505349006,	// 2/PI
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
	almost : function( a, b )			{ return Math.abs( a - b ) < 1e-6; },
} );


////////////////////////////////////////////////////////////////////////////
// Vectors

// 2D Vector
vec2 = function( x, y )				{ return this.set( x, y ); }
vec2.unitX = function()				{ return new vec2( 1, 0 ); }
vec2.unitY = function()				{ return new vec2( 0, 1 ); }
vec2.zero = function()				{ return new vec2( 0, 0 ); }
vec2.one = function()				{ return new vec2( 1, 1 ); }
vec2.array2Floats = function( a )	{ var R = []; for ( var i=0; i < a.length; i++ ) { R.push( a[i].x ); R.push( a[i].y ); } return R; }	// Converts a vec2[] into a float[]

// All these functions use "this" as the left member
// Functions with a "_" suffix return a NEW vector
vec2.prototype =
{
	set : function( x, y )
	{
		if ( y !== undefined )
		{	// Assume 2 scalars
			this.x = x;
			this.y = y;
		}
		else if ( x !== undefined )
		{	// Assume another vec2 or an array or a scalar
			if ( x instanceof vec2 )
			{
				this.x = x.x;
				this.y = x.y;
			}
			else if ( x instanceof Array )
			{
				this.x = x[0];
				this.y = x[1];
			}
			else
				this.x = this.y = x;
		}
		else
			this.x = this.y = 0.0;	// No argument

		return this;
	}
	, neg : function()				{ this.x = -this.x; this.y = -this.y; return this; }
	, neg_ : function()				{ return new vec2( this ).neg(); }
	, add : function( b )
	{
		if ( b instanceof vec2 )	{ this.x += b.x; this.y += b.y; }
		else { this.x += b; this.y += b; }
		return this;
	}
	, add_ : function( b )			{ return new vec2( this ).add( b ); }
	, sub : function( b )
	{
		if ( b instanceof vec2 )	{ this.x -= b.x; this.y -= b.y; }
		else { this.x -= b; this.y -= b; }
		return this;
	}
	, sub_ : function( b )			{ return new vec2( this ).sub( b ); }
	, mul : function( b )
	{
		if ( b instanceof vec2 )	{ this.x *= b.x; this.y *= b.y; }
		else { this.x *= b; this.y *= b; }
		return this;
	}
	, mul_ : function( b )			{ return new vec2( this ).mul( b ); }
	, div : function( b )
	{
		if ( b instanceof vec2 )	{ this.x /= b.x; this.y /= b.y; }
		else { this.x /= b; this.y /= b; }
		return this;
	}
	, div_ : function( b )			{ return new vec2( this ).div( b ); }
	, min : function( b )
	{
		if ( b === undefined )
			return Math.min( this.x, this.y );
		if ( b instanceof vec2 )
		{	// Constrain using the other vector
			this.x = Math.min( this.x, b.x );
			this.y = Math.min( this.y, b.y );
		}
		else
		{	// Constrain using a scalar
			this.x = Math.min( this.x, b );
			this.y = Math.min( this.y, b );
		}
		return this;
	}
	, min_ : function( b )			{ return new vec2( this ).min( b ); }
	, max : function( b )
	{
		if ( b === undefined )
			return Math.max( this.x, this.y );
		if ( b instanceof vec2 )
		{	// Constrain using the other vector
			this.x = Math.max( this.x, b.x );
			this.y = Math.max( this.y, b.y );
		}
		else
		{	// Constrain using a scalar
			this.x = Math.max( this.x, b );
			this.y = Math.max( this.y, b );
		}
		return this;
	}
	, max_ : function( b )			{ return new vec2( this ).max( b ); }
	, lengthSq : function()			{ return this.x*this.x + this.y*this.y; return this; }
	, length : function()			{ return Math.sqrt( this.x*this.x + this.y*this.y ); return this; }
	, normalize : function()		{ var l = 1.0 / this.length(); this.x *= l; this.y *= l; return this; }
	, normalized : function()		{ var l = 1.0 / this.length(); return new vec2( this.x * l, this.y * l ); }
	, dot : function( b )			{ return this.x*b.x + this.y*b.y; }
	, cross : function( b )			{ return new vec3( 0.0, 0.0, this.x*b.y - this.y*b.x ); }
	, asVec3 : function( z )		{ return new vec3( this, z ); }
	, asVec4 : function( z, w )		{ return new vec4( this, z, w ); }
	, asArray : function()			{ return [this.x, this.y]; }
	, getElement : function( xy )
	{
		switch ( xy & 1 )
		{
		case 0: return this.x;
		case 1: return this.y;
		}
	}
	, setElement : function( xy, value )
	{
		switch ( xy & 1 )
		{
		case 0: this.x = value; break;
		case 1: this.y = value; break;
		}
		return this;
	}
};


// 3D Vector
vec3 = function( x, y, z )			{ return this.set( x, y, z ); }
vec3.unitX = function()				{ return new vec3( 1, 0, 0 ); }
vec3.unitY = function()				{ return new vec3( 0, 1, 0 ); }
vec3.unitZ = function()				{ return new vec3( 0, 0, 1 ); }
vec3.zero = function()				{ return new vec3( 0, 0, 0 ); }
vec3.one = function()				{ return new vec3( 1, 1, 1 ); }
vec3.array2Floats = function( a )	{ var R = []; for ( var i=0; i < a.length; i++ ) { R.push( a[i].x ); R.push( a[i].y ); R.push( a[i].z ); } return R; }	// Converts a vec3[] into a float[]

// All these functions use "this" as the left member
// Functions with a "_" suffix return a NEW vector
vec3.prototype =
{
	set : function( x, y, z )
	{
		if ( z !== undefined )
		{	// Assume 3 floats
			this.x = x;
			this.y = y;
			this.z = z;
		}
		else if ( y !== undefined )
		{	// Assume a vec2 and a float
			if ( !(x instanceof vec2) )
				throw "Expected vec2 + scalar!";
			this.x = x.x;
			this.y = x.y;
			this.z = y;
		}
		else if ( x !== undefined )
		{	// Assume another vec3 or an array or a scalar
			if ( x instanceof vec3 )
			{
				this.x = x.x;
				this.y = x.y;
				this.z = x.z;
			}
			else if ( x instanceof Array )
			{
				this.x = x[0];
				this.y = x[1];
				this.z = x[2];
			}
			else
				this.x = this.y = this.z = x;
		}
		else
			this.x = this.y = this.z = 0.0;

		return this;
	}
	, neg : function()				{ this.x = -this.x; this.y = -this.y; this.z = -this.z; return this; }
	, neg_ : function()				{ return new vec3( this ).neg(); }
	, add : function( b )
	{
		if ( b instanceof vec3 )	{ this.x += b.x;	this.y += b.y;	this.z += b.z; }
		else						{ this.x += b;		this.y += b;	this.z += b; }
		return this;
	}
	, add_ : function( b )			{ return new vec3( this ).add( b ); }
	, sub : function( b )
	{
		if ( b instanceof vec3 )	{ this.x -= b.x;	this.y -= b.y;	this.z -= b.z; }
		else						{ this.x -= b;		this.y -= b;	this.z -= b; }
		return this;
	}
	, sub_ : function( b )			{ return new vec3( this ).sub( b ); }
	, mul : function( b )
	{
		if ( b instanceof vec3 )	{ this.x *= b.x;	this.y *= b.y;	this.z *= b.z; }
		else						{ this.x *= b;		this.y *= b;	this.z *= b; }
		return this;
	}
	, mul_ : function( b )			{ return new vec3( this ).mul( b ); }
	, div : function( b )
	{
		if ( b instanceof vec3 )	{ this.x /= b.x;	this.y /= b.y;	this.z /= b.z; }
		else						{ this.x /= b;		this.y /= b;	this.z /= b; }
		return this;
	}
	, div_ : function()				{ return new vec3( this ).div( b ); }
	, min : function( b )
	{
		if ( b === undefined )
			return Math.min( Math.min( this.x, this.y ), this.z );
		if ( b instanceof vec3 )
		{	// Constrain using the other vector
			this.x = Math.min( this.x, b.x );
			this.y = Math.min( this.y, b.y );
			this.z = Math.min( this.z, b.z );
		}
		else
		{	// Constrain using a scalar
			this.x = Math.min( this.x, b );
			this.y = Math.min( this.y, b );
			this.z = Math.min( this.z, b );
		}
		return this;
	}
	, min_ : function( b )			{ return new vec3( this ).min( b ); }
	, max : function( b )
	{
		if ( b === undefined )
			return Math.max( Math.max( this.x, this.y ), this.z );
		if ( b instanceof vec3 )
		{	// Constrain using the other vector
			this.x = Math.max( this.x, b.x );
			this.y = Math.max( this.y, b.y );
			this.z = Math.max( this.z, b.z );
		}
		else
		{	// Constrain using a scalar
			this.x = Math.max( this.x, b );
			this.y = Math.max( this.y, b );
			this.z = Math.max( this.z, b );
		}
		return this;
	}
	, max_ : function( b )			{ return new vec3( this ).max( b ); }
	, lengthSq : function()			{ return this.x*this.x + this.y*this.y + this.z*this.z; }
	, length : function()			{ return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z ); }
	, normalize : function()		{ var l = 1.0 / this.length(); this.x *= l; this.y *= l; this.z *= l; return this; }
	, normalized : function()		{ var l = 1.0 / this.length(); return new vec3( this.x * l, this.y * l, this.z * l ); }
	, dot : function( b )			{ return this.x*b.x + this.y*b.y + this.z*b.z; }
//	, cross : function( b )			{ var Temp = [this.y*b.z - this.z*b.y, this.z*b.x - this.x*b.z, this.x*b.y - this.y*b.x]; this.x = Temp[0]; this.y = Temp[1]; this.z = Temp[2]; return this; }
	, cross : function( b )			{ return new vec3( this.y*b.z - this.z*b.y, this.z*b.x - this.x*b.z, this.x*b.y - this.y*b.x ); }
	, asVec4 : function( w )		{ return new vec4( this.x, this.y, this.z, w ); }
	, asArray : function()			{ return [this.x, this.y, this.z]; }
	, getElement : function( xyz )
	{
		switch ( xyz % 3 )
		{
		case 0: return this.x;
		case 1: return this.y;
		case 2: return this.z;
		}
	}
	, setElement : function( xyz, value )
	{
		switch ( xyz % 3 )
		{
		case 0: this.x = value; break;
		case 1: this.y = value; break;
		case 2: this.z = value; break;
		}
		return this;
	}

	// Rotate the current vector about _Axis by _Angle radians
	, rotate : function( _Axis, _Angle )
	{
		var	Cos = Math.cos( _Angle );
		var	Sin = Math.sin( _Angle );

		var	Dot = this.dot( _Axis ) * (1.0 - Cos);

		var	Cross = _Axis.cross( this );

		this.x = this.x * Cos + Cross.x * Sin + Dot * _Axis.x;
		this.y = this.y * Cos + Cross.y * Sin + Dot * _Axis.y;
		this.z = this.z * Cos + Cross.z * Sin + Dot * _Axis.z;
	}
}


// 4D Vector
vec4 = function( x, y, z, w )		{ return this.set( x, y, z, w ); }
vec4.unitX = function()				{ return new vec4( 1, 0, 0, 0 ); }
vec4.unitY = function()				{ return new vec4( 0, 1, 0, 0 ); }
vec4.unitZ = function()				{ return new vec4( 0, 0, 1, 0 ); }
vec4.unitW = function()				{ return new vec4( 0, 0, 0, 1 ); }
vec4.zero = function()				{ return new vec4( 0, 0, 0, 0 ); }
vec4.one = function()				{ return new vec4( 1, 1, 1, 1 ); }
vec4.array2Floats = function( a )	{ var R = []; for ( var i=0; i < a.length; i++ ) { R.push( a[i].x ); R.push( a[i].y ); R.push( a[i].z ); R.push( a[i].w ); } return R; }	// Converts a vec4[] into a float[]

// All these functions use "this" as the left member
// Functions with a "_" suffix return a NEW vector
vec4.prototype =
{
	set : function( x, y, z, w )
	{
		if ( w !== undefined )
		{	// Assume 4 floats
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}
		else if ( z !== undefined )
		{	// Assume a vec2 and 2 floats
			if ( !(x instanceof vec2) )
				throw "Expected vec2 + 2*scalar!";
			this.x = x.x;
			this.y = x.y;
			this.z = y;
			this.w = z;
		}
		else if ( y !== undefined )
		{	// Assume a vec3 and a float
			if ( !(x instanceof vec3) )
				throw "Expected vec3 + scalar!";
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
			this.w = y;
		}
		else if ( x !== undefined )
		{	// Assume another vec4 or an array or even a scalar
			if ( x instanceof vec4 )
			{
				this.x = x.x;
				this.y = x.y;
				this.z = x.z;
				this.w = x.w;
			}
			else if ( x instanceof Array )
			{
				this.x = x[0];
				this.y = x[1];
				this.z = x[2];
				this.w = x[3];
			}
			else
				this.x = this.y = this.z = this.w = x;	// Assume a scalar?
		}
		else
			this.x = this.y = this.z = this.w = 0.0;

		return this;
	}

	, neg : function()				{ this.x = -this.x; this.y = -this.y; this.z = -this.z; this.w = -this.w; return this; }
	, neg_ : function()				{ return new vec4( this ).neg(); }
	, add : function( b )
	{
		if ( b instanceof vec4 )	{ this.x += b.x; this.y += b.y; this.z += b.z; this.w += b.w; }
		else						{ this.x += b; this.y += b; this.z += b; this.w += b; }
		return this;
	}
	, add_ : function( b )			{ return new vec4( this ).add( b ); }
	, sub : function( b )
	{
		if ( b instanceof vec4 )	{ this.x -= b.x; this.y -= b.y; this.z -= b.z; this.w -= b.w; }
		else						{ this.x -= b; this.y -= b; this.z -= b; this.w -= b; }
		return this;
	}
	, sub_ : function( b )			{ return new vec4( this ).sub( b ); }
	, mul : function( b )
	{
		if ( b instanceof vec4 )	{ this.x *= b.x; this.y *= b.y; this.z *= b.z; this.w *= b.w; }
		else if ( b instanceof mat4 )
		{	// Vector * Matrix
			var	Temp = [	this.x*b.r0.x + this.y*b.r1.x + this.z*b.r2.x + this.w*b.r3.x,
							this.x*b.r0.y + this.y*b.r1.y + this.z*b.r2.y + this.w*b.r3.y,
							this.x*b.r0.z + this.y*b.r1.z + this.z*b.r2.z + this.w*b.r3.z,
							this.x*b.r0.w + this.y*b.r1.w + this.z*b.r2.w + this.w*b.r3.w
						];
			this.x = Temp[0]; this.y = Temp[1]; this.z = Temp[2]; this.w = Temp[3];
		}
		else 						{ this.x *= b; this.y *= b; this.z *= b; this.w *= b; }
		return this;
	}
	, mul_ : function( b )			{ return new vec4( this ).mul( b ); }
	, div : function( b )
	{
		if ( b instanceof vec4 )	{ this.x /= b.x; this.y /= b.y; this.z /= b.z; this.w /= b.w; }
		else						{ this.x /= b; this.y /= b; this.z /= b; this.w /= b; }
		return this;
	}
	, div_ : function( b )			{ return new vec4( this ).div( b ); }
	, min : function( b )
	{
		if ( b === undefined )
			return Math.min( Math.min( Math.min( this.x, this.y ), this.z ), this.w );
		if ( b instanceof vec4 )
		{	// Constrain using the other vector
			this.x = Math.min( this.x, b.x );
			this.y = Math.min( this.y, b.y );
			this.z = Math.min( this.z, b.z );
			this.w = Math.min( this.w, b.w );
		}
		else
		{	// Constrain using a scalar
			this.x = Math.min( this.x, b );
			this.y = Math.min( this.y, b );
			this.z = Math.min( this.z, b );
			this.w = Math.min( this.w, b );
		}
		return this;
	}
	, min_ : function( b )			{ return new vec4( this ).min( b ); }
	, max : function( b )
	{
		if ( b === undefined )
			return Math.max( Math.max( Math.max( this.x, this.y ), this.z ), this.w );
		if ( b instanceof vec4 )
		{	// Constrain using the other vector
			this.x = Math.max( this.x, b.x );
			this.y = Math.max( this.y, b.y );
			this.z = Math.max( this.z, b.z );
			this.w = Math.max( this.w, b.w );
		}
		else
		{	// Constrain using a scalar
			this.x = Math.max( this.x, b );
			this.y = Math.max( this.y, b );
			this.z = Math.max( this.z, b );
			this.w = Math.max( this.w, b );
		}
		return this;
	}
	, min_ : function( b )			{ return new vec3( this ).max( b ); }
	, lengthSq : function()			{ return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w; }
	, length : function()			{ return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w ); }
	, normalize : function()		{ var l = 1.0 / this.length( a ); this.x *= l; this.y *= l; this.z *= l; this.w *= l; return this; }
	, normalized : function()		{ var l = 1.0 / this.length( a ); return new vec4( this.x * l, this.y * l, this.z * l, this.w * l ); }
	, dot : function( b )			{ return this.x*b.x + this.y*b.y + this.z*b.z + this.w*b.w; }
	, asArray : function()			{ return [this.x, this.y, this.z, this.w]; }
	, getElement : function( xyzw )
	{
		switch ( xyzw & 3 )
		{
		case 0: return this.x;
		case 1: return this.y;
		case 2: return this.z;
		case 3: return this.w;
		}
	}
	, setElement : function( xyzw, value )
	{
		switch ( xyzw & 3 )
		{
		case 0: this.x = value; break;
		case 1: this.y = value; break;
		case 2: this.z = value; break;
		case 3: this.w = value; break;
		}
		return this;
	}
}


////////////////////////////////////////////////////////////////////////////
// Quaternions
quat = function( s, i, j, k )					{ return this.set( s, i, j, k ); }
quat.identity = function()						{ return new quat( 1, 0, 0, 0 ); }
quat.fromAngleAxis = function( angle, axis )	{ return new quat().fromAngleAxis( angle, axis ); }

// All these functions use "this" as the left member
// Functions with a "_" suffix return a NEW vector
quat.prototype =
{
	set : function( s, i, j, k )
	{
		if ( k !== undefined )
		{	// Assume 4 floats
			this.s = s;
			this.v = new vec3( i, j, k );
		}
		else if ( j !== undefined )
			throw "Unsupported construction!";	// Can't build from only 3 parameters!
		else if ( i !== undefined )
		{	// Assume a float and a vec3
			if ( !(i instanceof vec3) )
				throw "Expected vec3 + scalar!";
			this.s = s;
			this.v = new vec3( i );
		}
		else if ( s !== undefined )
		{	// Assume another quat or an array
			if ( s instanceof quat )
			{
				this.s = s.s;
				this.v = new vec3( s.v );
			}
			else if ( s instanceof Array )
			{
				this.s = s[0];
				this.v = new vec3( s[1], s[2], s[3] );
			}
			else
			{	// Assume a scalar?
				this.s = s;
				this.v = new vec3( s );
			}
		}
		else
		{	// Make identity
			this.s = 1.0;
			this.v = new vec3();
		}

		return this;
	}
	, neg : function()				{ this.s = -this.s; this.v.neg(); return this; }
	, neg_ : function()				{ return new quat( this ).neg(); }
	, add : function( b )			{ this.s += b.s; this.v.add( b.v ); return this; }
	, add_ : function( b )			{ return new quat( this ).add( b ); }
	, sub : function( b )			{ this.s -= b.s; this.v.sub( b.v ); return this; }
	, sub_ : function( b )			{ return new quat( this ).sub( b ); }
	, mul : function( b )
	{
		if ( b instanceof quat )
		{	// Quaternion product
			var	Angle = this.s * b.s - this.v.dot( b.v );
			var	Axis = b.v.mul_( this.s ).add( this.v.mul_( b.s ) ).add( this.v.cross( b.v ) );

			this.fromAngleAxis( Angle, Axis );
		}
		else						{ this.s *= b; this.v.mul( b ); }	// Multiply by scalar
		return this;
	}
	, mul_ : function( b )			{ return new quat( this ).mul( b ); }
	, conjuguate : function()		{ this.v.neg(); return this; }
	, conjuguate_ : function()		{ return new quat( this ).conjuguate(); }
	, log : function()
	{
		var	Angle = Math.acos( this.s );
		var	Sine = Math.sin( Angle );
		var	Scale =  Math.abs( Sine ) > 1e-10 ? Angle / Sine : 1.0;
		this.v.mul( Scale );
		this.s = 0.0;
		return this;
	}
	, log_ : function()				{ return new quat( this ).log(); }
	, exp : function()
	{
		var	Angle = this.v.length();
		var	Scale = Angle > 1e-10 ? Math.Sin( Angle ) / Angle : 1.0;
		this.v.mul( Scale );
		this.s = Math.Cos( Angle );
		return this;
	}
	, exp_ : function()				{ return new quat( this ).exp(); }
	, dot : function( b )			{ return this.s*b.s + this.v.dot( b.v ); }
	, lengthSq : function()			{ return this.s*this.s + this.v.lengthSq(); }
	, length : function()			{ return Math.sqrt( this.s*this.s + this.v.lengthSq() ); }
	, normalize : function()		{ var l = 1.0 / this.length(); this.s *= l; this.v.mul( l ); return this; }
	, normalized : function()		{ var l = 1.0 / this.length(); return new quat( this.s * l, this.v.x * l, this.v.y * l, this.v.z * l ); }
	, fromAngleAxis : function( angle, axis )	{ this.s = Math.cos( 0.5 * angle ); var s = Math.sin( 0.5 * angle ); this.v.x = s * axis.x; this.v.y = s * axis.y; this.v.z = s * axis.z; return this; }
	, toMatrix : function()
	{
		var	q = this.normalized();	// A cast to a matrix only works with normalized quaternions!

		var xs = 2.0 * q.v.x,	ys = 2.0 * q.v.y,	zs = 2.0 * q.v.z;

		var	wx = q.s * xs,		wy = q.s * ys,		wz = q.s * zs;
		var	xx = q.v.x * xs,	xy = q.v.x * ys,	xz = q.v.x * zs;
		var	yy = q.v.y * ys,	yz = q.v.y * zs,	zz = q.v.z * zs;

		var	Result = new mat4(
		[	// First row
			1 -	yy - zz,
				xy + wz,
				xz - wy,
			0,

			// Second row
				xy - wz,
			1 -	xx - zz,
				yz + wx,
			0,

			// Third row
		 		xz + wy,
				yz - wx,
			1 -	xx - yy,
			0,

			// Fourth row
			0, 0, 0, 1
		] );
		return	Result;
	}
	, getElement : function( sijk )
	{
		switch ( sijk & 3 )
		{
		case 0: return this.s;
		case 1: return this.v.x;
		case 2: return this.v.y;
		case 3: return this.v.z;
		}
		return this;
	}
	, setElement : function( sijk, value )
	{
		switch ( sijk & 3 )
		{
		case 0: this.s = value; break;
		case 1: this.v.x = value; break;
		case 2: this.v.y = value; break;
		case 3: this.v.z = value; break;
		}
		return this;
	}
	, asArray : function()			{ return [this.s, this.i, this.j, this.k]; }
	// Converts this unit quaternion into a vec4 containing the axis in (x,y,z) and angle in w
	, asAngleAxis : function()
	{
		var	Angle = Math.acos( this.s );
		var	Sine = Math.sin( Angle );
		Angle *= 2.0;

		var	Axis = Math.abs( Sine ) > 1e-10 ? this.v.div_( Sine ) : vec3.zero();

		return new vec4( Axis, Angle );
	}

	// Spherical-linear interpolation between 2 unit quaternions
	, slerp : function( q1, t )
	{
		var	Cosine = this.dot( q1 );
		var	Sine = Math.sqrt( Math.abs( 1.0 - Cosine*Cosine ) );
		if ( Math.abs( Sine ) < 1e-10 )
			return	this;

		var	Angle = Math.atan2( Sine, Cosine );
		var	InvSine = 1.0 / Sine;

		var	c0 = Math.sin( (1-t) * Angle ) * InvSine;
		var	c1 = Math.sin(   t   * Angle ) * InvSine;

		return this.mul_( c0 ).add( q1.mul_( c1 ) );
	}

	// Builds a quaternion that performs the rotation of vector v0 into v1 (each of vec3 type) 
	, buildRot : function( v0, v1 )
	{
		var	Angle = Math.acos( v0.dot( v1 ) );
		if ( Math.abs( Angle ) < 1e-10 )
			return quat.identity();

		var	Axis = v0.cross( v1 ).normalize();

		return this.fromAngleAxis( Angle,Axis );
	}

	// Builds a quaternion that rotates the unit Z vector toward the provided _At vector
	, lookRotation : function( _At )
	{
		return this.buildRot( vec3.unitZ(), _At );
	}

	// Returns an object ready to use with the squad() function
	//	v0-3, the 4 consecutive key vectors in a sequence of vectors to interpolate smoothly. The 2 vectors to interpolate are v1 and v2.
	//
	//	returns an object of the type:
	//	{
	//		q0 : first quaternion for squad,
	//		t0 : second quaternion for squad,
	//		t1 : third quaternion for squad,
	//		q1 : fourth quaternion for squad,
	//		squad : function( t )	<== Performs squad and returns the interpolated vector
	//	}
	//
	, prepareSquad : function( v0, v1, v2, v3 )
	{
		// Build the quaternions for each of the vectors
		var	q0 = this.lookRotation( v0 );
		var	q1 = this.lookRotation( v1 );
		var	q2 = this.lookRotation( v2 );
		var	q3 = this.lookRotation( v3 );

		// Reverse if needed
		if ( this.checkReverse( q0, q1 ) ) q0.neg();
		if ( this.checkReverse( q1, q2 ) ) q2.neg();
		if ( this.checkReverse( q2, q3 ) ) q3.neg();

		// Build squad params
		var	ConjQ1 = q1.conjuguate_();
		var	ConjQ2 = q2.conjuguate_();
		var	t1 = ConjQ1.mul_( q0 ).log().add( ConjQ1.mul_( q2 ).log() ).mul( -0.25 ).exp().mul( q1 );
		var	t2 = ConjQ2.mul_( q1 ).log().add( ConjQ2.mul_( q3 ).log() ).mul( -0.25 ).exp().mul( q2 );

		// Build the result object
		var	Result =
		{
			q0 : q1,	// Start quat
			t0 : t1,	// Start tangent
			t1 : t2,	// End tangent
			q1 : q2,	// End quat

			// Spherical-cubic interpolation between 2 unit quaternions using 2 "unit tangent quaternions"
			// Yields a vec3 that represents the interpolated view vector
			squad : function( t )
			{
				// Squad, as explained in http://www.itu.dk/people/erikdam/DOWNLOAD/98-5.pdf pp. 51 (originaly from Shoemake, 1987)
				var	InterpolatedQuaternion = this.q0.slerp( this.q1, t )
				var	InterpolatedTangent = this.t0.slerp( this.t1, t );
				var	q = InterpolatedQuaternion.slerp( InterpolatedTangent, 2.0 * t * (1.0 - t) );

				var	AngleAxis = q.asAngleAxis();

				var	InitialDirection = vec3.unitZ();
				var	Ortho = AngleAxis.xyz.cross( InitialDirection ).normalize();
				var	FinalDirection = InitialDirection.mul( Math.cos( AngleAxis.w ) ).add( Ortho.mul( Math.sin( AngleAxis.w ) ) );

				return FinalDirection;
			}
		};
		return Result;
	}

	// Tells if one of the quaternion needs to be reversed to obtain the shortest distance between the two
	, checkReverse : function( q0, q1 )
	{
		var	L0 = q0.add_( q1 ).length();
		var	L1 = q0.sub_( q1 ).length();
		return L0 < L1;
	}
};


////////////////////////////////////////////////////////////////////////////
// Matrices
// Should be initialized with an array of 16 floats or an array of 4 vec4
mat4 = function( a )	{ return this.set( a ); }
mat4.identity = function()										{ return new mat4(); }
mat4.rotationZYX = function( _AngleX, _AngleY, _AngleZ )		{ return new mat4().makeRotationZYX( _AngleX, _AngleY, _AngleZ ); }
mat4.lookAt = function( _Position, _Target, _Up )				{ return new mat4().makeLookAt( _Position, _Target, _Up ); }
mat4.perspective = function( _FOV, _AspectRatio, _Near, _Far )	{ return new mat4().makePerspective( _FOV, _AspectRatio, _Near, _Far ); }

// All these functions use "this" as the left member
// Functions with a "_" suffix return a NEW vector
mat4.prototype =
{
	set : function( a )
	{
		if ( a !== undefined )
		{
			if ( a instanceof mat4 )
			{	// Copy from another matrix
				this.r0 = new vec4( a.r0 );
				this.r1 = new vec4( a.r1 );
				this.r2 = new vec4( a.r2 );
				this.r3 = new vec4( a.r3 );
			}
			else if ( a instanceof Array )
			{	// Copy from an array of values
				switch ( a.length )
				{
				case 4:	// Assume an array of vec4
					this.r0 = new vec4( a[0] );
					this.r1 = new vec4( a[1] );
					this.r2 = new vec4( a[2] );
					this.r3 = new vec4( a[3] );
					break;

				case 16: // Assume an array of 16 floats
					this.r0 = new vec4( a[4*0+0], a[4*0+1], a[4*0+2], a[4*0+3] );
					this.r1 = new vec4( a[4*1+0], a[4*1+1], a[4*1+2], a[4*1+3] );
					this.r2 = new vec4( a[4*2+0], a[4*2+1], a[4*2+2], a[4*2+3] );
					this.r3 = new vec4( a[4*3+0], a[4*3+1], a[4*3+2], a[4*3+3] );
					break;

				default:
					throw "Unsupported construction!";
				}
			}
			else
			{	// Assume a scalar?
				this.r0 = new vec4( a );
				this.r1 = new vec4( a );
				this.r2 = new vec4( a );
				this.r3 = new vec4( a );
			}
		}
		else
		{	// Build identity
			this.r0 = new vec4( 1, 0, 0, 0 );
			this.r1 = new vec4( 0, 1, 0, 0 );
			this.r2 = new vec4( 0, 0, 1, 0 );
			this.r3 = new vec4( 0, 0, 0, 1 );
		}

		return this;
	}
	, add : function( b )			{ this.r0.add( b.r0 ); this.r1.add( b.r1 ); this.r2.add( b.r2 ); this.r3.add( b.r3 ); return this; }
	, add_ : function( b )			{ return new mat4( this ).add( b ); }
	, sub : function( b )			{ this.r0.sub( b.r0 ); this.r1.sub( b.r1 ); this.r2.sub( b.r2 ); this.r3.sub( b.r3 ); return this; }
	, sub_ : function( b )			{ return new mat4( this ).sub( b ); }
	, mul : function( b )
	{
		if ( b instanceof vec4 )
		{	// Matrix * Vector => returns vector!
			return new vec4(
				this.r0.x*b.x + this.r0.y*b.y + this.r0.z*b.z + this.r0.w*b.w,
				this.r1.x*b.x + this.r1.y*b.y + this.r1.z*b.z + this.r1.w*b.w,
				this.r2.x*b.x + this.r2.y*b.y + this.r2.z*b.z + this.r2.w*b.w,
				this.r3.x*b.x + this.r3.y*b.y + this.r3.z*b.z + this.r3.w*b.w
			);
		}
		else if ( b instanceof mat4 )
		{	// Matrix multiplication
			var	Temp = [
			this.r0.x*b.r0.x + this.r0.y*b.r1.x + this.r0.z*b.r2.x + this.r0.w*b.r3.x, this.r0.x*b.r0.y + this.r0.y*b.r1.y + this.r0.z*b.r2.y + this.r0.w*b.r3.y, this.r0.x*b.r0.z + this.r0.y*b.r1.z + this.r0.z*b.r2.z + this.r0.w*b.r3.z, this.r0.x*b.r0.w + this.r0.y*b.r1.w + this.r0.z*b.r2.w + this.r0.w*b.r3.w ,
			this.r1.x*b.r0.x + this.r1.y*b.r1.x + this.r1.z*b.r2.x + this.r1.w*b.r3.x, this.r1.x*b.r0.y + this.r1.y*b.r1.y + this.r1.z*b.r2.y + this.r1.w*b.r3.y, this.r1.x*b.r0.z + this.r1.y*b.r1.z + this.r1.z*b.r2.z + this.r1.w*b.r3.z, this.r1.x*b.r0.w + this.r1.y*b.r1.w + this.r1.z*b.r2.w + this.r1.w*b.r3.w ,
			this.r2.x*b.r0.x + this.r2.y*b.r1.x + this.r2.z*b.r2.x + this.r2.w*b.r3.x, this.r2.x*b.r0.y + this.r2.y*b.r1.y + this.r2.z*b.r2.y + this.r2.w*b.r3.y, this.r2.x*b.r0.z + this.r2.y*b.r1.z + this.r2.z*b.r2.z + this.r2.w*b.r3.z, this.r2.x*b.r0.w + this.r2.y*b.r1.w + this.r2.z*b.r2.w + this.r2.w*b.r3.w ,
			this.r3.x*b.r0.x + this.r3.y*b.r1.x + this.r3.z*b.r2.x + this.r3.w*b.r3.x, this.r3.x*b.r0.y + this.r3.y*b.r1.y + this.r3.z*b.r2.y + this.r3.w*b.r3.y, this.r3.x*b.r0.z + this.r3.y*b.r1.z + this.r3.z*b.r2.z + this.r3.w*b.r3.z, this.r3.x*b.r0.w + this.r3.y*b.r1.w + this.r3.z*b.r2.w + this.r3.w*b.r3.w ];

			this.r0.set( Temp[4*0+0], Temp[4*0+1], Temp[4*0+2], Temp[4*0+3] );
			this.r1.set( Temp[4*1+0], Temp[4*1+1], Temp[4*1+2], Temp[4*1+3] );
			this.r2.set( Temp[4*2+0], Temp[4*2+1], Temp[4*2+2], Temp[4*2+3] );
			this.r3.set( Temp[4*3+0], Temp[4*3+1], Temp[4*3+2], Temp[4*3+3] );
		}
		else
		{	// Multiply by scalar
			this.r0.mul( b );
			this.r1.mul( b );
			this.r2.mul( b );
			this.r3.mul( b );
		}
		return this;
	}
	, mul_ : function( b )			{ return new mat4( this ).mul( b ); }
	, getRow : function( row )
	{
		switch ( row&3 )
		{
		case 0: return this.r0;
		case 1: return this.r1;
		case 2: return this.r2;
		case 3: return this.r3;
		}
	}
	, getElement : function( row, column )				{ return this.getRow( row ).getElement( column ); }
	, getElementSingleIndex : function( index )			{ return this.getElement( index >> 2, index ); }
	, setElement : function( row, column, value )		{ this.getRow( row ).setElement( column, value ); }
	, setElementSingleIndex : function( index, value )	{ return this.setElement( index >> 2, index ); }
	, asArray : function()
	{
		return [	this.r0.x, this.r0.y, this.r0.z, this.r0.w,
					this.r1.x, this.r1.y, this.r1.z, this.r1.w,
					this.r2.x, this.r2.y, this.r2.z, this.r2.w,
					this.r3.x, this.r3.y, this.r3.z, this.r3.w
				];
	}

	// Computes the determinant of the matrix
	, cofactor : function( row, column )
	{
		return	((	this.getElement( row+1, column+1 )*this.getElement( row+2, column+2 )*this.getElement( row+3, column+3 ) +
					this.getElement( row+1, column+2 )*this.getElement( row+2, column+3 )*this.getElement( row+3, column+1 ) +
					this.getElement( row+1, column+3 )*this.getElement( row+2, column+1 )*this.getElement( row+3, column+2 ) )

				-(	this.getElement( row+3, column+1 )*this.getElement( row+2, column+2 )*this.getElement( row+1, column+3 ) +
					this.getElement( row+3, column+2 )*this.getElement( row+2, column+3 )*this.getElement( row+1, column+1 ) +
					this.getElement( row+3, column+3 )*this.getElement( row+2, column+1 )*this.getElement( row+1, column+2 ) ))
				* (((row + column) & 1) == 1 ? -1.0 : +1.0);
	}

	// Computes the determinant of the matrix
	, determinant : function()	{ return this.r0.x * this.cofactor( 0, 0 ) + this.r0.y * this.cofactor( 0, 1 ) + this.r0.z * this.cofactor( 0, 2 ) + this.r0.w * this.cofactor( 0, 3 ); }

	// Inverts the current matrix A = A^{-1}
	, invert : function()
	{
		var	Det = this.determinant();
		if ( Math.abs( Det ) < 1e-8 )
			throw "Matrix is not inversible!";

		Det = 1.0 / Det;

		var	Temp = [ this.cofactor( 0, 0 ) * Det, this.cofactor( 1, 0 ) * Det, this.cofactor( 2, 0 ) * Det, this.cofactor( 3, 0 ) * Det,
					 this.cofactor( 0, 1 ) * Det, this.cofactor( 1, 1 ) * Det, this.cofactor( 2, 1 ) * Det, this.cofactor( 3, 1 ) * Det,
					 this.cofactor( 0, 2 ) * Det, this.cofactor( 1, 2 ) * Det, this.cofactor( 2, 2 ) * Det, this.cofactor( 3, 2 ) * Det,
					 this.cofactor( 0, 3 ) * Det, this.cofactor( 1, 3 ) * Det, this.cofactor( 2, 3 ) * Det, this.cofactor( 3, 3 ) * Det,
					];
		this.r0.set( Temp[4*0+0], Temp[4*0+1], Temp[4*0+2], Temp[4*0+3] );
		this.r1.set( Temp[4*1+0], Temp[4*1+1], Temp[4*1+2], Temp[4*1+3] );
		this.r2.set( Temp[4*2+0], Temp[4*2+1], Temp[4*2+2], Temp[4*2+3] );
		this.r3.set( Temp[4*3+0], Temp[4*3+1], Temp[4*3+2], Temp[4*3+3] );

		return	this;
	}
	, inverse : function()	{ return new mat4( this ).invert(); }
	, trace : function()	{ return this.getElement( 0, 0 ) + this.getElement( 1, 1 ) + this.getElement( 2, 2 ) + this.getElement( 3, 3 ); }

	// Gets the XYZ Euler angles from a matrix
	// Can be used later in the rotationZYX() method to reconstruct the matrix
	, getEuler : function()
	{
		var	fSinY = Math.clamp( m.r0.z, -1.0, +1.0 );
		var	fCosY = Math.sqrt( 1.0 - fSinY*fSinY );
		if ( m.r0.x < 0.0 && m.r2.z < 0.0 )
			fCosY = -fCosY;

		var	Result = new vec3();
		if ( Math.abs( fCosY ) > 1e-6 )
		{
			Result.x =  Math.atan2( m.r1.z / fCosY, m.r2.z / fCosY );
			Result.y = -Math.atan2( fSinY, fCosY );
			Result.z =  Math.atan2( m.r0.y / fCosY, m.r0.x / fCosY );
		}
		else
		{
			Result.x =  Math.atan2( -m.r2.y, m.r1.y );
			Result.y = -Math.asin( fSinY );
			Result.z = 0.0;
		}

		return Result;
	}

	// Creates a 4x4 rotation matrix.
	//	_EulerXYZ, a vector of 3 Euler angles (in radians).
	// Returns a matrix which rotates around the x-axis first, then the y-axis, then the z-axis.
	//
	, makeRotationZYX : function( _AngleX, _AngleY, _AngleZ )
	{
		if ( _AngleZ === undefined )
		{	// Assume a vec3 => replace arguments by each of the vector's components
			_AngleZ = _AngleX.z;
			_AngleY = _AngleX.y;
			_AngleX = _AngleX.x;
		}
		else if ( _AngleY === undefined )
			throw "Unsupported construction!";	// What does that mean to have only 2 arguments?

		var sinx = Math.sin( _AngleX );
		var cosx = Math.cos( _AngleX );
		var siny = Math.sin( _AngleY );
		var cosy = Math.cos( _AngleY );
		var sinz = Math.sin( _AngleZ );
		var cosz = Math.cos( _AngleZ );

		var coszsiny = cosz * siny;
		var sinzsiny = sinz * siny;

		this.r0.set( cosz * cosy, sinz * cosy, -siny, 0 );
		this.r1.set( coszsiny * sinx - sinz * cosx, sinzsiny * sinx + cosz * cosx, cosy * sinx, 0 );
		this.r2.set( coszsiny * cosx + sinz * sinx, sinzsiny * cosx - cosz * sinx, cosy * cosx, 0 );
		this.r3.set( 0, 0, 0, 1 );

		return this;
	}
	, asQuat : function()
	{
		var	Result = new quat();
		var	Trace = this.trace( a );
		if ( Trace > 1.0 )
		{
			var	s = Math.sqrt( Trace );
			Result.s = 0.5 * s;
			s = 0.5 / s;
			Result.v.x = s * (this.getElement( 2, 1 ) - this.getElement( 1, 2 ));
			Result.v.y = s * (this.getElement( 0, 2 ) - this.getElement( 2, 0 ));
			Result.v.z = s * (this.getElement( 1, 0 ) - this.getElement( 0, 1 ));
		}
		else
		{
			var	i,  j,  k;
			var	mi, mj, mk;

			i = mi = 0;
			if ( this.getElement( 1, 1 ) > this.getElement( 0, 0 ) )
				i = mi = 1;
			if ( this.getElement( 2, 2 ) > this.getElement( i, i ) )
				i = mi = 2;

			j = i + 1;
			mj = (mi+1) % 3;
			k = j + 1;
			mk = (mj+1) % 3;

			s = Math.sqrt( (this.getElement( mi, mi ) - (this.getElement( mj, mj ) + this.getElement( mk, mk ))) + 1.0 );
			Result.v.setElement( i, s * 0.5 );

			if ( Math.abs( s ) > 1e-10 )
				s = 0.5 / s;

			Result.s = s * (this.getElement( mj, mk ) - this.getElement( mk, mj ));
			Result.v.setElement( j, s * (this.getElement( mj, mi ) + this.getElement( mi, mj )) );
			Result.v.setElement( k, s * (this.getElement( mk, mi ) + this.getElement( mi, mk )) );
		}

		return	Result;
	}

	// Creates a look at camera matrix
	, makeLookAt : function( _Position, _Target, _Up )
	{
		var	Z = _Target.sub_( _Position ).normalize();	// Looks AT target
		var	X = Z.cross( _Up ).normalize();				// Points to the right of the screen
		var	Y = X.cross( Z );							// Points to the top of the screen

		this.r0.set( X, 0 );
		this.r1.set( Y, 0 );
		this.r2.set( Z, 0 );
		this.r3.set( _Position, 1 );
	}

	// Creates a perspective projection matrix
	//	_FOV, vertical field of view in radians
	//	_AspectRatio, aspect ratio w/h
	//	_Near, near clip distance
	//	_Far, far clip distance
	, makePerspective : function( _FOV, _AspectRatio, _Near, _Far )
	{
		var	H = Math.tan( 0.5 * _FOV );
		var	W = _AspectRatio * H;

		var	Q =  _Far / (_Far - _Near);

		this.r0.set( 1 / W,		0,			0,				0 );
		this.r1.set( 0,			1 / H,		0,				0 );
		this.r2.set( 0,			0,			Q,				1 );
		this.r3.set( 0,			0,			-_Near * Q,		0 );
	}
};


//////////////////////////////////////////////////////////////////////////
// Polynomial solver
patapi.helpers.Extend( Math,
{
	// Returns the array of roots for any polynomial of degree 0 to 4
	//
	solvePolynomial : function( a, b, c, d, e )
	{
		if ( e !== undefined && e != 0.0 )
			return Math.solveQuartic( a, b, c, d, e );
		else if ( d !== undefined && d != 0.0 )
			return Math.solveCubic( a, b, c, d );
		else if ( c !== undefined && c != 0.0 )
			return Math.solveQuadratic( a, b, c );

		return Math.solveLinear( a, b );
	},

	// Returns the array of 1 real root of a linear polynomial  a + b x = 0
	//
	solveLinear : function( a, b )
	{
		if ( b === undefined || b == 0.0 )
			return [undefined];

		return [-a / b];
	},

	// Returns the array of 2 real roots of a quadratic polynomial  a + b x + c x^2 = 0
	// NOTE: If roots are imaginary, the returned value in the array will be "undefined"
	//
	solveQuadratic : function( a, b, c )
	{
		if ( c === undefined || c == 0.0 )
			throw "3th coefficient is invalid! You should resolve a linear polynomial instead !"

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
	solveCubic : function( a, b, c, d )
	{
		if ( d === undefined || d == 0.0 )
			throw "4th coefficient is invalid! You should resolve a quadratic polynomial instead !"

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
	solveQuartic : function( a, b, c, d, e )
	{
		if ( e === undefined || e == 0.0 )
			throw "5th coefficient is invalid! You should resolve a cubic polynomial instead !"

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


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// Vector Swizzles

//////////////////////////////////////////////////////////////////////////
// vec3
// 2-terms swizzle
vec3.prototype.xx = function()	{ return new vec2( this.x, this.x ); }
vec3.prototype.xy = function()	{ return new vec2( this.x, this.y ); }
vec3.prototype.xz = function()	{ return new vec2( this.x, this.z ); }
vec3.prototype.yx = function()	{ return new vec2( this.y, this.x ); }
vec3.prototype.yy = function()	{ return new vec2( this.y, this.y ); }
vec3.prototype.yz = function()	{ return new vec2( this.y, this.z ); }
vec3.prototype.zx = function()	{ return new vec2( this.z, this.x ); }
vec3.prototype.zy = function()	{ return new vec2( this.z, this.y ); }
vec3.prototype.zz = function()	{ return new vec2( this.z, this.z ); }

// Funky 3-terms swizzle
vec3.prototype.xxx = function()	{ return new vec3( this.x, this.x, this.x ); }
vec3.prototype.xxy = function()	{ return new vec3( this.x, this.x, this.y ); }
vec3.prototype.xxz = function()	{ return new vec3( this.x, this.x, this.z ); }
vec3.prototype.xyx = function()	{ return new vec3( this.x, this.y, this.x ); }
vec3.prototype.xyy = function()	{ return new vec3( this.x, this.y, this.y ); }
vec3.prototype.xyz = function()	{ return new vec3( this.x, this.y, this.z ); }
vec3.prototype.xzx = function()	{ return new vec3( this.x, this.z, this.x ); }
vec3.prototype.xzy = function()	{ return new vec3( this.x, this.z, this.y ); }
vec3.prototype.xzz = function()	{ return new vec3( this.x, this.z, this.z ); }
vec3.prototype.yxx = function()	{ return new vec3( this.y, this.x, this.x ); }
vec3.prototype.yxy = function()	{ return new vec3( this.y, this.x, this.y ); }
vec3.prototype.yxz = function()	{ return new vec3( this.y, this.x, this.z ); }
vec3.prototype.yyx = function()	{ return new vec3( this.y, this.y, this.x ); }
vec3.prototype.yyy = function()	{ return new vec3( this.y, this.y, this.y ); }
vec3.prototype.yyz = function()	{ return new vec3( this.y, this.y, this.z ); }
vec3.prototype.yzx = function()	{ return new vec3( this.y, this.z, this.x ); }
vec3.prototype.yzy = function()	{ return new vec3( this.y, this.z, this.y ); }
vec3.prototype.yzz = function()	{ return new vec3( this.y, this.z, this.z ); }
vec3.prototype.zxx = function()	{ return new vec3( this.z, this.x, this.x ); }
vec3.prototype.zxy = function()	{ return new vec3( this.z, this.x, this.y ); }
vec3.prototype.zxz = function()	{ return new vec3( this.z, this.x, this.z ); }
vec3.prototype.zyx = function()	{ return new vec3( this.z, this.y, this.x ); }
vec3.prototype.zyy = function()	{ return new vec3( this.z, this.y, this.y ); }
vec3.prototype.zyz = function()	{ return new vec3( this.z, this.y, this.z ); }
vec3.prototype.zzx = function()	{ return new vec3( this.z, this.z, this.x ); }
vec3.prototype.zzy = function()	{ return new vec3( this.z, this.z, this.y ); }
vec3.prototype.zzz = function()	{ return new vec3( this.z, this.z, this.z ); }


//////////////////////////////////////////////////////////////////////////
// vec4

// 2-terms swizzle
vec4.prototype.xx = function()	{ return new vec2( this.x, this.x ); }
vec4.prototype.xy = function()	{ return new vec2( this.x, this.y ); }
vec4.prototype.xz = function()	{ return new vec2( this.x, this.z ); }
vec4.prototype.yx = function()	{ return new vec2( this.y, this.x ); }
vec4.prototype.yy = function()	{ return new vec2( this.y, this.y ); }
vec4.prototype.yz = function()	{ return new vec2( this.y, this.z ); }
vec4.prototype.zx = function()	{ return new vec2( this.z, this.x ); }
vec4.prototype.zy = function()	{ return new vec2( this.z, this.y ); }
vec4.prototype.zz = function()	{ return new vec2( this.z, this.z ); }

// Funky 3-terms swizzle
vec4.prototype.xxx = function()	{ return new vec3( this.x, this.x, this.x ); }
vec4.prototype.xxy = function()	{ return new vec3( this.x, this.x, this.y ); }
vec4.prototype.xxz = function()	{ return new vec3( this.x, this.x, this.z ); }
vec4.prototype.xyx = function()	{ return new vec3( this.x, this.y, this.x ); }
vec4.prototype.xyy = function()	{ return new vec3( this.x, this.y, this.y ); }
vec4.prototype.xyz = function()	{ return new vec3( this.x, this.y, this.z ); }
vec4.prototype.xzx = function()	{ return new vec3( this.x, this.z, this.x ); }
vec4.prototype.xzy = function()	{ return new vec3( this.x, this.z, this.y ); }
vec4.prototype.xzz = function()	{ return new vec3( this.x, this.z, this.z ); }
vec4.prototype.yxx = function()	{ return new vec3( this.y, this.x, this.x ); }
vec4.prototype.yxy = function()	{ return new vec3( this.y, this.x, this.y ); }
vec4.prototype.yxz = function()	{ return new vec3( this.y, this.x, this.z ); }
vec4.prototype.yyx = function()	{ return new vec3( this.y, this.y, this.x ); }
vec4.prototype.yyy = function()	{ return new vec3( this.y, this.y, this.y ); }
vec4.prototype.yyz = function()	{ return new vec3( this.y, this.y, this.z ); }
vec4.prototype.yzx = function()	{ return new vec3( this.y, this.z, this.x ); }
vec4.prototype.yzy = function()	{ return new vec3( this.y, this.z, this.y ); }
vec4.prototype.yzz = function()	{ return new vec3( this.y, this.z, this.z ); }
vec4.prototype.zxx = function()	{ return new vec3( this.z, this.x, this.x ); }
vec4.prototype.zxy = function()	{ return new vec3( this.z, this.x, this.y ); }
vec4.prototype.zxz = function()	{ return new vec3( this.z, this.x, this.z ); }
vec4.prototype.zyx = function()	{ return new vec3( this.z, this.y, this.x ); }
vec4.prototype.zyy = function()	{ return new vec3( this.z, this.y, this.y ); }
vec4.prototype.zyz = function()	{ return new vec3( this.z, this.y, this.z ); }
vec4.prototype.zzx = function()	{ return new vec3( this.z, this.z, this.x ); }
vec4.prototype.zzy = function()	{ return new vec3( this.z, this.z, this.y ); }
vec4.prototype.zzz = function()	{ return new vec3( this.z, this.z, this.z ); }

// Super 4-terms swizzle!!
vec4.prototype.xxxx = function()	{ return new vec4( this.x, this.x, this.x, this.x ); }
vec4.prototype.xxxy = function()	{ return new vec4( this.x, this.x, this.x, this.y ); }
vec4.prototype.xxxz = function()	{ return new vec4( this.x, this.x, this.x, this.z ); }
vec4.prototype.xxxw = function()	{ return new vec4( this.x, this.x, this.x, this.w ); }
vec4.prototype.xxyx = function()	{ return new vec4( this.x, this.x, this.y, this.x ); }
vec4.prototype.xxyy = function()	{ return new vec4( this.x, this.x, this.y, this.y ); }
vec4.prototype.xxyz = function()	{ return new vec4( this.x, this.x, this.y, this.z ); }
vec4.prototype.xxyw = function()	{ return new vec4( this.x, this.x, this.y, this.w ); }
vec4.prototype.xxzx = function()	{ return new vec4( this.x, this.x, this.z, this.x ); }
vec4.prototype.xxzy = function()	{ return new vec4( this.x, this.x, this.z, this.y ); }
vec4.prototype.xxzz = function()	{ return new vec4( this.x, this.x, this.z, this.z ); }
vec4.prototype.xxzw = function()	{ return new vec4( this.x, this.x, this.z, this.w ); }
vec4.prototype.xxwx = function()	{ return new vec4( this.x, this.x, this.w, this.x ); }
vec4.prototype.xxwy = function()	{ return new vec4( this.x, this.x, this.w, this.y ); }
vec4.prototype.xxwz = function()	{ return new vec4( this.x, this.x, this.w, this.z ); }
vec4.prototype.xxww = function()	{ return new vec4( this.x, this.x, this.w, this.w ); }

vec4.prototype.xyxx = function()	{ return new vec4( this.x, this.y, this.x, this.x ); }
vec4.prototype.xyxy = function()	{ return new vec4( this.x, this.y, this.x, this.y ); }
vec4.prototype.xyxz = function()	{ return new vec4( this.x, this.y, this.x, this.z ); }
vec4.prototype.xyxw = function()	{ return new vec4( this.x, this.y, this.x, this.w ); }
vec4.prototype.xyyx = function()	{ return new vec4( this.x, this.y, this.y, this.x ); }
vec4.prototype.xyyy = function()	{ return new vec4( this.x, this.y, this.y, this.y ); }
vec4.prototype.xyyz = function()	{ return new vec4( this.x, this.y, this.y, this.z ); }
vec4.prototype.xyyw = function()	{ return new vec4( this.x, this.y, this.y, this.w ); }
vec4.prototype.xyzx = function()	{ return new vec4( this.x, this.y, this.z, this.x ); }
vec4.prototype.xyzy = function()	{ return new vec4( this.x, this.y, this.z, this.y ); }
vec4.prototype.xyzz = function()	{ return new vec4( this.x, this.y, this.z, this.z ); }
vec4.prototype.xyzw = function()	{ return new vec4( this.x, this.y, this.z, this.w ); }
vec4.prototype.xywx = function()	{ return new vec4( this.x, this.y, this.w, this.x ); }
vec4.prototype.xywy = function()	{ return new vec4( this.x, this.y, this.w, this.y ); }
vec4.prototype.xywz = function()	{ return new vec4( this.x, this.y, this.w, this.z ); }
vec4.prototype.xyww = function()	{ return new vec4( this.x, this.y, this.w, this.w ); }

vec4.prototype.xzxx = function()	{ return new vec4( this.x, this.z, this.x, this.x ); }
vec4.prototype.xzxy = function()	{ return new vec4( this.x, this.z, this.x, this.y ); }
vec4.prototype.xzxz = function()	{ return new vec4( this.x, this.z, this.x, this.z ); }
vec4.prototype.xzxw = function()	{ return new vec4( this.x, this.z, this.x, this.w ); }
vec4.prototype.xzyx = function()	{ return new vec4( this.x, this.z, this.y, this.x ); }
vec4.prototype.xzyy = function()	{ return new vec4( this.x, this.z, this.y, this.y ); }
vec4.prototype.xzyz = function()	{ return new vec4( this.x, this.z, this.y, this.z ); }
vec4.prototype.xzyw = function()	{ return new vec4( this.x, this.z, this.y, this.w ); }
vec4.prototype.xzzx = function()	{ return new vec4( this.x, this.z, this.z, this.x ); }
vec4.prototype.xzzy = function()	{ return new vec4( this.x, this.z, this.z, this.y ); }
vec4.prototype.xzzz = function()	{ return new vec4( this.x, this.z, this.z, this.z ); }
vec4.prototype.xzzw = function()	{ return new vec4( this.x, this.z, this.z, this.w ); }
vec4.prototype.xzwx = function()	{ return new vec4( this.x, this.z, this.w, this.x ); }
vec4.prototype.xzwy = function()	{ return new vec4( this.x, this.z, this.w, this.y ); }
vec4.prototype.xzwz = function()	{ return new vec4( this.x, this.z, this.w, this.z ); }
vec4.prototype.xzww = function()	{ return new vec4( this.x, this.z, this.w, this.w ); }

vec4.prototype.xwxx = function()	{ return new vec4( this.x, this.w, this.x, this.x ); }
vec4.prototype.xwxy = function()	{ return new vec4( this.x, this.w, this.x, this.y ); }
vec4.prototype.xwxz = function()	{ return new vec4( this.x, this.w, this.x, this.z ); }
vec4.prototype.xwxw = function()	{ return new vec4( this.x, this.w, this.x, this.w ); }
vec4.prototype.xwyx = function()	{ return new vec4( this.x, this.w, this.y, this.x ); }
vec4.prototype.xwyy = function()	{ return new vec4( this.x, this.w, this.y, this.y ); }
vec4.prototype.xwyz = function()	{ return new vec4( this.x, this.w, this.y, this.z ); }
vec4.prototype.xwyw = function()	{ return new vec4( this.x, this.w, this.y, this.w ); }
vec4.prototype.xwzx = function()	{ return new vec4( this.x, this.w, this.z, this.x ); }
vec4.prototype.xwzy = function()	{ return new vec4( this.x, this.w, this.z, this.y ); }
vec4.prototype.xwzz = function()	{ return new vec4( this.x, this.w, this.z, this.z ); }
vec4.prototype.xwzw = function()	{ return new vec4( this.x, this.w, this.z, this.w ); }
vec4.prototype.xwwx = function()	{ return new vec4( this.x, this.w, this.w, this.x ); }
vec4.prototype.xwwy = function()	{ return new vec4( this.x, this.w, this.w, this.y ); }
vec4.prototype.xwwz = function()	{ return new vec4( this.x, this.w, this.w, this.z ); }
vec4.prototype.xwww = function()	{ return new vec4( this.x, this.w, this.w, this.w ); }
//----------------------------------------------------------------------------------------

vec4.prototype.yxxx = function()	{ return new vec4( this.y, this.x, this.x, this.x ); }
vec4.prototype.yxxy = function()	{ return new vec4( this.y, this.x, this.x, this.y ); }
vec4.prototype.yxxz = function()	{ return new vec4( this.y, this.x, this.x, this.z ); }
vec4.prototype.yxxw = function()	{ return new vec4( this.y, this.x, this.x, this.w ); }
vec4.prototype.yxyx = function()	{ return new vec4( this.y, this.x, this.y, this.x ); }
vec4.prototype.yxyy = function()	{ return new vec4( this.y, this.x, this.y, this.y ); }
vec4.prototype.yxyz = function()	{ return new vec4( this.y, this.x, this.y, this.z ); }
vec4.prototype.yxyw = function()	{ return new vec4( this.y, this.x, this.y, this.w ); }
vec4.prototype.yxzx = function()	{ return new vec4( this.y, this.x, this.z, this.x ); }
vec4.prototype.yxzy = function()	{ return new vec4( this.y, this.x, this.z, this.y ); }
vec4.prototype.yxzz = function()	{ return new vec4( this.y, this.x, this.z, this.z ); }
vec4.prototype.yxzw = function()	{ return new vec4( this.y, this.x, this.z, this.w ); }
vec4.prototype.yxwx = function()	{ return new vec4( this.y, this.x, this.w, this.x ); }
vec4.prototype.yxwy = function()	{ return new vec4( this.y, this.x, this.w, this.y ); }
vec4.prototype.yxwz = function()	{ return new vec4( this.y, this.x, this.w, this.z ); }
vec4.prototype.yxww = function()	{ return new vec4( this.y, this.x, this.w, this.w ); }
vec4.prototype.yyxx = function()	{ return new vec4( this.y, this.y, this.x, this.x ); }
vec4.prototype.yyxy = function()	{ return new vec4( this.y, this.y, this.x, this.y ); }
vec4.prototype.yyxz = function()	{ return new vec4( this.y, this.y, this.x, this.z ); }
vec4.prototype.yyxw = function()	{ return new vec4( this.y, this.y, this.x, this.w ); }
vec4.prototype.yyyx = function()	{ return new vec4( this.y, this.y, this.y, this.x ); }
vec4.prototype.yyyy = function()	{ return new vec4( this.y, this.y, this.y, this.y ); }
vec4.prototype.yyyz = function()	{ return new vec4( this.y, this.y, this.y, this.z ); }
vec4.prototype.yyyw = function()	{ return new vec4( this.y, this.y, this.y, this.w ); }
vec4.prototype.yyzx = function()	{ return new vec4( this.y, this.y, this.z, this.x ); }
vec4.prototype.yyzy = function()	{ return new vec4( this.y, this.y, this.z, this.y ); }
vec4.prototype.yyzz = function()	{ return new vec4( this.y, this.y, this.z, this.z ); }
vec4.prototype.yyzw = function()	{ return new vec4( this.y, this.y, this.z, this.w ); }
vec4.prototype.yywx = function()	{ return new vec4( this.y, this.y, this.w, this.x ); }
vec4.prototype.yywy = function()	{ return new vec4( this.y, this.y, this.w, this.y ); }
vec4.prototype.yywz = function()	{ return new vec4( this.y, this.y, this.w, this.z ); }
vec4.prototype.yyww = function()	{ return new vec4( this.y, this.y, this.w, this.w ); }
vec4.prototype.yzxx = function()	{ return new vec4( this.y, this.z, this.x, this.x ); }
vec4.prototype.yzxy = function()	{ return new vec4( this.y, this.z, this.x, this.y ); }
vec4.prototype.yzxz = function()	{ return new vec4( this.y, this.z, this.x, this.z ); }
vec4.prototype.yzxw = function()	{ return new vec4( this.y, this.z, this.x, this.w ); }
vec4.prototype.yzyx = function()	{ return new vec4( this.y, this.z, this.y, this.x ); }
vec4.prototype.yzyy = function()	{ return new vec4( this.y, this.z, this.y, this.y ); }
vec4.prototype.yzyz = function()	{ return new vec4( this.y, this.z, this.y, this.z ); }
vec4.prototype.yzyw = function()	{ return new vec4( this.y, this.z, this.y, this.w ); }
vec4.prototype.yzzx = function()	{ return new vec4( this.y, this.z, this.z, this.x ); }
vec4.prototype.yzzy = function()	{ return new vec4( this.y, this.z, this.z, this.y ); }
vec4.prototype.yzzz = function()	{ return new vec4( this.y, this.z, this.z, this.z ); }
vec4.prototype.yzzw = function()	{ return new vec4( this.y, this.z, this.z, this.w ); }
vec4.prototype.yzwx = function()	{ return new vec4( this.y, this.z, this.w, this.x ); }
vec4.prototype.yzwy = function()	{ return new vec4( this.y, this.z, this.w, this.y ); }
vec4.prototype.yzwz = function()	{ return new vec4( this.y, this.z, this.w, this.z ); }
vec4.prototype.yzww = function()	{ return new vec4( this.y, this.z, this.w, this.w ); }
vec4.prototype.ywxx = function()	{ return new vec4( this.y, this.w, this.x, this.x ); }
vec4.prototype.ywxy = function()	{ return new vec4( this.y, this.w, this.x, this.y ); }
vec4.prototype.ywxz = function()	{ return new vec4( this.y, this.w, this.x, this.z ); }
vec4.prototype.ywxw = function()	{ return new vec4( this.y, this.w, this.x, this.w ); }
vec4.prototype.ywyx = function()	{ return new vec4( this.y, this.w, this.y, this.x ); }
vec4.prototype.ywyy = function()	{ return new vec4( this.y, this.w, this.y, this.y ); }
vec4.prototype.ywyz = function()	{ return new vec4( this.y, this.w, this.y, this.z ); }
vec4.prototype.ywyw = function()	{ return new vec4( this.y, this.w, this.y, this.w ); }
vec4.prototype.ywzx = function()	{ return new vec4( this.y, this.w, this.z, this.x ); }
vec4.prototype.ywzy = function()	{ return new vec4( this.y, this.w, this.z, this.y ); }
vec4.prototype.ywzz = function()	{ return new vec4( this.y, this.w, this.z, this.z ); }
vec4.prototype.ywzw = function()	{ return new vec4( this.y, this.w, this.z, this.w ); }
vec4.prototype.ywwx = function()	{ return new vec4( this.y, this.w, this.w, this.x ); }
vec4.prototype.ywwy = function()	{ return new vec4( this.y, this.w, this.w, this.y ); }
vec4.prototype.ywwz = function()	{ return new vec4( this.y, this.w, this.w, this.z ); }
vec4.prototype.ywww = function()	{ return new vec4( this.y, this.w, this.w, this.w ); }
//----------------------------------------------------------------------------------------

vec4.prototype.zxxx = function()	{ return new vec4( this.z, this.x, this.x, this.x ); }
vec4.prototype.zxxy = function()	{ return new vec4( this.z, this.x, this.x, this.y ); }
vec4.prototype.zxxz = function()	{ return new vec4( this.z, this.x, this.x, this.z ); }
vec4.prototype.zxxw = function()	{ return new vec4( this.z, this.x, this.x, this.w ); }
vec4.prototype.zxyx = function()	{ return new vec4( this.z, this.x, this.y, this.x ); }
vec4.prototype.zxyy = function()	{ return new vec4( this.z, this.x, this.y, this.y ); }
vec4.prototype.zxyz = function()	{ return new vec4( this.z, this.x, this.y, this.z ); }
vec4.prototype.zxyw = function()	{ return new vec4( this.z, this.x, this.y, this.w ); }
vec4.prototype.zxzx = function()	{ return new vec4( this.z, this.x, this.z, this.x ); }
vec4.prototype.zxzy = function()	{ return new vec4( this.z, this.x, this.z, this.y ); }
vec4.prototype.zxzz = function()	{ return new vec4( this.z, this.x, this.z, this.z ); }
vec4.prototype.zxzw = function()	{ return new vec4( this.z, this.x, this.z, this.w ); }
vec4.prototype.zxwx = function()	{ return new vec4( this.z, this.x, this.w, this.x ); }
vec4.prototype.zxwy = function()	{ return new vec4( this.z, this.x, this.w, this.y ); }
vec4.prototype.zxwz = function()	{ return new vec4( this.z, this.x, this.w, this.z ); }
vec4.prototype.zxww = function()	{ return new vec4( this.z, this.x, this.w, this.w ); }
vec4.prototype.zyxx = function()	{ return new vec4( this.z, this.y, this.x, this.x ); }
vec4.prototype.zyxy = function()	{ return new vec4( this.z, this.y, this.x, this.y ); }
vec4.prototype.zyxz = function()	{ return new vec4( this.z, this.y, this.x, this.z ); }
vec4.prototype.zyxw = function()	{ return new vec4( this.z, this.y, this.x, this.w ); }
vec4.prototype.zyyx = function()	{ return new vec4( this.z, this.y, this.y, this.x ); }
vec4.prototype.zyyy = function()	{ return new vec4( this.z, this.y, this.y, this.y ); }
vec4.prototype.zyyz = function()	{ return new vec4( this.z, this.y, this.y, this.z ); }
vec4.prototype.zyyw = function()	{ return new vec4( this.z, this.y, this.y, this.w ); }
vec4.prototype.zyzx = function()	{ return new vec4( this.z, this.y, this.z, this.x ); }
vec4.prototype.zyzy = function()	{ return new vec4( this.z, this.y, this.z, this.y ); }
vec4.prototype.zyzz = function()	{ return new vec4( this.z, this.y, this.z, this.z ); }
vec4.prototype.zyzw = function()	{ return new vec4( this.z, this.y, this.z, this.w ); }
vec4.prototype.zywx = function()	{ return new vec4( this.z, this.y, this.w, this.x ); }
vec4.prototype.zywy = function()	{ return new vec4( this.z, this.y, this.w, this.y ); }
vec4.prototype.zywz = function()	{ return new vec4( this.z, this.y, this.w, this.z ); }
vec4.prototype.zyww = function()	{ return new vec4( this.z, this.y, this.w, this.w ); }
vec4.prototype.zzxx = function()	{ return new vec4( this.z, this.z, this.x, this.x ); }
vec4.prototype.zzxy = function()	{ return new vec4( this.z, this.z, this.x, this.y ); }
vec4.prototype.zzxz = function()	{ return new vec4( this.z, this.z, this.x, this.z ); }
vec4.prototype.zzxw = function()	{ return new vec4( this.z, this.z, this.x, this.w ); }
vec4.prototype.zzyx = function()	{ return new vec4( this.z, this.z, this.y, this.x ); }
vec4.prototype.zzyy = function()	{ return new vec4( this.z, this.z, this.y, this.y ); }
vec4.prototype.zzyz = function()	{ return new vec4( this.z, this.z, this.y, this.z ); }
vec4.prototype.zzyw = function()	{ return new vec4( this.z, this.z, this.y, this.w ); }
vec4.prototype.zzzx = function()	{ return new vec4( this.z, this.z, this.z, this.x ); }
vec4.prototype.zzzy = function()	{ return new vec4( this.z, this.z, this.z, this.y ); }
vec4.prototype.zzzz = function()	{ return new vec4( this.z, this.z, this.z, this.z ); }
vec4.prototype.zzzw = function()	{ return new vec4( this.z, this.z, this.z, this.w ); }
vec4.prototype.zzwx = function()	{ return new vec4( this.z, this.z, this.w, this.x ); }
vec4.prototype.zzwy = function()	{ return new vec4( this.z, this.z, this.w, this.y ); }
vec4.prototype.zzwz = function()	{ return new vec4( this.z, this.z, this.w, this.z ); }
vec4.prototype.zzww = function()	{ return new vec4( this.z, this.z, this.w, this.w ); }
vec4.prototype.zwxx = function()	{ return new vec4( this.z, this.w, this.x, this.x ); }
vec4.prototype.zwxy = function()	{ return new vec4( this.z, this.w, this.x, this.y ); }
vec4.prototype.zwxz = function()	{ return new vec4( this.z, this.w, this.x, this.z ); }
vec4.prototype.zwxw = function()	{ return new vec4( this.z, this.w, this.x, this.w ); }
vec4.prototype.zwyx = function()	{ return new vec4( this.z, this.w, this.y, this.x ); }
vec4.prototype.zwyy = function()	{ return new vec4( this.z, this.w, this.y, this.y ); }
vec4.prototype.zwyz = function()	{ return new vec4( this.z, this.w, this.y, this.z ); }
vec4.prototype.zwyw = function()	{ return new vec4( this.z, this.w, this.y, this.w ); }
vec4.prototype.zwzx = function()	{ return new vec4( this.z, this.w, this.z, this.x ); }
vec4.prototype.zwzy = function()	{ return new vec4( this.z, this.w, this.z, this.y ); }
vec4.prototype.zwzz = function()	{ return new vec4( this.z, this.w, this.z, this.z ); }
vec4.prototype.zwzw = function()	{ return new vec4( this.z, this.w, this.z, this.w ); }
vec4.prototype.zwwx = function()	{ return new vec4( this.z, this.w, this.w, this.x ); }
vec4.prototype.zwwy = function()	{ return new vec4( this.z, this.w, this.w, this.y ); }
vec4.prototype.zwwz = function()	{ return new vec4( this.z, this.w, this.w, this.z ); }
vec4.prototype.zwww = function()	{ return new vec4( this.z, this.w, this.w, this.w ); }
//----------------------------------------------------------------------------------------

vec4.prototype.wxxx = function()	{ return new vec4( this.w, this.x, this.x, this.x ); }
vec4.prototype.wxxy = function()	{ return new vec4( this.w, this.x, this.x, this.y ); }
vec4.prototype.wxxz = function()	{ return new vec4( this.w, this.x, this.x, this.z ); }
vec4.prototype.wxxw = function()	{ return new vec4( this.w, this.x, this.x, this.w ); }
vec4.prototype.wxyx = function()	{ return new vec4( this.w, this.x, this.y, this.x ); }
vec4.prototype.wxyy = function()	{ return new vec4( this.w, this.x, this.y, this.y ); }
vec4.prototype.wxyz = function()	{ return new vec4( this.w, this.x, this.y, this.z ); }
vec4.prototype.wxyw = function()	{ return new vec4( this.w, this.x, this.y, this.w ); }
vec4.prototype.wxzx = function()	{ return new vec4( this.w, this.x, this.z, this.x ); }
vec4.prototype.wxzy = function()	{ return new vec4( this.w, this.x, this.z, this.y ); }
vec4.prototype.wxzz = function()	{ return new vec4( this.w, this.x, this.z, this.z ); }
vec4.prototype.wxzw = function()	{ return new vec4( this.w, this.x, this.z, this.w ); }
vec4.prototype.wxwx = function()	{ return new vec4( this.w, this.x, this.w, this.x ); }
vec4.prototype.wxwy = function()	{ return new vec4( this.w, this.x, this.w, this.y ); }
vec4.prototype.wxwz = function()	{ return new vec4( this.w, this.x, this.w, this.z ); }
vec4.prototype.wxww = function()	{ return new vec4( this.w, this.x, this.w, this.w ); }
vec4.prototype.wyxx = function()	{ return new vec4( this.w, this.y, this.x, this.x ); }
vec4.prototype.wyxy = function()	{ return new vec4( this.w, this.y, this.x, this.y ); }
vec4.prototype.wyxz = function()	{ return new vec4( this.w, this.y, this.x, this.z ); }
vec4.prototype.wyxw = function()	{ return new vec4( this.w, this.y, this.x, this.w ); }
vec4.prototype.wyyx = function()	{ return new vec4( this.w, this.y, this.y, this.x ); }
vec4.prototype.wyyy = function()	{ return new vec4( this.w, this.y, this.y, this.y ); }
vec4.prototype.wyyz = function()	{ return new vec4( this.w, this.y, this.y, this.z ); }
vec4.prototype.wyyw = function()	{ return new vec4( this.w, this.y, this.y, this.w ); }
vec4.prototype.wyzx = function()	{ return new vec4( this.w, this.y, this.z, this.x ); }
vec4.prototype.wyzy = function()	{ return new vec4( this.w, this.y, this.z, this.y ); }
vec4.prototype.wyzz = function()	{ return new vec4( this.w, this.y, this.z, this.z ); }
vec4.prototype.wyzw = function()	{ return new vec4( this.w, this.y, this.z, this.w ); }
vec4.prototype.wywx = function()	{ return new vec4( this.w, this.y, this.w, this.x ); }
vec4.prototype.wywy = function()	{ return new vec4( this.w, this.y, this.w, this.y ); }
vec4.prototype.wywz = function()	{ return new vec4( this.w, this.y, this.w, this.z ); }
vec4.prototype.wyww = function()	{ return new vec4( this.w, this.y, this.w, this.w ); }
vec4.prototype.wzxx = function()	{ return new vec4( this.w, this.z, this.x, this.x ); }
vec4.prototype.wzxy = function()	{ return new vec4( this.w, this.z, this.x, this.y ); }
vec4.prototype.wzxz = function()	{ return new vec4( this.w, this.z, this.x, this.z ); }
vec4.prototype.wzxw = function()	{ return new vec4( this.w, this.z, this.x, this.w ); }
vec4.prototype.wzyx = function()	{ return new vec4( this.w, this.z, this.y, this.x ); }
vec4.prototype.wzyy = function()	{ return new vec4( this.w, this.z, this.y, this.y ); }
vec4.prototype.wzyz = function()	{ return new vec4( this.w, this.z, this.y, this.z ); }
vec4.prototype.wzyw = function()	{ return new vec4( this.w, this.z, this.y, this.w ); }
vec4.prototype.wzzx = function()	{ return new vec4( this.w, this.z, this.z, this.x ); }
vec4.prototype.wzzy = function()	{ return new vec4( this.w, this.z, this.z, this.y ); }
vec4.prototype.wzzz = function()	{ return new vec4( this.w, this.z, this.z, this.z ); }
vec4.prototype.wzzw = function()	{ return new vec4( this.w, this.z, this.z, this.w ); }
vec4.prototype.wzwx = function()	{ return new vec4( this.w, this.z, this.w, this.x ); }
vec4.prototype.wzwy = function()	{ return new vec4( this.w, this.z, this.w, this.y ); }
vec4.prototype.wzwz = function()	{ return new vec4( this.w, this.z, this.w, this.z ); }
vec4.prototype.wzww = function()	{ return new vec4( this.w, this.z, this.w, this.w ); }
vec4.prototype.wwxx = function()	{ return new vec4( this.w, this.w, this.x, this.x ); }
vec4.prototype.wwxy = function()	{ return new vec4( this.w, this.w, this.x, this.y ); }
vec4.prototype.wwxz = function()	{ return new vec4( this.w, this.w, this.x, this.z ); }
vec4.prototype.wwxw = function()	{ return new vec4( this.w, this.w, this.x, this.w ); }
vec4.prototype.wwyx = function()	{ return new vec4( this.w, this.w, this.y, this.x ); }
vec4.prototype.wwyy = function()	{ return new vec4( this.w, this.w, this.y, this.y ); }
vec4.prototype.wwyz = function()	{ return new vec4( this.w, this.w, this.y, this.z ); }
vec4.prototype.wwyw = function()	{ return new vec4( this.w, this.w, this.y, this.w ); }
vec4.prototype.wwzx = function()	{ return new vec4( this.w, this.w, this.z, this.x ); }
vec4.prototype.wwzy = function()	{ return new vec4( this.w, this.w, this.z, this.y ); }
vec4.prototype.wwzz = function()	{ return new vec4( this.w, this.w, this.z, this.z ); }
vec4.prototype.wwzw = function()	{ return new vec4( this.w, this.w, this.z, this.w ); }
vec4.prototype.wwwx = function()	{ return new vec4( this.w, this.w, this.w, this.x ); }
vec4.prototype.wwwy = function()	{ return new vec4( this.w, this.w, this.w, this.y ); }
vec4.prototype.wwwz = function()	{ return new vec4( this.w, this.w, this.w, this.z ); }
vec4.prototype.wwww = function()	{ return new vec4( this.w, this.w, this.w, this.w ); }
//----------------------------------------------------------------------------------------


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// "Unit testing" (not really, just a few lines to validate the syntax really...)
//
function UnitTestMath()
{

	var	Single = new vec2( 12 );
	var	Zero = new vec2();
	var	TwoScalars = new vec2( 1, 2 );
	var	OneArray = new vec2( [ 2, 3 ] );
	var	OneVector = new vec2( new vec2( 3, 4 ) );

	var	Test = new vec2( 1, 2 );
		Test.add( new vec2( 3, 4 ) );

	var	Test2 = Test.sub_( vec2.one() );
	Test2.x = 0;
	Test.y = 0;

	var	Glou = Test instanceof vec2;
	Test.add( vec2.one() )
}
