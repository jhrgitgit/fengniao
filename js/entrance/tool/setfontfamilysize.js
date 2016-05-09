define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemRows = require('collections/headItemRow'),
		common = require('entrance/regionoperation'),
		setCellHeight = require('entrance/cell/setcellheight'),
		sendRegion;

	var setFontFamilySize = function(sheetId, fontSize, region) {
		var headItemModel,
			headItemHeight,
			fontHeight,
			containerHeight,
			i;
		sendRegion = common.regionOperation(sheetId, region, function(cell) {
			cell.set('content.size', fontSize + 'pt');
		});
		for (i = sendRegion.startRowIndex; i < sendRegion.endRowIndex + 1; i++) {
			headItemModel = headItemRows.models[i];
			//ps：确定是否进行轮询
			headItemHeight = headItemModel.get('height');
			fontHeight = Math.round(fontSize / 3 * 4);
			containerHeight = fontHeight + 4;
			if (containerHeight > headItemHeight) {
				setCellHeight('sheetId',headItemModel.get('displayName'),containerHeight);
			}
		}
		send.PackAjax({
			url: 'text.htm?m=font_size',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: sendRegion.startColIndex,
					startY: sendRegion.startRowIndex,
					endX: sendRegion.endColIndex,
					endY: sendRegion.endRowIndex
				},
				size: fontSize
			})
		});
	};
	return setFontFamilySize;
});