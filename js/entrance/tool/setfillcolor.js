'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cache = require('basic/tools/cache'),
		cells = require('collections/cells'),
		analysisLabel = require('basic/tools/analysislabel'),
		rowOperate = require('entrance/row/rowoperation'),
		colOperate = require('entrance/col/coloperation');

	/**
	 * 设置单元格填充颜色
	 * @param {string} sheetId sheetId
	 * @param {string} color   颜色值
	 * @param {string} label   行标，列标
	 */
	var setFillColor = function(sheetId, color, label) {
		var flag = false,
			select,
			clip,
			region = {},
			// loadStartColSort,
			// loadStartRowSort,
			loadEndColSort,
			loadEndRowSort,
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
			rowOperate.rowPropOper(region.startRowIndex, 'customProp.background', color);
			endColAlias = 'MAX';
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		} else if (region.endRowIndex === 'MAX') {
			colOperate.colPropOper(region.startColIndex, 'customProp.background', color);
			endRowAlias = 'MAX';
			endColAlias = headItemCols.models[region.endColIndex].get('alias');
		} else {
			// loadStartColSort = headItemCols.models[0].get('sort');
			// loadStartRowSort = headItemRows.models[0].get('sort');
			loadEndColSort = headItemCols.models[headItemCols.length - 1].get('sort');
			loadEndRowSort = headItemRows.models[headItemRows.length - 1].get('sort');
			if (region.startColIndex === -1) {
				flag = true;
				if (region.startColSort > loadEndColSort) {
					unloadSend();
					return;
				}
				region.startRowIndex = 0;
			}
			if (region.startRowIndex === -1) {
				if (region.startRowSort > loadEndRowSort) {
					unloadSend();
					return;
				}
				flag = true;
				region.startColIndex = 0;
			}
			if (region.endColIndex === -1) {
				flag = true;
				region.endColIndex = headItemCols.length - 1;
			}
			if (region.endRowIndex === -1) {
				flag = true;
				region.endRowIndex = headItemRows.length - 1;
			}

			region = cells.getFullOperationRegion(region);
			cells.operateCellsByRegion(region, function(cell) {
				cell.set('customProp.background', color);
			});
			endColAlias = headItemCols.models[region.endColIndex].get('alias');
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		}

		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias = headItemRows.models[region.startRowIndex].get('alias');

		if(!flag){
			loadSend();
		}else{
			unloadSend();
		}

		function unloadSend() {
			send.PackAjax({
				url: 'text.htm?m=color_set',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					coordinate: {
						startX: region.startColDisplayName,
						startY: region.startRowDisplayName,
						endX: region.endColDisplayName,
						endY: region.endRowDisplayName,
					},
					bgcolor: color
				})
			});
		}

		function loadSend() {
			send.PackAjax({
				url: 'text.htm?m=fill_bgcolor',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					coordinate: {
						startX: startColAlias,
						startY: startRowAlias,
						endX: endColAlias,
						endY: endRowAlias
					},
					bgcolor: color
				})
			});
		}
	};
	return setFillColor;
});