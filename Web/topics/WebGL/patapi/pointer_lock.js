//////////////////////////////////////////////////////////////////////////
// This file contains helpers to handle the pointer lock API
//	http://www.html5rocks.com/en/tutorials/pointerlock/intro/
//
//////////////////////////////////////////////////////////////////////////
//
o3djs.require( 'patapi' );
o3djs.require( 'patapi.webgl' );
o3djs.provide( 'patapi.pointer_lock' );

// Add the PointerLock extension
patapi.pointer_lock = patapi.pointer_lock || {};

//////////////////////////////////////////////////////////////////////////
// Attemps to build video object grabbing the webcam
//	_Init, the init structure whose model is given right above
//	opt_Callback, an optional callback called when the video is ready (prototype is function( _VideoObject )
//	opt_CallbackError, an optional callback called if the video failed to initialize (prototype is function( _VideoObject, _Error )
// Returns a Video object
// Throws if no video object could be created
//
patapi.pointer_lock.RequestPointerLock = function()
{
	return new patapi.PointerLock();
}

//////////////////////////////////////////////////////////////////////////
// The Video object
patapi.PointerLock = function()
{
	this.m_isAvailable =	'pointerLockElement' in document ||
							'mozPointerLockElement' in document ||
							'webkitPointerLockElement' in document;
	this.m_isLocked = false;
	this.m_element = null;
	this.__m_LockStateChangedCallback = null;

	var	that = this;
	this.LockChangeCallback = function() {
		that.__LockChangeCallback();
	};
}

patapi.PointerLock.prototype =
{
	// Tells if the DOM element is currently in cursor lock mode
	getIsLocked : function() { return this.m_isLocked; }

	// Requests the pointer lock on a specific DOM element
	//	__opLockReleased, an optional callback that is called whenever the lock is released
	, Capture : function( _element, __optLockStateChanged )
	{
		if ( !this.m_isAvailable )
			return false;	// Don't even bother

		this.m_element = _element;
		this.__m_LockStateChangedCallback = __optLockStateChanged;

		var	that = this;
		function	LockChangeCallback( e ) {
		}

		if ( !_element.requestPointerLock )
		{	// Register the listeners only once
			document.addEventListener( 'pointerlockchange', this.LockChangeCallback, false );
			document.addEventListener( 'mozpointerlockchange', this.LockChangeCallback, false );
			document.addEventListener( 'webkitpointerlockchange', this.LockChangeCallback, false );
		}

		_element.requestPointerLock = _element.requestPointerLock ||
								      _element.mozRequestPointerLock ||
									  _element.webkitRequestPointerLock;
		_element.requestPointerLock();

		return true;
	}

	, Release : function( _element )
	{
		if ( !this.m_isAvailable )
			return;	// Don't even bother

		document.removeEventListener( 'pointerlockchange', this.LockChangeCallback, false );
		document.removeEventListener( 'mozpointerlockchange', this.LockChangeCallback, false );
		document.removeEventListener( 'webkitpointerlockchange', this.LockChangeCallback, false);

		_element.exitPointerLock  = _element.exitPointerLock  ||
								    _element.mozExitPointerLock ||
									_element.webkitExitPointerLock;
		_element.exitPointerLock();
	}

	//////////////////////////////////////////////////////////////////////////
	, __LockChangeCallback : function() 
	{
		if ( document.mozPointerLockElement === this.m_element ||
			 document.webkitPointerLockElement === this.m_element ) {
			this.m_isLocked = true;
		} else {
			this.m_isLocked = false;
		}

		if ( this.__m_LockStateChangedCallback )
			this.__m_LockStateChangedCallback( this.m_isLocked );
	}
}
