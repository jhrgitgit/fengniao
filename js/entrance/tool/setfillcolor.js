'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		// selectRegions = require('collections/selectRegion'),
		// headItemCols = require('collections/headItemCol'),
		// headItemRows = require('collections/headItemRow'),
		cache = require('basic/tools/cache'),
		cells = require('collections/cells'),
		getOperRegion= require('basic/tool/getoperregion'),
		rowOperate = require('entrance/row/rowoperation'),
		colOperate = require('entrance/col/coloperation');

	/**
	 * 设置单元格填充颜色
	 * @param {string} sheetId sheetId
	 * @param {string} color   颜色值
	 * @param {string} label   行标，列标
	 */
	var setFillColor = function(sheetId, color, label) {
		var select,
			clip,
			region = {},
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias;

		clip = selectRegions.getModelByType('clip')[0];
		if (clip !== undefined) {
			cache.clipState = 'null';
			clip.destroy();
		}

		if (region.startColIndex === -1 ||
			region.startRowIndex === -1 ||
			region.endColIndex === -1 ||
			region.endRowIndex === -1) {
			send.PackAjax({
				url: 'text.htm?m=color_set',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					coordinate: {
						startX: region.startColDisplayName,
						startY: region.startRowDisplayName,
					},
					bgcolor: color
				})
			});
			return;
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
			region = cells.getFullOperationRegion(region);
			cells.operateCellsByRegion(region, function(cell) {
				cell.set('customProp.background', color);
			});
			endColAlias = headItemCols.models[region.endColIndex].get('alias');
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		}

		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias = headItemRows.models[region.startRowIndex].get('alias');


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

	};
	return setFillColor;
});