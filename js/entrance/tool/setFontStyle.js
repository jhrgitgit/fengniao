define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		common = require('entrance/regionoperation'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells');


	var setFontStyle = function(sheetId, italic, region) {
		var startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex,
			tempCellList,
			sendRegion;

		if (italic === 'italic') {
			italic = true;
		} else if (italic === 'normal') {
			italic = false;
		} else {
			startColIndex = selectRegions.models[0].get('wholePosi').startX;
			startRowIndex = selectRegions.models[0].get('wholePosi').startY;
			endColIndex = selectRegions.models[0].get('wholePosi').endX;
			endRowIndex = selectRegions.models[0].get('wholePosi').endY;

			tempCellList = cells.getCellByX(startColIndex, startRowIndex, endColIndex, endRowIndex);
			if (tempCellList === null || tempCellList === undefined || tempCellList.length === 0) {
				italic = true;
			} else {
				italic = !tempCellList[0].get('content').italic;
			}
		}
		sendRegion = common.regionOperation(sheetId, region, function(cell) {
			cell.set('content.italic', italic);
		});

		send.PackAjax({
			url: 'text.htm?m=font_italic',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: sendRegion.startColIndex,
					startY: sendRegion.startRowIndex,
					endX: sendRegion.endColIndex,
					endY: sendRegion.endRowIndex
				},
				italic: italic
			})
		});
	};
	return setFontStyle;
});