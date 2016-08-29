'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		getOperRegion = require('basic/tools/getoperregion');

	var setCellContent = function(sheetId, text, label) {
		var clip,
			region,
			operRegion,
			sendRegion,
			startColSort,
			startRowSort,
			endColSort,
			endRowSort,
			i, j;

		clip = selectRegions.getModelByType('clip')[0];
		if (clip !== undefined) {
			cache.clipState = 'null';
			clip.destroy();
		}
		region = getOperRegion(label);
		operRegion = region.operRegion;
		sendRegion = region.sendRegion;

		startColSort = sendRegion.startColSort;
		startRowSort = sendRegion.startRowSort;
		endColSort = sendRegion.endColSort;
		endRowSort = sendRegion.endRowSort;

		cells.operateCellsByRegion(operRegion, function(cell) {
			cell.set('content.texts', text);
		});

		for (i = startRowSort; i < endRowSort + 1; i++) {
			for (j = startColSort; j < endColSort + 1; j++) {
				send.PackAjax({
					url: 'text.htm?m=data',
					data: JSON.stringify({
						coordinate: {
							startSortX: j,
							startSortY: i,
						},
						content: text
					})
				});
			}
		}

	};
	return setCellContent;
});