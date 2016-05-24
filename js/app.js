'use strict';
define(function(require) {
	var SpreadSheet = require('spreadsheet/spreadsheet'),
		spreadsheet,
		headItemRows = require('collections/headItemRow'),
		$ = require('lib/jquery');

	spreadsheet = new SpreadSheet();
	$('#insert').click(function(e) {
		for (var i = 0; i < headItemRows.length; i++) {
			var top = headItemRows.models[i].get('top');
			headItemRows.models[i].set('top',top + 40);
		}
		//插入
		headItemRows.push({
			top: 0
		}, 0);
		headItemRows.push({
			top: 20
		}, 1);
	});
});