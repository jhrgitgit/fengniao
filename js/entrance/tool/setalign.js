'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		cache = require('basic/tools/cache'),
		getOperRegion = require('basic/tools/getoperregion'),
		rowOperate = require('entrance/row/rowoperation'),
		colOperate = require('entrance/col/coloperation');


	var setAlign = function(sheetId, alignType, label) {
		var url,
			type,
			transverse,
			vertical,
			clip,
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


		switch (alignType) {
			case 'left':
				url = 'cells.htm?m=align_level';
				transverse = 'left';
				break;
			case 'center':
				url = 'cells.htm?m=align_level';
				transverse = 'center';
				break;
			case 'right':
				url = 'cells.htm?m=align_level';
				transverse = 'right';
				break;
			case 'top':
				url = 'cells.htm?m=align_vertical';
				vertical = 'top';
				break;
			case 'middle':
				url = 'cells.htm?m=align_vertical';
				vertical = 'middle';
				break;
			case 'bottom':
				url = 'cells.htm?m=align_vertical';
				vertical = 'bottom';
				break;
			default:
				return;
		}
		if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
			sendData();
			return;
		}

		if (operRegion.endColIndex === 'MAX') { //整行操作
			if (transverse !== undefined) {
				rowOperate.rowPropOper(operRegion.startRowIndex, 'content.alignRow', transverse);
			} else {
				rowOperate.rowPropOper(operRegion.startRowIndex, 'content.alignCol', vertical);
			}
		} else if (operRegion.endRowIndex === 'MAX') { //整行操作
			if (transverse !== undefined) {
				colOperate.colPropOper(operRegion.startColIndex, 'content.alignRow', transverse);
			} else {
				colOperate.colPropOper(operRegion.startColIndex, 'content.alignCol', vertical);
			}
		} else {
			cells.operateCellsByRegion(operRegion, function(cell) {
				if (transverse !== undefined) {
					cell.set('content.alignRow', transverse);
				} else {
					cell.set('content.alignCol', vertical);
				}
			});

		}
		type = transverse || vertical;
		sendData();

		function sendData() {
			send.PackAjax({
				url: url,
				data: JSON.stringify({
					coordinate: sendRegion,
					alignStyle: type
				})
			});
		}
	};
	return setAlign;
});