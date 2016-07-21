'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cache = require('basic/tools/cache'),
		cells = require('collections/cells'),
		analysisLabel = require('basic/tools/analysislabel'),
		regionDel;

	/**
	 * 区域删除单元格
	 * @param {string} sheetId sheetId
	 * @param {string} label   行标，列标
	 */
	regionDel = function(sheetId, label) {
		var select,
			clip,
			region = {},
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias;
		if (label !== undefined) {
			region = analysisLabel(label);
		} else {
			select = selectRegions.getModelByType('operation')[0];
			region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
			region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
			region.endColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').endX);
			region.endRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').endY);
		}
		clip = selectRegions.getModelByType('clip')[0];
		if (clip !== undefined) {
			cache.clipState = 'null';
			clip.destroy();
		}

		if (region.endColIndex === 'MAX') { //整行操作
			endColAlias = 'MAX';
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
			region.endColIndex = headItemCols.length - 1;
		}else if (region.endRowIndex === 'MAX') { //整列操作
			endRowAlias = 'MAX';
			endColAlias = headItemCols.models[region.endColIndex].get('alias');
			region.endRowIndex = headItemRows.length - 1;
		} else {
			region = cells.getFullOperationRegion(region);
		}
		cells.operateCellsByRegion(region, function(cell) {
			cell.set('content.texts', '');
			cell.set('content.displayTexts', '');
		});
		if(endColAlias!=='MAX'){
			endColAlias = headItemCols.models[region.endColIndex].get('alias');
		}
		endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias = headItemRows.models[region.startRowIndex].get('alias');


		send.PackAjax({
			url: 'text.htm?m=data_del',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startColAlias: startColAlias,
					startRowAlias: startRowAlias,
					endColAlias: endColAlias,
					endRowAlias: endRowAlias
				}
			})
		});

	};
	return regionDel;
});