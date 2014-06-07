// A camera manipulator simulating a first person walk
//
o3djs.require( 'patapi' );
o3djs.require( 'patapi.math' );
o3djs.provide( 'patapi.camera_firstperson_walk' )


// Class to hold Camera Manipulator information
//	_CharacterHeight, the height above the floor at which the character is standing
//	_CharacterPosition (vec3), the original position where the character is standing at
//	_ForwardAxis (vec3), the original direction the character is facing
//	opt_CharacterWalkSpeed, an optional walking speed in world units per second (default is 1)
//	opt_CharacterTurnSpeed, an optional turning speed (default is 1)
//	opt_JumpMaxHeight, an optional jump height (default is 0)
//
patapi.cameraFirstPersonWalk = function( _CharacterHeight, _CharacterPosition, _ForwardAxis, opt_CharacterWalkSpeed, opt_CharacterTurnSpeed, opt_JumpMaxHeight )
{
	this.m_CharacterHeight = _CharacterHeight;
	this.m_CharacterPosition = _CharacterPosition;

	_ForwardAxis = _ForwardAxis.normalized();
	this.m_CharacterAngle = Math.atan2( _ForwardAxis.x, _ForwardAxis.z );
	this.m_ViewAngleX = 0.0;
	this.m_ViewAngleY = 0.0;

	this.m_CharacterWalkSpeed = opt_CharacterWalkSpeed ? opt_CharacterWalkSpeed : 1.0;
	this.m_CharacterTurnSpeed = opt_CharacterTurnSpeed ? opt_CharacterTurnSpeed : 1.0;
	this.m_CharacterJumpMaxHeight = opt_JumpMaxHeight ? opt_JumpMaxHeight : 0.0;
	this.m_CharacterJumpHeight = 0.0;
	this.m_CharacterJumping = false;
	this.m_CharacterJumpElapsedTime = 0.0;

	this.m_ButtonsDown = 0;
	this.m_bFrozen = false;
	this.m_bAllowFreezeView = false;
	this.m_bPointerLocked = false;		// Set to true by using the patapi.PointerLock helper
	
	// Camera manipulation parameters
	this.m_QWERTY = false;
	this.m_FPSMode = true;	// 2014-06-07 -> at last!
	this.m_ManipulationZoomSpeed = 1.0;
	this.m_MaxHeadTurnX = 0.5 * Math.PI;
	this.m_MaxHeadTurnY = 0.45 * Math.PI;

	// Keys controlling direction
	this.m_KeysDown = {};
	this.m_Walk = 0;
	this.m_TurnOrStrafe = 0;

	// Browser-specific offsets
	this.m_IE = o3djs.base.IsMSIE();
};

patapi.cameraFirstPersonWalk.prototype = 
{
	Destroy : function()
	{

	},

	////////////////////////////////////////////////////////////////////////////
	// PROPERTIES
	////////////////////////////////////////////////////////////////////////////
	
	// Gets or sets QWERTY mode
	getQWERTY : function()			{ return this.m_QWERTY; },
	setQWERTY : function( _Value )	{ this.m_QWERTY = _Value; },

	// Gets or sets FPS mode
	getFPSMode : function()			{ return this.m_FPSMode; },
	setFPSMode : function( _Value )	{ this.m_FPSMode = _Value; },

	// Gets or sets the PointeLock mode
	getPointerLocked : function()			{ return this.m_bPointerLocked; },
	setPointerLocked : function( _Value )	{ this.m_bPointerLocked = _Value; },

	// Gets the currently pressed buttons
	getButtonsDown : function()		{ return this.m_ButtonsDown; },

	// Gets the left button state
	getButtonLeft : function()		{ return this.m_ButtonsDown & 1; },

	// Gets the middle button state
	getButtonMiddle : function()	{ return this.m_ButtonsDown & 2; },

	// Gets the right button state
	getButtonRight : function()		{ return this.m_ButtonsDown & 4; },

	// Gets the last CAMERA->WORLD matrix
	getCamera2World : function()	{ return this.m_CameraMatrix; },


	////////////////////////////////////////////////////////////////////////////
	// METHODS
	////////////////////////////////////////////////////////////////////////////

	// Attaches the manipulator to O3D mouse events
	//
	AttachToEvents : function( _Canvas, _Document )
	{
		var that = this;

		this.canvas = _Canvas;

		// Mouse events
		_Canvas.addEventListener( 'mousedown', function( _Event ) { that.MouseDown( _Event ); } );
		_Canvas.addEventListener( 'mousemove', function( _Event ) { that.MouseMove( _Event ); } );
		_Canvas.addEventListener( 'mouseup', function( _Event ) { that.MouseUp( _Event ); } );
		_Canvas.addEventListener( 'wheel', function( _Event ) { that.MouseWheel( _Event ); } );

		// Key events
		_Canvas.addEventListener( 'keydown', function( _Event ) { that.KeyDown( _Event ); } );
		_Canvas.addEventListener( 'keyup', function( _Event ) { that.KeyUp( _Event ); } );

		// Also listen to key presses outside the canvas
		if ( _Document )
		{
			patapi.helpers.AddEventListener( _Document, 'keydown', function( _Event ) { that.KeyDown( _Event ); }, true );
			patapi.helpers.AddEventListener( _Document, 'keyup', function( _Event ) { that.KeyUp( _Event ); }, true );
		}
	},

	// Attaches a Walk-Zone buffer to the manipulator
	//	_Buffer, the Uint8Array buffer containing the walkzone data
	//	_BufferDimensions, the size of the walkzone buffer (an array of 2 values for X & Y)
	//	_XZOffset, _XZScale, the offset/scale to correctly transform a XZ world position into a buffer coordinate
	//	_HeightColorOffset, _HeightColorScale, the offset/scale to correctly transform a color from the buffer into a world Y altitude
	//
	SetWalkZoneData : function( _Buffer, _BufferDimensions, _XZOffset, _XZScale, _HeightColorOffset, _HeightColorScale )
	{
		this.m_WalkBuffer = _Buffer;
		this.m_WalkBufferDimensions = _BufferDimensions;
		this.m_XZOffset = _XZOffset;
		this.m_XZScale = _XZScale;
		this.m_HeightColorOffset = _HeightColorOffset;
		this.m_HeightColorScale = _HeightColorScale;
	},

	// Samples the walkzone buffer for a single RGB triplet at an integer position
	//
	SampleWalkZone : function( _X, _Y )
	{
		// Transform into integers
		_X = Math.floor( _X ) | 0;
		_Y = Math.floor( _Y ) | 0;

		// Clamp
		_X = Math.clamp( _X, 0, this.m_WalkBufferDimensions[0]-1 );
		_Y = Math.clamp( _Y, 0, this.m_WalkBufferDimensions[1]-1 );

		// Fetch
		var	Offset = 3 * (this.m_WalkBufferDimensions[0] * _Y + _X);
		var	Result = [0,0,0];
		Result[0] = this.m_WalkBuffer[Offset + 0];
		Result[1] = this.m_WalkBuffer[Offset + 1];
		Result[2] = this.m_WalkBuffer[Offset + 2];
		return Result;
	},

	// Samples the walkzone buffer for a bilinear interpolated height value
	BilerpWalkZone : function( _X, _Y, _ComponentIndex )
	{
		var	X0 = Math.floor( _X ) | 0;
		var	Y0 = Math.floor( _Y ) | 0;
		var	x = _X - X0;
		var	y = _Y - Y0;
		var	X1 = X0+1;
		var	Y1 = Y0+1;

		// Sample the values at the 4 corners of the texel
		var	V00 = this.SampleWalkZone( X0, Y0 )[_ComponentIndex];
		var	V01 = this.SampleWalkZone( X1, Y0 )[_ComponentIndex];
		var	V10 = this.SampleWalkZone( X0, Y1 )[_ComponentIndex];
		var	V11 = this.SampleWalkZone( X1, Y1 )[_ComponentIndex];

		var	V0 = (1.0-x)*V00 + x*V01;
		var	V1 = (1.0-x)*V10 + x*V11;
		var	V = (1.0-y)*V0 + y*V1;
		return V;
	},

	// Updates the camera matrix based on current character orientation & view matrix
	//
	Update : function( _DeltaTime )
	{
		var	fAngleX = this.m_CharacterAngle - this.m_ViewAngleX;
		var	fAngleY = this.m_ViewAngleY;

		// Perform jumping
		this.m_CharacterJumpElapsedTime += _DeltaTime;	// Jump mechanics
		if ( this.m_CharacterJumping )
		{	// Continue the jump
			var	t = 1.0 * this.m_CharacterJumpElapsedTime;	// 1s for the entire jump
				t = 2.0 * t - 1.0;	// Between [-1,+1] => -1 start, +1 end
				t = 1.0 - t*t;		// Parabolic jump
			if ( t < 0.0 )
			{	// End jump...
				t = 0.0;
				this.m_CharacterJumping = false;
			}

			this.m_CharacterJumpHeight = this.m_CharacterJumpMaxHeight * t;
		}

		// Perform walking
		var	ForwardAxis = new vec3( Math.sin( fAngleX ), 0, Math.cos( fAngleX ) ).mul( -this.m_Walk );
		var	PreviewedCharacterPosition = this.m_CharacterPosition.add_( ForwardAxis.mul_( this.m_CharacterWalkSpeed * _DeltaTime ) );			

		// Perform strafing
		if ( this.m_FPSMode )
		{
			var	RightAxis = new vec3( -Math.cos( fAngleX ), 0, Math.sin( fAngleX ) ).mul( -this.m_TurnOrStrafe );
 			PreviewedCharacterPosition = PreviewedCharacterPosition.add_( RightAxis.mul_( this.m_CharacterWalkSpeed * _DeltaTime ) );
		}

		// Check for collisions & height based on walk-zone buffer (if available)
		if ( this.m_WalkBuffer && this.m_Walk != 0 )
		{
			// Convert current (X,Z) position on the walking plane into buffer position
			var	Px = this.m_CharacterPosition.x * this.m_XZScale.x + this.m_XZOffset.x;
			var	Pz = this.m_CharacterPosition.z * this.m_XZScale.y + this.m_XZOffset.y;

			this.m_CharacterPosition.y = this.BilerpWalkZone( Px, Pz, 1 );	// Sample current height
			this.m_CharacterPosition.y = this.m_CharacterPosition.y * this.m_HeightColorScale + this.m_HeightColorOffset;

			// Check for collision
			var	NextPx = PreviewedCharacterPosition.x * this.m_XZScale.x + this.m_XZOffset.x;
			var	NextPz = PreviewedCharacterPosition.z * this.m_XZScale.y + this.m_XZOffset.y;

			var	Collision = this.BilerpWalkZone( NextPx, NextPz, 0 );
 			if ( Collision < 255 )
 			{
				// Use distance gradients to determine which way we should "slide" along the solid boundary
				var	GradientValue = this.BilerpWalkZone( Px, Pz, 2 );
				var	GradientAngle = GradientValue * 2.0 * Math.PI / 256.0;
				var	SlideVector = new vec3( Math.cos( GradientAngle ), 0, -Math.sin( GradientAngle ) );
				
				// Weight by dot product with forward axis so we don't slide at all if we're facing the obstacle and so we slide reverse if walking backward
				SlideVector = SlideVector.mul_( SlideVector.dot( ForwardAxis ) );
				// Move a little away from obstacle
				SlideVector = SlideVector.add( new vec3( -SlideVector.z, 0, SlideVector.x ).mul( 0.1 ) );
				
				PreviewedCharacterPosition = this.m_CharacterPosition.add_( SlideVector.mul ( this.m_CharacterWalkSpeed * _DeltaTime ) );

// 				var	OutVector = {}.vec3();
// 				for ( var z=-1; z <= 1; z++ )
// 					for ( var x=-1; x <= 1; x++ )
// 						if ( x != 0 || z != 0 )
// 						{
// 							var	NeighborCollision = 1.0 - this.BilerpWalkZone( NextPx-1.0, NextPz, 0 ) / 255.0;
// 							var	NeighborVector = {}.vec3( x, 0.0, z );
// 							vec3add( OutVector, vec3mul( NeighborCollision, NeighborVector ) );
// 						}
// 				vec3normalize( OutVector );
// 
// 				PreviewedCharacterPosition = vec3add( this.m_CharacterPosition, vec3mul( this.m_CharacterWalkSpeed * _DeltaTime, OutVector ) );	// Simply block !
 			}
		}
		
		// Perform walking
		this.m_CharacterPosition = PreviewedCharacterPosition;

		// Perform turning
		if ( !this.m_FPSMode )
			this.m_CharacterAngle -= this.m_TurnOrStrafe * this.m_CharacterTurnSpeed * _DeltaTime;

		// Rebuild camera matrix
		this.m_CameraMatrix = mat4.rotationZYX( fAngleY, fAngleX, 0 );
		this.m_CameraMatrix.r2 = this.m_CameraMatrix.r2.neg_();	// Simply reverse Z for a decent camera
		this.m_CameraMatrix.r3 = new vec4( this.m_CharacterPosition.add_( new vec3( 0, this.m_CharacterHeight + this.m_CharacterJumpHeight, 0 ) ), 1 );

		// Return the updated matrix
		return this.m_CameraMatrix;
	},


	////////////////////////////////////////////////////////////////////////////
	// EVENTS HANDLERS
	////////////////////////////////////////////////////////////////////////////

	// Handles the mouse down event
	MouseDown : function( _Event )
	{
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

		this.m_ButtonsDown |= 1 << Button;		// Add this button

// ### DEBUG Freeze on right click
if ( (this.m_bAllowFreezeView || this.m_bFrozen) && this.m_ButtonsDown & 4 )
	this.m_bFrozen = !this.m_bFrozen;
// DEBUG

		return false;
	},

	// Handles the mouse up event
	MouseUp : function( _Event )
	{
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

		this.m_ButtonsDown &= ~(1 << Button);	// Remove only this button
	},

	// Handles the mouse move event
	MouseMove : function( _Event )
	{
		if ( _Event.type != 'mousemove' )
			return;

// DEBUG
if ( this.m_bFrozen )
	return;	// FROZEN !
// DEBUG

		if ( this.m_bPointerLocked )
		{	// Handle locked pointer mode
			// From http://www.html5rocks.com/en/tutorials/pointerlock/intro/
			//
			var movementX = _Event.movementX		||
							_Event.mozMovementX		||
							_Event.webkitMovementX	||
							0;
			var	movementY = _Event.movementY		||
							_Event.mozMovementY		||
							_Event.webkitMovementY	||
							0;

			this.m_ViewAngleX += movementX * Math.PI / this.canvas.width;
			this.m_ViewAngleY -= movementY * Math.PI / this.canvas.height;
			if ( !this.m_FPSMode )
				this.m_ViewAngleX = Math.max( -this.m_MaxHeadTurnX, Math.min( this.m_MaxHeadTurnX, this.m_ViewAngleX ) );
			this.m_ViewAngleY = Math.max( -this.m_MaxHeadTurnY, Math.min( this.m_MaxHeadTurnY, this.m_ViewAngleY ) );
		}
		else
		{	// Normal unlocked pointer mode
//			var	MousePos = this.ComputeNormalizedScreenPosition_( _Event.x, _Event.y );	// Only works on Chrome !
			var	MousePos = this.ComputeNormalizedScreenPosition_( _Event.clientX, _Event.clientY );
			MousePos[0] = Math.max( -1, Math.min( 1, MousePos[0] ) );
			MousePos[1] = Math.max( -1, Math.min( 1, MousePos[1] ) );

			if ( this.m_FPSMode )
				this.m_ViewAngleX = MousePos[0] * Math.PI;
			else
				this.m_ViewAngleX = MousePos[0] * this.m_MaxHeadTurnX;
			this.m_ViewAngleY = MousePos[1] * this.m_MaxHeadTurnY;
		}
	},

	// Handles the mouse wheel event
	MouseWheel : function( _Event )
	{
	},

	KeyDown : function( _Event )
	{
		this.m_KeysDown[_Event.keyCode] = true;
		this.UpdateDirections_();
		
// DEBUG CAMERA FREEZE
// if ( _Event.keyCode == 32 && !('synthetic' in _Event) )
// 	this.m_bFrozen = !this.m_bFrozen;
// DEBUG CAMERA FREEZE
	},

	KeyUp : function( _Event )
	{
		this.m_KeysDown[_Event.keyCode] = false;
		this.UpdateDirections_();
	},

	////////////////////////////////////////////////////////////////////////////
	// HELPERS
	////////////////////////////////////////////////////////////////////////////

	// Update directions based on currently pressed keys
	//
	UpdateDirections_ : function()
	{
		this.m_Walk = 0;
		this.m_TurnOrStrafe = 0;

		if ( this.m_QWERTY )
		{
			if ( this.m_KeysDown[37] || this.m_KeysDown[65] ) { this.m_TurnOrStrafe--; }	// A
			if ( this.m_KeysDown[39] || this.m_KeysDown[68] ) { this.m_TurnOrStrafe++; }	// D
			if ( this.m_KeysDown[38] || this.m_KeysDown[87] ) { this.m_Walk++; }	// W
			if ( this.m_KeysDown[40] || this.m_KeysDown[83] ) { this.m_Walk--; }	// S
		}
		else	// AZERTY
		{
			if ( this.m_KeysDown[37] || this.m_KeysDown[81] ) { this.m_TurnOrStrafe--; }	// Q
			if ( this.m_KeysDown[39] || this.m_KeysDown[68] ) { this.m_TurnOrStrafe++; }	// D
			if ( this.m_KeysDown[38] || this.m_KeysDown[90] ) { this.m_Walk++; }	// Z
			if ( this.m_KeysDown[40] || this.m_KeysDown[83] ) { this.m_Walk--; }	// S
		}

		// Handle jumping with SPACE
		if ( this.m_CharacterJumpMaxHeight <= 0.0 )
			return;	// White men can't jump !

		if ( !this.m_CharacterJumping && this.m_KeysDown[32] )
		{	// Initiate the jump
			this.m_CharacterJumping = true;
			this.m_CharacterJumpElapsedTime = 0.0;
		}
	},

	ComputeNormalizedScreenPosition_ : function( _X, _Y )
	{
		var AspectRatio = this.canvas.width / this.canvas.height;

		_X -= this.canvas.offsetLeft;
		_Y -= this.canvas.offsetTop;

		return [AspectRatio * (2.0 * _X - this.canvas.width) / this.canvas.width, 1.0 - 2.0 * _Y / this.canvas.height];
	}
};

