'use strict';
define(function(require) {
	var SpreadSheet = require('spreadsheet/spreadsheet'),
		spreadsheet,
		$ = require('lib/jquery');

	spreadsheet = new SpreadSheet();
	$('#reload').click(function(e) {
		spreadsheet.reloadCells();
	});
});