'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		analysisLabel = require('basic/tools/analysislabel');

	var setFontWeight = function(sheetId, bold, label) {
		var select,
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias,
			region = {},
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

		if (bold === 'bold') {
			bold = true;
		} else if (bold === 'normal') {
			bold = false;
		} else {
			tempCellList = cells.getCellByX(region.startColIndex,
				region.startRowIndex,
				region.endColIndex,
				region.endRowIndex);

			if (tempCellList === null || tempCellList === undefined || tempCellList.length === 0) {
				bold = true;
			} else {
				bold = !tempCellList[0].get('content').bd;
			}
		}
		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias= headItemRows.models[region.startRowIndex].get('alias');
		endColAlias= headItemCols.models[region.endColIndex].get('alias');
		endRowAlias= headItemRows.models[region.endRowIndex].get('alias');
		
		cells.operateCellsByRegion(region, function(cell) {
			cell.set('content.bd', bold);
		});
		send.PackAjax({
			url: 'text.htm?m=font_weight',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: startColAlias,
					startY: startRowAlias,
					endX: endColAlias,
					endY: endRowAlias
				},
				isBold: bold
			})
		});
	};
	return setFontWeight;
});