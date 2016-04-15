define(function(require) {
	'use strict';
	var SpreadSheet,
		$ = require('lib/jquery');

	SpreadSheet = require('spreadsheet/spreadsheet');
	var s=new SpreadSheet();
	$("#test1").click(function(){
		s.startHighlight();
	})
	$("#test2").click(function(){
		s.stopHighlight();
	})
});