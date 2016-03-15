define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		common = require('entrance/regionoperation'),
		sendRegion;


	var setTextType = function(sheetId, format, region) {
		var tempValue;
		if (format === 'number') {
			tempValue = 'num';
		} else if (format === 'time') {
			tempValue = 'time';
		} else {
			tempValue = 'text';
		}
		sendRegion = common.regionOperation(sheetId, region, function(cell) {
			cell.set('customProp.format', tempValue);
		});
		send.PackAjax({
			url: 'text.htm?m=date_format',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: sendRegion.startColIndex,
					startY: sendRegion.startRowIndex,
					endX: sendRegion.endColIndex,
					endY: sendRegion.endRowIndex
				},
				format: tempValue
			})
		});

	};
	return setTextType;
});