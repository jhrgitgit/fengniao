'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		cache = require('basic/tools/cache'),
		analysisLabel = require('basic/tools/analysislabel'),
		rowOperate = require('entrance/row/rowoperation');

	var setWordWrap = function(sheetId, wordWrap, label) {

		var region = {},
			select,
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias,
			tempCellList,
			clip;


		clip = selectRegions.getModelByType('clip')[0];
		if (clip !== undefined) {
			cache.clipState = 'null';
			clip.destroy();
		}
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

		if (region.endColIndex === 'MAX') { //整行操作
			endColAlias = 'MAX';
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		} else {
			region = cells.getFullOperationRegion(region);
			endColAlias = headItemCols.models[region.endColIndex].get('alias');
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		}

		if (wordWrap === undefined) {
			if (endColAlias === 'MAX') {
				wordWrap = true;
			} else {
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
		}

		if (endColAlias === 'MAX') {
			rowOperate.rowPropOper(region.startRowIndex, 'wordWrap', wordWrap);
		} else {
			cells.operateCellsByRegion(region, function(cell) {
				cell.set('wordWrap', wordWrap);
			});
		}
		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias = headItemRows.models[region.startRowIndex].get('alias');

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