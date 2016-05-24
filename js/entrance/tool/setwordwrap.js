define(function(require) {
	'use strict';

	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		analysisLabel = require('basic/tools/analysislabel');

	var setWordWrap = function(sheetId, wordWrap, label) {

		var region = {},
			select,
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias,
			tempCellList;

		if (label !== undefined) {
			region = analysisLabel(label);
			region = cells.getFullOperationRegion(region);
		} else {
			select = selectRegions.getModelByType('operation')[0];
			region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
			region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
			region.endColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').endX);
			region.endRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').endY);
		}

		if (wordWrap === undefined) {
			tempCellList = cells.getCellByX(region.startColIndex,
				region.startRowIndex,
				region.endColIndex,
				region.endRowIndex);
			if (tempCellList === null || tempCellList === undefined || tempCellList.length === 0) {
				wordWrap = true;
			} else {
				wordWrap = !tempCellList[0].get('wordWrap');
			}
		}
		cells.operateCellsByRegion(region, function(cell) {
			cell.set('wordWrap', wordWrap);
		});

		startColAlias = headItemCols.models[region.startColIndex].get("alias");
		startRowAlias = headItemRows.models[region.startRowIndex].get("alias");
		endColAlias = headItemCols.models[region.endColIndex].get("alias");
		endRowAlias = headItemRows.models[region.endRowIndex].get("alias");

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