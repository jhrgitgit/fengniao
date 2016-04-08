define(function(require) {
	'use strict';
	var $ = require("lib/jquery");
	var SpreadSheet = require('spreadsheet/spreadsheet');
	new SpreadSheet();
	$(document).on('click','#test1',function(){
		Backbone.trigger('event:cellsContainer:startHighlight');
	});
	$(document).on('click','#test2',function(){
		Backbone.trigger('event:cellsContainer:stopHighlight');
	});


});
