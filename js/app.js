define(function(require) {
	'use strict';
	var $ = require("lib/jquery"),
		Backbone = require('lib/backbone');
	var SpreadSheet = require('spreadsheet/spreadsheet');
	var a=new SpreadSheet();

	$("#test").click(function(){
		a.reloadCells();
	});
});