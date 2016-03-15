define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		common = require('entrance/regionoperation'),
		sendRegion;


	var setAlign = function(sheetId, alignType, region) {
		var url,
			transverse,
			vertical;
		switch (alignType) {
			case 'left':
				url = "cells.htm?m=align_level";
				transverse = 'left';
				break;
			case 'center':
				url = "cells.htm?m=align_level";
				transverse = 'center';
				break;
			case 'right':
				url = "cells.htm?m=align_level";
				transverse = 'right';
				break;
			case 'top':
				url = "cells.htm?m=align_vertical";
				vertical = 'top';
				break;
			case 'middle':
				url = "cells.htm?m=align_vertical";
				vertical = 'middle';
				break;
			case 'bottom':
				url = "cells.htm?m=align_vertical";
				vertical = 'bottom';
				break;
			default:
				return;
		}
		sendRegion = common.regionOperation(sheetId, region, function(cell) {
			if (transverse !== undefined) {
				cell.set('content.alignRow', transverse);
			} else {
				cell.set('content.alignCol', vertical);
			}
		});
		var type;
		type = transverse || vertical;
		send.PackAjax({
			url: url,
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: sendRegion.startColIndex,
					startY: sendRegion.startRowIndex,
					endX: sendRegion.endColIndex,
					endY: sendRegion.endRowIndex
				},
				alignStyle: type
			})
		});

	};
	return setAlign;
});