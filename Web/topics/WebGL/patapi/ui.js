//////////////////////////////////////////////////////////////////////////
// This file contains helpers for jQuery UI widgets
//////////////////////////////////////////////////////////////////////////
//
o3djs.require( 'patapi' );
o3djs.provide( 'patapi.ui' );

// Add the ui extension
patapi.ui = patapi.ui || {};


//////////////////////////////////////////////////////////////////////////
// Create and hook a label/slider couple
//
patapi.ui.LabelSlider = function( _Parameters )
{
	var	DefaultParameters =
	{
		selector : null,				// The jQuery selector identifying the slider
		labelSelector :	null,			// The optional jQuery selector identifying the slider's label
		sliderParams :					// min/max/step/default values of the slider as in the jQuery slider definition
		{
			min :	0.0,
			max :	1.0,
			step :	0.01,
			value : 0.0,
		},
		change : null,		// The callback for when the value changes. Prototype is simply function( value, _OriginalText ) and returns the new text for the label or nothing if not to be changed
	};
	_Parameters = patapi.helpers.Extend( _Parameters, DefaultParameters );
	_Parameters.sliderParams = patapi.helpers.Extend( _Parameters.sliderParams, DefaultParameters.sliderParams );

	if ( _Parameters.labelSelector )
	{
		this.label = $( _Parameters.labelSelector );
		this.defaultText = this.label.text();	// Store default text
	}

	var	that = this;
	function	OnChange( event, ui )
	{
		// Notify of value change
		var	NewText = _Parameters.change( ui.value, that.defaultText );
		if ( _Parameters.labelSelector && NewText )
			that.label.text( NewText );	// Update the label's text as well...
	}

	this.slider = $( _Parameters.selector ).slider( {
			range: false,
			min: _Parameters.sliderParams.min,
			max : _Parameters.sliderParams.max,
			step: _Parameters.sliderParams.step,
			value: _Parameters.sliderParams.value-1.0,
			change: OnChange,
			slide : OnChange,
		} );
	this.slider.slider( "value", _Parameters.sliderParams.value );	// We set the default value afterward so we're notified at least once of a change, giving us a chance to update label
}

patapi.ui.LabelSlider.prototype =
{
	set : function( value )
	{
		this.slider.slider( "value", value );
	}
}


//////////////////////////////////////////////////////////////////////////
// Create and hook a label/checkbox couple
// The checkbox is a simple div we render clickable
//
patapi.ui.LabelCheckBox = function( _Parameters )
{
	var	that = this;

	var	DefaultParameters =
	{
		selector : null,						// The jQuery selector identifying the checkbox
		labelSelector :	null,					// The optional jQuery selector identifying the checkbox's label
		value : false,							// Default value
		button : false,							// True to show as a button
		classSelected : "ui-icon-bullet",		// The button classes to assign when (un)selected
		classUnSelected : "ui-icon-radio-off",
		change : null,							// The callback for when the value changes. Prototype is simply function( value, _OriginalText ) and returns the new text for the label or nothing if not to be changed
	};
	this.parameters = patapi.helpers.Extend( _Parameters, DefaultParameters );

	if ( this.parameters.labelSelector )
	{
		this.label = $( this.parameters.labelSelector );
		this.defaultText = this.label.text();	// Store default text
	}

	this.checkBox = $( this.parameters.selector );

	if ( this.parameters.button )
	{
		if ( !this.parameters.labelSelector )		
			throw "You must provide a label selector to make a valid button!";

		this.label.button().click( function() {
			that.set( !that.parameters.value );
		} );
		
		this.checkBox.css( 'display', 'none' );
		return;
	}

	this.checkBox.css( "cursor", "pointer" );
	this.checkBox.click( function()
	{
		that.set( !that.parameters.value );
	} );

	// Force default value
	this.parameters.value = !this.parameters.value;
	this.set( !this.parameters.value );
}

patapi.ui.LabelCheckBox.prototype =
{
	set : function( value )
	{
		if ( value == this.parameters.value )
			return;	// No change...

		this.parameters.value = value;
		this.checkBox.removeClass( this.parameters.value ? this.parameters.classUnSelected : this.parameters.classSelected );
		this.checkBox.addClass( !this.parameters.value ? this.parameters.classUnSelected : this.parameters.classSelected );

		// Notify of value change
		var	NewText = this.parameters.change( this.parameters.value, this.defaultText );
		if ( this.parameters.labelSelector && NewText )
			this.label.text( NewText );	// Update the label's text as well...
	}
}


//////////////////////////////////////////////////////////////////////////
// Create and hook a label/combobox couple
// jQuery combo extension from http://jqueryui.com/resources/demos/autocomplete/combobox.html
//
function initComboBox( $ )
{
	$.widget( "ui.combobox", {
		_create: function()
		{
			var input,
				that = this,
				wasOpen = false,
				select = this.element.hide(),
				selected = select.children( ":selected" ),
				value = selected.val() ? selected.text() : "",
				wrapper = this.wrapper = $( "<span>" )
					.addClass( "ui-combobox" )
					.insertAfter( select );

			function removeIfInvalid( element ) {
				var value = $( element ).val(),
					matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( value ) + "$", "i" ),
					valid = false;
				select.children( "option" ).each(function() {
					if ( $( this ).text().match( matcher ) ) {
						this.selected = valid = true;
						return false;
					}
				});

				if ( !valid ) {
					// remove invalid value, as it didn't match anything
					$( element )
						.val( "" )
						.attr( "title", value + " didn't match any item" )
						.tooltip( "open" );
					select.val( "" );
					setTimeout(function() {
						input.tooltip( "close" ).attr( "title", "" );
					}, 2500 );
					input.data( "ui-autocomplete" ).term = "";
				}
			}

			input = $( "<input>" )
				.appendTo( wrapper )
				.val( value )
				.attr( "title", "" )
				.addClass( "ui-state-default ui-combobox-input" )
				.autocomplete({
					delay: 0,
					minLength: 0,
					source: function( request, response ) {
						var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
						response( select.children( "option" ).map(function() {
							var text = $( this ).text();
							if ( this.value && ( !request.term || matcher.test(text) ) )
								return {
									label: text.replace(
										new RegExp(
											"(?![^&;]+;)(?!<[^<>]*)(" +
											$.ui.autocomplete.escapeRegex(request.term) +
											")(?![^<>]*>)(?![^&;]+;)", "gi"
										), "<strong>$1</strong>" ),
									value: text,
									option: this
								};
						}) );
					},
					select: function( event, ui ) {
						ui.item.option.selected = true;
						that._trigger( "selected", event, {
							item: ui.item.option
						});

						// POM
						$(ui.item.option).trigger('click');
					},
					change: function( event, ui ) {
						if ( !ui.item ) {
							removeIfInvalid( this );
						}
					}
				})
				.addClass( "ui-widget ui-widget-content ui-corner-left" );

			input.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
				return $( "<li>" )
					.append( "<a>" + item.label + "</a>" )
					.appendTo( ul );
			};

			$( "<a>" )
				.attr( "tabIndex", -1 )
				.attr( "title", "Show All Items" )
				.tooltip()
				.appendTo( wrapper )
				.button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass( "ui-corner-all" )
				.addClass( "ui-corner-right ui-combobox-toggle" )
				.mousedown(function() {
					wasOpen = input.autocomplete( "widget" ).is( ":visible" );
				})
				.click(function() {
					input.focus();

					// close if already visible
					if ( wasOpen ) {
						return;
					}

					// pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
				});

			input.tooltip({
				tooltipClass: "ui-state-highlight"
			});
		},

		_destroy: function() {
			this.wrapper.remove();
			this.element.show();
		}
	});
}


// The combobox is a simple select we wrap with jquery ui
//
patapi.ui.LabelComboBox = function( _Parameters )
{
	var	that = this;

	if ( !initComboBox.called )
	{	// Lazy init
		initComboBox( $ );
		initComboBox.called = true;
	}

	var	DefaultParameters =
	{
		selector : null,						// The jQuery selector identifying the checkbox
		labelSelector : null,
		value : null,							// Default value
		change : null,							// The callback for when the value changes. Prototype is simply function( value, _OriginalText ) and returns the new text for the label or nothing if not to be changed
	};
	this.parameters = patapi.helpers.Extend( _Parameters, DefaultParameters );

	if ( this.parameters.labelSelector )
	{
		this.label = $( this.parameters.labelSelector );
		this.defaultText = this.label.text();	// Store default text
	}

	// Hook the combo box item
	this.comboBox = $( this.parameters.selector );
	this.comboBox.combobox();

	// Force default value
// 	var	Temp = this.parameters.value;
// 	this.parameters.value--;
// 	this.set( Temp );
}

patapi.ui.LabelComboBox.prototype =
{
	// Sets the selection providing an <option> ui element (wrapped by jquery)
	set : function( value )
	{
		if ( value == this.parameters.value )
			return;	// No change...

		this.parameters.value = value;
// 		this.checkBox.removeClass( this.parameters.value ? this.parameters.classUnSelected : this.parameters.classSelected );
// 		this.checkBox.addClass( !this.parameters.value ? this.parameters.classUnSelected : this.parameters.classSelected );

		if ( value )
			value.select();

		// Notify of value change
// 		var	NewText = this.parameters.change( this.parameters.value, this.defaultText );
// 		if ( this.parameters.labelSelector && NewText )
// 			this.label.text( NewText );	// Update the label's text as well...
	}
}



//////////////////////////////////////////////////////////////////////////
// Create and hook a label/checkbox couple
// The checkbox is a simple div we render clickable
//
patapi.ui.LabelRadioButtons = function( _Parameters )
{
	var	DefaultParameters =
	{
		selector : null,						// The jQuery selector identifying the checkbox
		labelSelector :	null,					// The optional jQuery selector identifying the checkbox's label
		value : 0,								// Default value
		change : null,							// The callback for when the value changes. Prototype is simply function( value, _OriginalText ) and returns the new text for the label or undefined if not to be changed
	};
	this.parameters = patapi.helpers.Extend( _Parameters, DefaultParameters );

	if ( this.parameters.labelSelector )
	{
		this.label = $( this.parameters.labelSelector );
		this.defaultText = this.label.text();	// Store default text
	}

	var	that = this;
	this.radio = $( this.parameters.selector );
	this.radio.buttonset().click( function( e )
	{
		if ( !e || !e.target || e.target.nodeName != "INPUT" )
			return;	// Don't care...

		var	value = undefined;
		if ( e.target.value )
		{	// Attempt to retrieve the button's value
			value = parseInt( e.target.value, 10 );
		}
		if ( value === undefined || isNaN( value ) )
			throw "The radio buttons in a radio set must have a property \"value\" with a numeric value!"

		that.set( value );
	} );

	// Cache buttons and their values
	this.value2Button = {};
	var	Buttons = $( ":input", this.radio );
	for ( var i=0; i < Buttons.length; i++ )
		if ( Buttons[i].value )
		{
			var	value = parseInt( Buttons[i].value )
			if ( value === undefined || isNaN( value ) )
				continue;

			this.value2Button[value] = $(Buttons[i]);	// Associate the button to the value
		}

	// Force default value
	var	Temp = this.parameters.value;
 	this.parameters.value = -1;
 	this.set( Temp );
}

patapi.ui.LabelRadioButtons.prototype =
{
	set : function( value )
	{
		if ( value == this.parameters.value )
			return;	// No change...

		this.parameters.value = value;

		if ( this.value2Button[value] )
			this.value2Button[value].trigger( 'click' );

		// Notify of value change
		var	NewText = this.parameters.change( this.parameters.value, this.defaultText );
		if ( this.parameters.labelSelector && NewText )
			this.label.text( NewText );	// Update the label's text as well...
	}
}
