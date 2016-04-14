define(function(require) {
	'use strict';
<<<<<<< HEAD
	var $ = require("lib/jquery"),
		Backbone = require('lib/backbone');
	var SpreadSheet = require('spreadsheet/spreadsheet');
	var a=new SpreadSheet();

	$("#test").click(function(){
		a.reloadCells();
	});
=======
	var SpreadSheet = require('spreadsheet/spreadsheet');
	new SpreadSheet();
>>>>>>> ca99d0fecd7541be9ba76f7bdefc880c22b68f9c
});