'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		analysisLabel = require('basic/tools/analysislabel'),
		rowOperate = require('entrance/row/rowoperation');


	var setFontStyle = function(sheetId, italic, label) {
		var select,
			region = {},
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias,
			tempCellList;

		if (italic === 'italic') {
			italic = true;
		} else if (italic === 'normal') {
			italic = false;
		} else {
			tempCellList = cells.getCellByX(region.startColIndex,
				region.startRowIndex,
				region.endColIndex,
				region.endRowIndex);
			if (tempCellList === null || tempCellList === undefined || tempCellList.length === 0) {
				italic = true;
			} else {
				italic = !tempCellList[0].get('content').italic;
			}
		}

		if (label !== undefined) {
			region = analysisLabel(label);
		} else {
			select = selectRegions.getModelByType('operation')[0];
			region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
			region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
			region.endColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').endX);
			region.endRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').endY);
		}
		if (region.endColIndex === 'MAX') { //整行操作
			rowOperate.rowPropOper(region.startRowIndex, 'content.italic', italic);
			endColAlias = 'MAX';
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		} else {
			region = cells.getFullOperationRegion(region);
			cells.operateCellsByRegion(region, function(cell) {
				cell.set('content.italic', italic);
			});
			endColAlias = headItemCols.models[region.endColIndex].get('alias');
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		}

		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias = headItemRows.models[region.startRowIndex].get('alias');

		send.PackAjax({
			url: 'text.htm?m=font_italic',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: region.startColIndex,
					startY: region.startRowIndex,
					endX: region.endColIndex,
					endY: region.endRowIndex
				},
				italic: italic
			})
		});
	};
	return setFontStyle;
});