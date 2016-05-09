define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		common = require('entrance/regionoperation');


	var setFillColor = function(sheetId, color, region) {

		var sendRegion = common.regionOperation(sheetId, region, function(cell) {
			cell.set('customProp.background', color);
		});
		
		send.PackAjax({
			url: 'text.htm?m=fill_bgcolor',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: sendRegion.startColIndex,
					startY: sendRegion.startRowIndex,
					endX: sendRegion.endColIndex,
					endY: sendRegion.endRowIndex
				},
				bgcolor: color
			})
		});

	};
	return setFillColor;
});