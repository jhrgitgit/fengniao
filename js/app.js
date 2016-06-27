'use strict';
define(function(require) {
	
	
	var SpreadSheet = require('spreadsheet/spreadsheet');
	new SpreadSheet();

	var $ = require('lib/jquery');
	var Backbone = require('lib/backbone');
	
	$('#test1').click(function(){
		Backbone.trigger('event:commentContainer:show');
	});
	$('#test2').click(function(){
		Backbone.trigger('event:commentContainer:hide');
	});

});