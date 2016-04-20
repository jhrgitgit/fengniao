define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		common = require('entrance/regionoperation'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells');

	var setWordWrap = function(sheetId, wordWrap, region) {

		var sendRegion,
			startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex,
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias,
			tempCellList;

		if (wordWrap === undefined) {
			startColIndex = selectRegions.models[0].get('wholePosi').startX;
			startRowIndex = selectRegions.models[0].get('wholePosi').startY;
			endColIndex = selectRegions.models[0].get('wholePosi').endX;
			endRowIndex = selectRegions.models[0].get('wholePosi').endY;

			tempCellList = cells.getCellByX(startColIndex, startRowIndex, endColIndex, endRowIndex);
			if (tempCellList === null || tempCellList === undefined || tempCellList.length === 0) {
				wordWrap = true;
			} else {
				wordWrap = !tempCellList[0].get('content').wordWrap;
			}
		}
		sendRegion = common.regionOperation(sheetId, region, function(cell) {
			cell.set('content.wordWrap', wordWrap);
		});
		startColAlias=headItemCols.models[startColIndex].get("alias");
		startRowAlias=headItemRows.models[startRowIndex].get("alias");
		endColAlias=headItemCols.models[endColIndex].get("alias");
		endRowAlias=headItemRows.models[endRowIndex].get("alias");

	    send.PackAjax({
			url: 'text.htm?m=wordWrap',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: startColAlias,
					startY: startRowAlias,
					endX: endColAlias,
					endY: endRowAlias
				},
				wordWrap: wordWrap
			})
		});

	};
	return setWordWrap;
});