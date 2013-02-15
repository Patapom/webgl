// A camera manipulator simulating orbiting about a center
//
o3djs.require( 'patapi' );
o3djs.require( 'patapi.math' );
o3djs.provide( 'patapi.camera_orbit' )


// Class to hold Camera Manipulator information
//	_Position, the original position of the camera
//	_Target, the target we're looking at
//	_Options, a hash containing the following options:
//		Up, the optional Up axis (if unspecified then (0,1,0) is used)
//		OrbitSpeed, an optional orbit speed in radians per pixel (default is 0.01)
//		ZoomSpeed, an optional zooming speed in wolrd units per second (default is 1)
//
patapi.cameraOrbit = function( _Position, _Target, _Options )
{
	this.m_Position = _Position;
	this.m_Target = _Target;
	this.m_Options = patapi.helpers.Extend( _Options,
	{
		Up			: new vec3( 0, 1, 0 ),

		OrbitSpeedX	: 0.01,		// Horizontal orbiting speed in radians per pixel
		OrbitSpeedY	: 0.01,		// Vertical orbiting speed in radians per pixel
		ClampAngleX	: false,	// Don't clamp horizontal angular motion to [-PI,+PI]

		AllowPan	: false,	// Don't allow panning with middle button
		PanSpeedX	: 0.01,		// Horizontal panning speed in world units per pixel
		PanSpeedY	: 0.01,		// Vertical panning speed in world units per pixel
		PanBBoxMin	: undefined,// One can specify  a vec3() to bound target.
		PanBBoxMax	: undefined,// Set an undefined component in the vec3 to avoid constraint on a particular dimension...

		ZoomSpeed	: 0.01,		// Zoom speed in world units per pixel
		DistanceMin	: 0.1,		// Don't get closer to target than this!
		DistanceMax	: -1.0,		// No limit

		Callback	: null,		// No callback on matrix update
	} );

	if ( this.m_Options.DistanceMin <= 0.0 )
		this.m_Options.DistanceMin = 1e-3;	// We can't get closer than 0 anyway!
	if ( this.m_Options.DistanceMax <= 0.0 )
		this.m_Options.DistanceMax = 1e38;	// Should be enough...

	if ( this.m_Options.PanBBoxMin === undefined )
		this.m_Options.PanBBoxMin = new vec3( -1e38, -1e38, -1e38 );
	else if ( this.m_Options.PanBBoxMin instanceof vec3 )
	{	// Check constraints
		if ( this.m_Options.PanBBoxMin.x === undefined ) this.m_Options.PanBBoxMin.x = -1e38;
		if ( this.m_Options.PanBBoxMin.y === undefined ) this.m_Options.PanBBoxMin.y = -1e38;
		if ( this.m_Options.PanBBoxMin.z === undefined ) this.m_Options.PanBBoxMin.z = -1e38;
	}

	if ( this.m_Options.PanBBoxMax === undefined )
		this.m_Options.PanBBoxMax = new vec3( +1e38, +1e38, +1e38 );
	else if ( this.m_Options.PanBBoxMax instanceof vec3 )
	{	// Check constraints
		if ( this.m_Options.PanBBoxMax.x === undefined ) this.m_Options.PanBBoxMax.x = +1e38;
		if ( this.m_Options.PanBBoxMax.y === undefined ) this.m_Options.PanBBoxMax.y = +1e38;
		if ( this.m_Options.PanBBoxMax.z === undefined ) this.m_Options.PanBBoxMax.z = +1e38;
	}

	// Camera manipulation parameters
	this.m_Distance = _Target.sub_( _Position ).length();
	this.m_MousePos = new vec2();
	this.m_ButtonsDown = 0;
	this.m_Camera2World = new mat4();
	this.RebuildCameraMatrix__();

	// Keys controlling direction
	this.m_KeysDown = {};

	// Optional callback that is called before any event to give a chance to the user to override the event (by returning false)
	this.eventsPreProcessor = null;

	// Browser-specific offsets
	this.m_IE = o3djs.base.IsMSIE();
};

patapi.cameraOrbit.prototype = 
{
	Destroy : function()
	{

	}

	////////////////////////////////////////////////////////////////////////////
	// PROPERTIES
	////////////////////////////////////////////////////////////////////////////
	
	// Gets the currently pressed buttons
	, getButtonsDown : function()	{ return this.m_ButtonsDown; }

	// Gets the left button state
	, getButtonLeft : function()	{ return this.m_ButtonsDown & 1; }

	// Gets the middle button state
	, getButtonMiddle : function()	{ return this.m_ButtonsDown & 2; }

	// Gets the right button state
	, getButtonRight : function()	{ return this.m_ButtonsDown & 4; }

	// Gets the last CAMERA->WORLD matrix
	, getCamera2World : function()	{ return this.m_Camera2World; }


	////////////////////////////////////////////////////////////////////////////
	// METHODS
	////////////////////////////////////////////////////////////////////////////

	// Attaches the manipulator to O3D mouse events
	//
	, AttachToEvents : function( _Canvas, _Document )
	{
		var that = this;

		this.canvas = _Canvas;

// 		if ( $ )
// 		{	// Use jQuery events
// 			$()
// 		}
// 		else
		{
			// Mouse events
			_Canvas.addEventListener( 'mousedown', function( _Event ) { that.MouseDown__( _Event ); return false; } );
			_Canvas.addEventListener( 'mousemove', function( _Event ) { that.MouseMove__( _Event ); return false; } );
			_Canvas.addEventListener( 'mouseup', function( _Event ) { that.MouseUp__( _Event ); return false; } );
			_Canvas.addEventListener( 'mousewheel', function( _Event ) { that.MouseWheel__( _Event ); } );

			// Key events
			_Canvas.addEventListener( 'keydown', function( _Event ) { that.KeyDown__( _Event ); } );
			_Canvas.addEventListener( 'keyup', function( _Event ) { that.KeyUp__( _Event ); } );

			// Also listen to key presses outside the canvas
			if ( _Document )
			{
				patapi.helpers.AddEventListener( _Document, 'keydown', function( _Event ) { that.KeyDown__( _Event ); }, true );
				patapi.helpers.AddEventListener( _Document, 'keyup', function( _Event ) { that.KeyUp__( _Event ); }, true );
			}
		}
	}

	// Updates orbit speed given a rectangle size
	// This ensures we horizontally reach the [-PI,+PI] values when we get to half the provided width
	//	and the vertical [-PI/2,+PI/2] angles when we get to half the provided height
	//	
	, UpdateOrbitSpeed : function( _Width, _Height )
	{
		this.m_Options.OrbitSpeedX = 2.0 * Math.PI / _Width;
		this.m_Options.OrbitSpeedY = Math.PI / _Height;
	}

	// Updates orbit speed given a rectangle size
	// This ensures we horizontally reach the [-1,+1] values when we get to half the provided width/height and when standing at a distance of 1 from the target
	, UpdatePanSpeed : function( _Width, _Height )
	{
		this.m_Options.PanSpeedX = 2.0 / _Width;
		this.m_Options.PanSpeedY = 2.0 / _Height;
	}

	, MoveTarget : function( _Target )
	{
		_Target = _Target instanceof vec3 ? new vec3( _Target ) : vec3.zero();

		// Apply constraints
//		_Target.max( this.m_Options.PanBBoxMin ).min( this.m_Options.PanBBoxMax ); 

		var	ToPosition = this.m_Position.sub_( this.m_Target );
		this.m_Target = _Target;
		this.m_Position = _Target.add_( ToPosition );

		this.RebuildCameraMatrix__();
	}


	////////////////////////////////////////////////////////////////////////////
	// EVENTS HANDLERS
	////////////////////////////////////////////////////////////////////////////

	// Handles the mouse down event
	, MouseDown__ : function( _Event )
	{
		if ( this.eventsPreProcessor && !this.eventsPreProcessor( _Event ) )
			return false;

 		if ( _Event.type != 'mousedown' )
 			return false;

		var	Button = _Event.button;
		if ( this.m_IE )
			switch ( Button )
			{
			case 1:
				Button = 0;
				break;
			case 2:
				Button = 2;
				break;
			case 4:
				Button = 1;
				break;
			};

		this.m_ButtonsDown |= 1 << Button;					// Add this button
		this.m_ButtonDownMousePosition = new vec2( this.m_MousePos );	// Keep current mouse position
		this.m_ButtonDownTarget = this.m_Target;			// Keep current target
		this.m_ButtonDownPosition = this.m_Position;		// Keep current position
		this.m_ButtonDownDistance = this.m_Distance;		// Keep current distance

		if ( this.canvas )
			this.canvas.focus();

		return false;
	}

	// Handles the mouse up event
	, MouseUp__ : function( _Event )
	{
		if ( this.eventsPreProcessor && !this.eventsPreProcessor( _Event ) )
			return false;

 		if ( _Event.type != 'mouseup' )
 			return;

		var	Button = _Event.button;
		if ( this.m_IE )
			switch ( Button )
			{
			case 1:
				Button = 0;
				break;
			case 2:
				Button = 2;
				break;
			case 4:
				Button = 1;
				break;
			};

		this.m_ButtonsDown &= ~(1 << Button);				// Remove only this button
		this.m_ButtonDownMousePosition = new vec2( this.m_MousePos );	// Keep current mouse position
		this.m_ButtonDownTarget = this.m_Target;			// Keep current target
		this.m_ButtonDownPosition = this.m_Position;		// Keep current position
		this.m_ButtonDownDistance = this.m_Distance;		// Keep current distance
	}

	// Handles the mouse move event
	, MouseMove__ : function( _Event )
	{
		if ( this.eventsPreProcessor && !this.eventsPreProcessor( _Event ) )
			return false;

		if ( _Event.type != 'mousemove' )
			return;

//		this.ComputeNormalizedScreenPosition__( _Event.x, _Event.y );	// Only works with Chrome !
		this.ComputeNormalizedScreenPosition__( _Event.clientX, _Event.clientY );

		if ( !this.m_ButtonsDown )
			return;	// No manipulation...

		var	MouseDelta = this.m_MousePos.sub_( this.m_ButtonDownMousePosition );

		if ( this.getButtonLeft() )
		{	// Orbit
			var	ToPosition = this.m_ButtonDownPosition.sub_( this.m_ButtonDownTarget );
				ToPosition.normalize();

			var	AngleX = Math.atan2( ToPosition.x, ToPosition.z );
			var	AngleY = Math.asin( ToPosition.y );

			var	DeltaAngleX = MouseDelta.x * this.m_Options.OrbitSpeedX;
			var	DeltaAngleY = MouseDelta.y * this.m_Options.OrbitSpeedY;

			AngleX -= DeltaAngleX;
			if ( this.m_Options.ClampAngleX )
				AngleX = Math.clamp( AngleX, -Math.PI, +Math.PI );
			AngleY += DeltaAngleY;
			AngleY = Math.clamp( AngleY, -0.4999 * Math.PI, +0.4999 * Math.PI );	// Avoid gimbal lock!

			// Rotate current vector
			ToPosition.set( 
				Math.sin( AngleX ) * Math.cos( AngleY ),
				Math.sin( AngleY ),
				Math.cos( AngleX ) * Math.cos( AngleY )
			 );
			 ToPosition.mul( this.m_ButtonDownDistance );	// Scale with distance

			this.m_Position = this.m_Target.add_( ToPosition );
		}
		else if ( this.getButtonMiddle() && this.m_Options.AllowPan )
		{	// Pan
			var	DistanceFactor = 1.0 * this.m_Distance;	// Change proportionally with distance for now
			var	PanFactor = new vec2( this.m_Options.PanSpeedX, this.m_Options.PanSpeedY ).mul( DistanceFactor );
				PanFactor.mul( MouseDelta );

			// Compute pan vector in camera plane
			var	X = this.m_Camera2World.r0;
			var	Y = this.m_Camera2World.r1;
			var	DeltaWorld = X.mul_( -PanFactor.x ).add( Y.mul_( PanFactor.y ) ).xyz();

			// Pan both target & position
			var	ToPosition = this.m_ButtonDownPosition.sub_( this.m_ButtonDownTarget );
			var	NewTarget = this.m_ButtonDownTarget.add_( DeltaWorld );

			// Apply constraints
			NewTarget.max( this.m_Options.PanBBoxMin ).min( this.m_Options.PanBBoxMax ); 

			// Assign target and recompute position
			this.m_Target = NewTarget;
			this.m_Position = NewTarget.add_( ToPosition );
		}
		else if ( this.getButtonRight() )
		{	// Zoom
			var	Sign = Math.sign( MouseDelta.x );// + Math.sign( MouseDelta.y );
//			var	ZoomFactor = 1.0 + this.m_Options.ZoomSpeed * MouseDelta.length();
			var	ZoomFactor = 1.0 + this.m_Options.ZoomSpeed * Math.abs( MouseDelta.x );
			if ( Sign > 0.0 )
				ZoomFactor = 1.0 / ZoomFactor;

			var	NewDistance = this.m_ButtonDownDistance * ZoomFactor;
				NewDistance = Math.clamp( NewDistance, this.m_Options.DistanceMin, this.m_Options.DistanceMax );
			this.m_Distance = NewDistance;

			// Update position & rebuild matrix
			var	ToPos = this.m_Position.sub_( this.m_Target ).normalize();
				ToPos.mul( this.m_Distance );

			this.m_Position = this.m_Target.add_( ToPos );
		}
		else
			return;

		this.RebuildCameraMatrix__();
	}

	// Handles the mouse wheel event
	, MouseWheel__ : function( _Event )
	{
		if ( this.eventsPreProcessor && !this.eventsPreProcessor( _Event ) )
			return false;

		// Update distance
		var	ZoomFactor = 1.0 + 10.0 * this.m_Options.ZoomSpeed;
		if ( _Event.wheelDeltaY > 0.0 )
			ZoomFactor = 1.0 / ZoomFactor;

		var	NewDistance = this.m_Distance * ZoomFactor;
			NewDistance = Math.clamp( NewDistance, this.m_Options.DistanceMin, this.m_Options.DistanceMax );
		this.m_Distance = NewDistance;

		// Update position & rebuild matrix
		var	ToPos = this.m_Position.sub_( this.m_Target ).normalize();
			ToPos.mul( this.m_Distance );

		this.m_Position = this.m_Target.add_( ToPos );

		this.RebuildCameraMatrix__();
	}

	, KeyDown__ : function( _Event )
	{
		this.m_KeysDown[_Event.keyCode] = true;
	}

	, KeyUp__ : function( _Event )
	{
		this.m_KeysDown[_Event.keyCode] = false;
	}

	////////////////////////////////////////////////////////////////////////////
	// HELPERS
	////////////////////////////////////////////////////////////////////////////

	// Properly updates a patapi.webgl.Camera with a new transform
	, UpdateCamera : function( _Camera )
	{
		_Camera.SetCamera2World( this.m_Camera2World );
	}

	, ComputeNormalizedScreenPosition__ : function( _X, _Y )
	{
		var AspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;

		var	CanvasPosition = patapi.helpers.GetElementPosition( this.canvas );

		_X -= CanvasPosition.x;
		_Y -= CanvasPosition.y;

//		this.m_MousePos.set( AspectRatio * (2.0 * _X - this.canvas.clientWidth) / this.canvas.clientWidth, 1.0 - 2.0 * _Y / this.canvas.clientHeight );

		this.m_MousePos.set( _X, _Y );
	}

	, RebuildCameraMatrix__ : function()
	{
		this.m_Camera2World.makeLookAt( this.m_Position, this.m_Target, this.m_Options.Up );

		if ( this.m_Options.Callback )
			this.m_Options.Callback( this );	// Notify!
	}
};

