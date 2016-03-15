define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		common = require('entrance/regionoperation'),
		sendRegion;

	var setCellContent = function(sheetId, text, region) {
		sendRegion = common.regionOperation(sheetId, region, function(cell) {
			cell.set('content.texts', text);
		});
		
		send.PackAjax({
			url: 'text.htm?m=data',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: sendRegion.startColIndex,
					startY: sendRegion.startRowIndex,
				},
				content: text
			})
		});
	};
	return setCellContent;
});