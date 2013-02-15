////////////////////////////////////////////////////////////////////////////
// This is the base file for the PatAPI (Patapom API).
// The PatAPI is a set of helpers functions that help you to quickly create WebGL demonstration pages
// Originally created for Google O3D in 2009, the PatAPI was later adapted for WebGL (August 2012)
//
////////////////////////////////////////////////////////////////////////////
//
//o3djs.provide( 'patapi' );	// <= Don't use here
//o3djs.require( 'o3djs.io' );
//o3djs.require( 'webgl' );

// A namespace for all the patapi utility libraries.
//
var patapi = patapi || {};

patapi.helpers = patapi.helpers || {};


////////////////////////////////////////////////////////////////////////////
// OBJECT HELPERS SECTION
////////////////////////////////////////////////////////////////////////////

//window.alert( "AMOUR! PATAPI EST LA!" );

// Extends the destination object with members from the source object
// NOTE: If a member is already defined in the destination then it's not overwritten (allowing "functions override")
//
patapi.helpers.Extend = function( _Destination, _Source )
{
	if ( typeof _Destination === "undefined" )
		_Destination = {};	// Create an empty target object...

	for ( var Property in _Source )
//		if ( !_Destination[Property] )	// What about a boolean property set to "false" ??
		if ( _Destination[Property] === undefined )
			_Destination[Property] = _Source[Property];
		
	return	_Destination;
}

// Lists all the properties of an object in the form of a multi-line string of [Key,Value] pairs
//	_optFromIndex, the optional index to start enumerating from
//
patapi.helpers.EnumerateProperties = function( _Object, _optFromIndex )
{
	if ( typeof(_Object) == typeof(undefined) )
		_Object = this;

	var	StartIndex = _optFromIndex ? _optFromIndex : 0;
	var	Result = "";
	for ( var p in _Object )
	{
		StartIndex--;
		if ( StartIndex >= 0 )
			continue;

		try
		{
			Result += p + " = " + _Object[p] + "\n";
		}
		catch ( e )
		{
			Result += p + " -> EXCEPTION: " + e + "\n";
		}
	}

	return	Result;
}


// Performs a shallow copy of the provided object
//
patapi.helpers.Copy = function( _Object )
{
	if ( typeof(_Object) == typeof(undefined) )
		_Object = this;

	var	Result = {};
	if ( _Object.constructor == Array )
		Result = new Array();
	else
		Result = {};

	for ( var p in _Object )
		Result[p] = _Object[p];

	return	Result;
}


// Performs a deep copy of the provided object
//
patapi.helpers.DeepCopy = function( _Object )
{
	if ( typeof(_Object) == typeof(undefined) )
		_Object = this;

	var	Result = _Object;
	if ( _Object.constructor == Array )
		Result = new Array();
	else if ( _Object.constructor == Object )
		Result = {};

	for ( var p in _Object )
		Result[p] = patapi.helpers.DeepCopy( _Object[p] );

	return	Result;
}

// 
// 
// // Builds a string representing the tree of render nodes from the given root
// // param _Root must be of type "RenderNode"
// //
// patapi.helpers.ShowRenderTree = function( _Root )
// {
// 	function ShowRenderTree_Recurse( _Node, _Indentation )
// 	{
// 		var	Result = _Indentation + "--> " + _Node.name + " (" + _Node.className + ") " + _Node.priority + "\n";
// 		if ( _Node.isAClassName( "o3d.RenderSurfaceSet" ) )
// 			Result += _Indentation + "       |   RenderSurface = " + _Node.renderSurface.name + "\n";
// 		else if ( _Node.isAClassName( "o3d.ClearBuffer" ) )
// 		{	// Show what is cleared
// 			var	ClearWhat = "";
// 			if ( _Node.clearColorFlag )
// 				ClearWhat += "COLOR ";
// 			if ( _Node.clearDepthFlag )
// 				ClearWhat += "+ DEPTH ";
// 			if ( _Node.clearStencilFlag )
// 				ClearWhat += "+ STENCIL";
// 			Result += _Indentation + "       |   Clear " + ClearWhat + "\n";
// 		}
// 		else if ( _Node.isAClassName( "o3d.Viewport" ) )
// 			Result += _Indentation + "       |   Rect = " + _Node.viewport + "\n";
// 
// 		var	ChildIndentation = _Indentation + "       |";
// 
// 		var Children = _Node.children;
// 		for ( var ChildIndex=0; ChildIndex < Children.length; ChildIndex++ )
// 		{
// 			Result += ChildIndentation + "\n";
// 			Result += ShowRenderTree_Recurse( Children[ChildIndex], ChildIndentation );
// 		}
// 
// 		return	Result;
// 	}
// 
// 	return	ShowRenderTree_Recurse( _Root, "|" );
// };
// 
// 
// // Builds a string representing the tree of transform nodes from the given root
// // param _Root must be of type "Transform"
// //
// patapi.helpers.ShowTransformTree = function( _Root )
// {
// 	function	ShowTransformTree_Recurse( _Node, _Indentation )
// 	{
// 		var	Result = _Indentation + "--> " + _Node.name + " (ShpCnt = " + _Node.shapes.length + ") " + (_Node.visible ? "" : "INVISIBLE") + "\n";
//  		if ( _Node.shapes.length > 0 )
//  		{
//  			var	Shapes = _Node.shapes;
//  			for ( var ShapeIndex=0; ShapeIndex < Shapes.length; ShapeIndex++ )
//  			{
//  				var	TotalDrawElementsCount = 0
// 				var	Primitives = Shapes[ShapeIndex].elements;
// // 				for ( var PrimitiveIndex=0; PrimitiveIndex < Primitives.length; PrimitiveIndex++ )
// // 					TotalDrawElementsCount += Primitives[PrimitiveIndex].drawElements.length;
// // 					
// // 	 			Result += _Indentation + "       |   Shape #" + ShapeIndex + " PrimsCount = " + Shapes[ShapeIndex].elements.length + " DrawElementsCount = " + TotalDrawElementsCount + "\n";
// 
// 				for ( var PrimitiveIndex=0; PrimitiveIndex < Primitives.length; PrimitiveIndex++ )
// 		 			Result += _Indentation + "       |   Shape #" + ShapeIndex + " Primitive #" + PrimitiveIndex + " " + Primitives[PrimitiveIndex].name + " DrawElementsCount=" + Primitives[PrimitiveIndex].drawElements.length + "\n";
//  			}
//  		}
// 
// 		var	ChildIndentation = _Indentation + "       |";
// 
// 		var Children = _Node.children;
// 		for ( var ChildIndex=0; ChildIndex < Children.length; ChildIndex++ )
// 		{
// 			Result += ChildIndentation + "\n";
// 			Result += ShowTransformTree_Recurse( Children[ChildIndex], ChildIndentation );
// 		}
// 
// 		return	Result;
// 	}
// 
// 	return	ShowTransformTree_Recurse( _Root, "|" );
// };


////////////////////////////////////////////////////////////////////////////
// OBJECT TRACKING HELPERS SECTION
////////////////////////////////////////////////////////////////////////////
// 
// patapi.helpers.m_Dependencies = new Object();
// 
// // Adds a dependency on the provided O3D object (WARNING: the object must be a ParamObject !)
// // When the object is disposed of, the callback will be called
// //
// //	_Object, the object to add a dependency to
// //	_DependencyName, the name of the dependency to add
// //	_CallbackFunction, the callback function that will be called when the object is getting disposed of
// //
// patapi.helpers.AddObjectDependency = function( _Object, _DependencyName, _CallbackFunction )
// {
// 	if ( !_Object.isAClassName( "o3d.ParamObject" ) )
// 		throw "You can only add object dependencies on ParamObjects !"
// 
// 	// Store the callback for that dependency
// 	this.m_Dependencies[_DependencyName] = _CallbackFunction;
// 
// 	// Create a ParamParamArray on the object
// 	var	ParamDependencies = _Object.getParam( "Dependencies" );
// 	if ( !ParamDependencies )
// 		ParamDependencies = _Object.createParam( "Dependencies", "o3d.ParamString" );
// 
// 	// Append the dependency name in the param
// 	ParamDependencies.value = ParamDependencies.value + ";" + _DependencyName;
// 
// //o3djs.dump.dump( "Dependencies on Object \"" + _Object.name + "\" = " + ParamDependencies.value + "\n" );
// }
// 
// // Gets all the dependencies on the given object (WARNING: the object must be a ParamObject !)
// //	_Object, the object to retrieve dependencies of
// //	returns an array of objects of the type :
// //	{
// //		"Name" : "the dependency name",
// //		"this" : the "this" object to call the callback with,
// //		"Callback" : The dependency callback to call
// //	}
// //
// patapi.helpers.GetObjectDependencies = function( _Object )
// {
// 	if ( !_Object || !_Object.isAClassName( "o3d.ParamObject" ) )
// 		return	null;
// 
// 	var	Result = [];
// 
// 	var	ParamDependencies = _Object.getParam( "Dependencies" );
// 	if ( ParamDependencies )
// 	{
// 		var	Dependencies = ParamDependencies.value.split( ";" );
// 		for ( var DependencyIndex=1; DependencyIndex < Dependencies.length; DependencyIndex++ )
// 		{
// 			var	DependencyName = Dependencies[DependencyIndex];
// 			var	Dependency = {};
// 				Dependency["Name"] = DependencyName;
// 				Dependency["Callback"] = this.m_Dependencies[DependencyName];
// 
// 			Result.push( Dependency );
// 		}
// 	}
// 
// 	return	Result;
// }
// 

////////////////////////////////////////////////////////////////////////////
// HTML HELPERS SECTION
////////////////////////////////////////////////////////////////////////////

// Tells if the navigator is IE
//
patapi.helpers.isIE = function()
{
	return	navigator.userAgent.match( /MSIE/i );
}

// Tells if the navigator is safari
//
patapi.helpers.isSafari = function()
{
	return	navigator.userAgent.match( /safari/i );
}

// Returns the size of the window as an object with width/height fields
// Taken from : http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
//
patapi.helpers.GetWindowSize = function( _Window )
{
	var myWidth = 0, myHeight = 0;
	if ( typeof( window.innerWidth ) == 'number' )
	{	//Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	} else if ( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) )
	{	//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	} else if ( document.body && ( document.body.clientWidth || document.body.clientHeight ) )
	{	// IE 4 compatible
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	}

	return	{ "Width" : myWidth, "Height" : myHeight };
}

// Returns the absolute position of the given element within the window as an object with x/y field
// Taken from : http://forum.alsacreations.com/topic-5-38724-1-Calculer-la-position-dun-element-en-javascript.html
// Note : this function is recursive an may take some time so cache the result somewhere !
//
patapi.helpers.GetElementPosition = function( _Element )
{
	function getPositionLeft( obj )
	{
		var curleft = 0;
		if ( obj.offsetParent )
		{
			curleft = obj.offsetLeft;
			while (obj = obj.offsetParent) {curleft += obj.offsetLeft;}
		}
		return curleft;
	}

	function getPositionTop( obj )
	{
		var curtop = 0;
		if (obj.offsetParent)
		{
			curtop = obj.offsetTop;
			while (obj = obj.offsetParent) {curtop += obj.offsetTop;}
		}
		return curtop;
	}

	return { x : getPositionLeft( _Element ), y : getPositionTop( _Element ) };
}

// Adds an event listener to the provided element (supports IE & FF)
//	_Element, the DOM element to add an event listener to
//	_Type, the type of event to listen to
//	_Function, the function called when the event is triggered
//	_optUseCapture, an optional capture flag (cf. https://developer.mozilla.org/en/DOM/element.addEventListener)
//
patapi.helpers.AddEventListener = function( _Element, _Type, _Function, _optUseCapture )
{
	if ( _Element.addEventListener )
		_Element.addEventListener( _Type, _Function, _optUseCapture ? _optUseCapture : false );
	else if ( _Element.attachEvent )
		_Element.attachEvent( 'on' + _Type, _Function );
	else
		throw "Unknown element ! It doesn't support addEventListener() nor attachEvent() !";
}

// Load files
//	_Callback must be function( _URL, _Request )
//
patapi.helpers.LoadFileAsynchronous = function( _URL, _Callback )
{
	var	Request = new XMLHttpRequest();
	Request.open( "GET", _URL, true );
	Request.URL = _URL;
	Request.onload = function() { _Callback( _URL, Request ); }
	Request.send();
}

patapi.helpers.LoadFileSynchronous = function( _URL )
{
	var	Request = new XMLHttpRequest();
	Request.open( "GET", _URL, false );	// Synchronous load
	Request.send();
	if ( Request.readyState != 4 )
		throw "Failed to load file \"" + _URL + "\" !";
	if ( Request.status == 404 )
		throw "File not found \"" + _URL + "\" !";

	return Request.responseText;
}

//////////////////////////////////////////////////////////////////////////
// Loads a binary array buffer
//	_URL, the URL of the binary file containing the array buffer
//	_Callback, a function that will be called once the file is received
//
// Here is an example of callback :
//	function Bli( _URL, _ArrayBuffer )
//	{
// 		var	ByteArray = new Uint8Array( _ArrayBuffer );
// 		for ( var i = 0; i < byteArray.byteLength; i++ )
// 			// do something with each byte in the array
//	}
//
patapi.helpers.LoadTypedArray = function( _URL, _Callback, _UserData )
{
	var	Request = new XMLHttpRequest();
	Request.open( "GET", _URL, true );
	Request.responseType = "arraybuffer";
 
	Request.onload = function( _Event )
	{
		if ( Request.status == 404 )
			throw "Array file not found \"" + _URL + "\" !";
		var ArrayBuffer = Request.response;	// Note: not Request.responseText
		if ( !ArrayBuffer )
			throw "Failed to receive proper arrayBuffer from \"" + _URL + "\" !";

		// Notify of load
		_Callback( _URL, ArrayBuffer, _UserData );
	};
 
	Request.send( null );
}

// Strips a URL and returns an object containing { Path : "Path", File : "File" }
// From http://stackoverflow.com/questions/4497531/javascript-get-url-path
//
// For example, assuming you're standing at "http://www.patapom.com/Choubidou/" and have the relative URL of file "Bisou.json"
//	then the full absolute URL path is "http://www.patapom.com/Choubidou/Bisou.json" and this function will return the object :
//
//	{
//		Path : "http://www.patapom.com/Choubidou/"
//		File : "Bisou.json"
//	}
//
patapi.helpers.SplitPath = function( _URL )
{
	var	a = document.createElement('a');
		a.href = _URL;

//	var path = a.pathname + a.search;
//	return { Path : a.pathname, File : a.search };

	var	IndexOfLastSlash = a.href.lastIndexOf( '/' );
	var	Result =
	{
		Path : a.href.substr( 0, IndexOfLastSlash+1 ),
		File : a.href.substr( IndexOfLastSlash+1, a.href.length - IndexOfLastSlash - 1 )
	};
	return Result;
}

// Detect firefox
o3djs.base.IsFirefox = function()
{
	var ua = navigator.userAgent.toLowerCase();
	return ua.indexOf("firefox") != -1;
};


// // Loads a texture asynchronously
// //	_Pack, the pack into which the texture should be loaded
// //	_URL, the URL of the texture to load
// //	_Callback, the callback that will be called once the texture is ready. Prototype is : function( _Texture )
// //
// patapi.helpers.LoadTexture = function( _Pack, _URL, _Callback )
// {
// 	o3djs.io.loadTexture( _Pack, _URL, function( _Texture, _Exception )
// 	{
// 		if ( _Exception )
// 		{
// window.alert( "An error occurred while loading texture \"" + _URL + "\" : " + _Exception );
// 			throw "An error occurred while loading texture \"" + _URL + "\" : " + _Exception;
// 		}
// 
// 		// Notify
// 		if ( _Callback )
// 			_Callback( _Texture );
//     } );
// }
// 
// // Loads a raw-data asynchronously
// //	_Pack, the pack into which the raw-data should be loaded
// //	_URL, the URL of the raw-data to load
// //	_Callback, the callback that will be called once the raw-datais ready. Prototype is : function( _RawData )
// // Returns a LoadInfo to monitor the loading progress
// //
// patapi.helpers.LoadRawData = function( _Pack, _URL, _Callback )
// {
// 	var Request = _Pack.createFileRequest( 'RAWDATA' );
// 	var LoadInfo = o3djs.io.createLoadInfo( Request, false );
// 
// 	Request.open( 'GET', _URL, true );
// 	Request.onreadystatechange = function()
// 	{
// 		if ( !Request.done )
// 			return;
// 
// 		var Exception = Request.error;
// 		var Success = Request.success;
// 		if ( !Success && !Exception )
// 			Exception = 'unknown error loading raw-data \"' + _URL + '\"';
// 		if ( Exception )
// 			throw Exception;
// 
// 		// Retrieve the raw data and delete the request from the pack
// 		var	RawData = Request.data;
// 
// 		// Notify of success
// 		_Callback( RawData );
// 
// 		LoadInfo.finish();
// 		_Pack.removeObject( Request );
// 	};
// 
// 	// Start!
// 	Request.send();
// 
// 	return	LoadInfo;
// }
