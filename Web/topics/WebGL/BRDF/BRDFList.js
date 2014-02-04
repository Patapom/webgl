/*
 Hosts the manager of BRDFs
 Handles the toolbar + list of BRDFs
 */

o3djs.provide( 'BRDF.BRDFList' );
o3djs.require( 'patapi.math' );
o3djs.require( 'patapi.webgl' );
o3djs.require( 'BRDF.BRDFSlice' );
o3djs.require( 'BRDF.BRDFAnalytical' );
o3djs.require( 'BRDF.BRDFPom' );
o3djs.require( 'BRDF.BRDFPainter' );
o3djs.require( 'BRDF.BRDFEigen' );

BRDFList = function()
{
	var	that = this;

	// Our notification list
	this.subscribers = [];

	// Save our UI elements
	this.list = $("#ContainerBRDFExplorerListBRDFs");
	this.toolbar = $("#ContainerBRDFExplorerListToolbar");

	//////////////////////////////////////////////////////////////////////////
	// Build the toolbar button for MERL BRDFs
	this.toolbarButton_AddBRDFMERL = $("#BRDFListUI_AddBRDFMERL");
	this.toolbarButton_AddBRDFMERL.click( function() {
		$("ul:first-of-type", this).css( "display", "block" ).hover( undefined, function() { $(this).fadeOut( 100 ); } );
	} );

	function CreateCallbackMERL( _BRDFIndex ) { return function() { that.AddBRDF_Slice( _BRDFIndex ); } }

	this.toolbarButton_AddBRDFMERL.prepend( '<ul class="drop-down-list" style="left:1px;"/>' );
	var	UL = $( "ul:first-of-type", this.toolbarButton_AddBRDFMERL );

	for ( var BRDFIndex=0; BRDFIndex < this.MERLBRDFNames.length; BRDFIndex++ )
	{
		UL.append( '<li title=" ">' + this.MERLBRDFNames[BRDFIndex] + '</li>' );
		$( "li:nth-child(" + (1 + BRDFIndex) + ")", UL ).click( CreateCallbackMERL( BRDFIndex ) );
	}

	//////////////////////////////////////////////////////////////////////////
	// Build the toolbar button for Analytical BRDFs
	this.toolbarButton_AddBRDFAnalytical = $("#BRDFListUI_AddBRDFAnalytical");
	this.toolbarButton_AddBRDFAnalytical.click( function() {
		$("ul:first-of-type", this).css( "display", "block" ).hover( undefined, function() { $(this).fadeOut( 100 ); } );
	} );

	this.toolbarButton_AddBRDFAnalytical.prepend( '<ul class="drop-down-list auto-height" style="left:24px;"/>' );
	var	UL = $( "ul:first-of-type", this.toolbarButton_AddBRDFAnalytical );

	UL.append( '<li title=" ">Blinn-Phong</li>' );			$( "li:nth-child(1)", UL ).click( function() { that.AddBRDF_Analytical( 0 ); } );
	UL.append( '<li title=" ">Ashikhmin-Shirley</li>' );	$( "li:nth-child(2)", UL ).click( function() { that.AddBRDF_Analytical( 1 ); } );
	UL.append( '<li title=" ">Cook-Torrance</li>' );		$( "li:nth-child(3)", UL ).click( function() { that.AddBRDF_Analytical( 2 ); } );
	UL.append( '<li title=" ">Walter</li>' );				$( "li:nth-child(4)", UL ).click( function() { that.AddBRDF_Analytical( 3 ); } );
	UL.append( '<li title=" ">Ward</li>' );					$( "li:nth-child(5)", UL ).click( function() { that.AddBRDF_Analytical( 4 ); } );

	//////////////////////////////////////////////////////////////////////////
	// Build the toolbar button for Pom BRDFs
	this.toolbarButton_AddBRDFPom = $("#BRDFListUI_AddBRDFPom");
	this.toolbarButton_AddBRDFPom.click( function() {
		that.AddBRDF_Pom();
	} );

	//////////////////////////////////////////////////////////////////////////
	// Build the toolbar button for Hand-Painted BRDFs
	this.toolbarButton_AddBRDFPaint = $("#BRDFListUI_AddBRDFPaint");
	this.toolbarButton_AddBRDFPaint.click( function() {
		 that.AddBRDF_Painter();
	} );
	
	//////////////////////////////////////////////////////////////////////////
	// Build the toolbar button for Hand-Painted BRDFs
	this.toolbarButton_AddBRDFEigen = $("#BRDFListUI_AddBRDFEigen");
	this.toolbarButton_AddBRDFEigen.click( function() {
		 that.AddBRDF_Eigen();
	} );
	// TODO!
}

BRDFList.prototype =
{
	Destroy : function()
	{
		while ( Object.keys( this.BRDFs ).length > 0 )
		{
			var	Keys = Object.keys( this.BRDFs );
			var	Value = this.BRDFs[Keys[0]];
			this.RemoveBRDF( Value );
		}
	}

	//////////////////////////////////////////////////////////////////////////
	// Adds a new "slice BRDF" from the MERL list
	//	_BRDFIndex, index of the MERL file (must be in [0,99])
	//
	, AddBRDF_Slice : function( _BRDFIndex )
	{
		var	SliceName = this.MERLBRDFNames[_BRDFIndex];
		var	BRDF = new BRDFSlice( SliceName );
		var	ListElementName = BRDF.name + " (slice)";

		return this.AddBRDFListElement( BRDF, ListElementName );
	}

	//////////////////////////////////////////////////////////////////////////
	// Adds a new "analytical BRDF"
	//	_BRDFType must be one of the supported model types
	//	0 = Blinn-Phong
	//	1 = Ashikmin-Shirley
	//	2 = Cook-Torrance
	//	3 = Walter
	//
	, AddBRDF_Analytical : function( _BRDFType )
	{
		var	BRDF = new BRDFAnalytical( _BRDFType )
		var	ListElementName = BRDF.name + " (analytical)";

		return this.AddBRDFListElement( BRDF, ListElementName );
	}


	//////////////////////////////////////////////////////////////////////////
	// Adds a new "Pom BRDF"
	, AddBRDF_Pom : function()
	{
		var	BRDF = new BRDFPom()
		var	ListElementName = BRDF.name + " (Pom)";

		return this.AddBRDFListElement( BRDF, ListElementName );
	}

	//////////////////////////////////////////////////////////////////////////
	// Adds a new "Painter BRDF"
	, AddBRDF_Painter : function()
	{
		var	BRDF = new BRDFPainter()
		var	ListElementName = BRDF.name + " (Painter)";

		return this.AddBRDFListElement( BRDF, ListElementName );
	}

	//////////////////////////////////////////////////////////////////////////
	// Adds a new "Painter BRDF"
	, AddBRDF_Eigen : function()
	{
		var	BRDF = new BRDFEigen("eigen-0095")
		var	ListElementName = BRDF.name + " (eigen)";

		return this.AddBRDFListElement( BRDF, ListElementName );
	}

	//////////////////////////////////////////////////////////////////////////
	// Adds a BRDF instance to the list
	, AddBRDFListElement : function( _BRDF, _ListElementName )
	{
		var	Hash = _BRDF.GetHash();

		// Check if we already have it in our table
		var	ExistingBRDF = this.BRDFs[Hash];
		if ( ExistingBRDF )
		{	// Simply select existing one
			this.SelectBRDF( ExistingBRDF );
			return;
		}
	
		// It's a new BRDF!

		// We need to create the UI element
		this.list.append( '<div id="' + Hash + '" class="list-element-BRDF ui-corner-all" onclick="">' + _ListElementName + '<div class="list-element-BRDF-button ui-icon ui-icon-circle-close"></div>' );

		// Hook events
		var	that = this;
		var	UIElement = this.list.children().last();
		UIElement.click( function() {
			that.SelectBRDF( _BRDF );	// Clicking on the element selects the BRDF
		} );
		var	UIButtonRemove = UIElement.children().first();
		UIButtonRemove.click( function() {
			that.RemoveBRDF( _BRDF);		// Clicking on the "close" button removes the BRDF
		  } );

		// Link UI & BRDF
		UIElement.BRDF = _BRDF;
		_BRDF.UI = UIElement;

		// Bind all this together in our map
		this.BRDFs[Hash] = _BRDF;

		// Notify the list changed
		this.NotifyListChanged();

		// Finally, we're going to initialize the BRDF and select it once it's ready
		var	that = this;
		_BRDF.Init( function( _BRDF )
		{	// Select only once loaded...
			that.SelectBRDF( _BRDF );
		} );
	}

	// Removes an existing BRDF from the list
	, RemoveBRDF : function( _BRDF )
	{
		if ( !_BRDF )
			return;

		var	Hash = _BRDF.GetHash();
		if ( !this.BRDFs[Hash] )
			throw "Can't find BRDF in the list!";

		var	WasSelection = this.selectedBRDF == _BRDF;
		if ( WasSelection )
			this.SelectBRDF( null );	// Clear selection

		// Destroy BRDF and its list element UI
		_BRDF.Destroy();
		_BRDF.UI.remove();

		// Remove from hash
		delete this.BRDFs[Hash];

		if ( WasSelection )
		{	// Attempt to select other...
			var	OtherBRDFs = Object.keys( this.BRDFs );
			if ( OtherBRDFs.length > 0 )
			{
				var	SelectFirst = this.BRDFs[OtherBRDFs[0]];
				this.SelectBRDF( SelectFirst );
			}
		}

		// Notify the list changed
		this.NotifyListChanged();
	}

	//////////////////////////////////////////////////////////////////////////
	// Selection Management

	// Selects the new default BRDF
	, SelectBRDF : function( _BRDF )
	{
		var	Hash = _BRDF ? _BRDF.GetHash() :"";
		var	NewBRDF = this.BRDFs[Hash];
		if ( this.selectedBRDF == NewBRDF )
			return;	// No change in selection

		if ( this.selectedBRDF )
		{	// Remove previous selection
			this.selectedBRDF.UI.removeClass( 'list-element-BRDF-selected' );
			this.selectedBRDF = null;
		}

		if ( NewBRDF )
		{	// Select new one!
			this.selectedBRDF = NewBRDF;
			this.selectedBRDF.UI.addClass( "list-element-BRDF-selected" );
		}

		// Notify of the change
		this.Notify( { type: "selection", BRDF: this.selectedBRDF } );
	}

	//////////////////////////////////////////////////////////////////////////
	// Events management
	, Subscribe : function( _This, _Callback )
	{
		this.subscribers.push( { This : _This, Callback : _Callback } );
	}

	, UnSubscribe : function( _Callback )
	{
		for ( var Key in this.subscribers )
		{
			var	Value = this.subscribers[Key];
			if ( Value.This == _Callback )
			{	// Remove that subscriber
				this.subscribers.splice( Key, 1 );
				return;
			}
		}
	}

	, NotifyListChanged : function()	{ this.Notify( { type:"listChanged" } ); }
	, Notify : function( _Event )
	{
		var	TempSubscribers = patapi.helpers.Copy( this.subscribers );
		for ( var SubscriberIndex=0; SubscriberIndex < TempSubscribers.length; SubscriberIndex++ )
		{
			var	Value = TempSubscribers[SubscriberIndex];
			Value.Callback.call( Value.This, this, _Event );
		}
	}


	//////////////////////////////////////////////////////////////////////////
	// Some private fields

	// The map BRDFHash->BRDF
	, BRDFs : {}

	// BRDF selection
	// Don't modify directly => Use SelectBRDF()!
	, selectedBRDF : null


	//////////////////////////////////////////////////////////////////////////
	// The list of the 100 MERL slices
	, MERLBRDFNames : [	
"alum-bronze",
"alumina-oxide",
"aluminium",
"aventurnine",
"beige-fabric",
"black-fabric",
"black-obsidian",
"black-oxidized-steel",
"black-phenolic",
"black-soft-plastic",
"blue-acrylic",
"blue-fabric",
"blue-metallic-paint",
"blue-metallic-paint2",
"blue-rubber",
"brass",
"cherry-235",
"chrome-steel",
"chrome",
"colonial-maple-223",
"color-changing-paint1",
"color-changing-paint2",
"color-changing-paint3",
"dark-blue-paint",
"dark-red-paint",
"dark-specular-fabric",
"delrin",
"fruitwood-241",
"gold-metallic-paint",
"gold-metallic-paint2",
"gold-metallic-paint3",
"gold-paint",
"gray-plastic",
"grease-covered-steel",
"green-acrylic",
"green-fabric",
"green-latex",
"green-metallic-paint",
"green-metallic-paint2",
"green-plastic",
"hematite",
"ipswich-pine-221",
"light-brown-fabric",
"light-red-paint",
"maroon-plastic",
"natural-209",
"neoprene-rubber",
"nickel",
"nylon",
"orange-paint",
"pearl-paint",
"pickled-oak-260",
"pink-fabric",
"pink-fabric2",
"pink-felt",
"pink-jasper",
"pink-plastic",
"polyethylene",
"polyurethane-foam",
"pure-rubber",
"purple-paint",
"pvc",
"red-fabric",
"red-fabric2",
"red-metallic-paint",
"red-phenolic",
"red-plastic",
"red-specular-plastic",
"silicon-nitrade",
"silver-metallic-paint",
"silver-metallic-paint2",
"silver-paint",
"special-walnut-224",
"specular-black-phenolic",
"specular-blue-phenolic",
"specular-green-phenolic",
"specular-maroon-phenolic",
"specular-orange-phenolic",
"specular-red-phenolic",
"specular-violet-phenolic",
"specular-white-phenolic",
"specular-yellow-phenolic",
"ss440",
"steel",
"teflon",
"tungsten-carbide",
"two-layer-gold",
"two-layer-silver",
"violet-acrylic",
"violet-rubber",
"white-acrylic",
"white-diffuse-bball",
"white-fabric",
"white-fabric2",
"white-marble",
"white-paint",
"yellow-matte-plastic",
"yellow-paint",
"yellow-phenolic",
"yellow-plastic",
	]
};
