'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		cells = require('collections/cells'),
		selectRegions = require('collections/selectRegion'),
		getOperRegion = require('basic/tools/getoperregion'),
		rowOperate = require('entrance/row/rowoperation'),
		colOperate = require('entrance/col/coloperation');

	/**
	 * 设置单元格填充颜色
	 * @param {string} sheetId sheetId
	 * @param {string} color   颜色值
	 * @param {string} label   行标，列标
	 */
	var setFillColor = function(sheetId, color, label) {
		var clip,
			region,
			operRegion,
			sendRegion;

		clip = selectRegions.getModelByType('clip')[0];
		if (clip !== undefined) {
			cache.clipState = 'null';
			clip.destroy();
		}
		region = getOperRegion(label);
		operRegion = region.operRegion;
		sendRegion = region.sendRegion;
		
		if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
			sendData();
			return;
		}

		if (operRegion.endColIndex === 'MAX') { //整行操作
			rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.background', color);
		} else if (operRegion.endRowIndex === 'MAX') {
			colOperate.colPropOper(operRegion.startColIndex, 'customProp.background', color);
		} else {
			cells.operateCellsByRegion(operRegion, function(cell) {
				cell.set('customProp.background', color);
			});
		}
		sendData();

		function sendData() {
			send.PackAjax({
				url: 'text.htm?m=fill_bgcolor',
				data: JSON.stringify({
					coordinate: sendRegion,
					bgcolor: color
				})
			});
		}
	};
	return setFillColor;
});