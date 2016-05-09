define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		common = require('entrance/regionoperation'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells');

	var setFontWeight = function(sheetId, bold, region) {

		var sendRegion,
			startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex,
			tempCellList;

		if (bold === 'bold') {
			bold = true;
		} else if (bold === 'normal') {
			bold = false;
		} else {
			startColIndex = selectRegions.models[0].get('wholePosi').startX;
			startRowIndex = selectRegions.models[0].get('wholePosi').startY;
			endColIndex = selectRegions.models[0].get('wholePosi').endX;
			endRowIndex = selectRegions.models[0].get('wholePosi').endY;

			tempCellList = cells.getCellByX(startColIndex, startRowIndex, endColIndex, endRowIndex);
			if (tempCellList === null || tempCellList === undefined || tempCellList.length === 0) {
				bold = true;
			} else {
				bold = !tempCellList[0].get('content').bd;
			}
		}

		sendRegion = common.regionOperation(sheetId, region, function(cell) {
			cell.set('content.bd', bold);
		});

		send.PackAjax({
			url: 'text.htm?m=font_weight',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: sendRegion.startColIndex,
					startY: sendRegion.startRowIndex,
					endX: sendRegion.endColIndex,
					endY: sendRegion.endRowIndex
				},
				isBold: bold
			})
		});
	};
	return setFontWeight;
});