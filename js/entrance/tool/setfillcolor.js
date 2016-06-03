'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		analysisLabel = require('basic/tools/analysislabel');


	var setFillColor = function(sheetId, color, label) {
		var select,
			region = {},
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias;
		//增加行列操作判断
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

		cells.operateCellsByRegion(region, function(cell) {
			cell.set('customProp.background', color);
		});

		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias = headItemRows.models[region.startRowIndex].get('alias');
		endColAlias = headItemCols.models[region.endColIndex].get('alias');
		endRowAlias = headItemRows.models[region.endRowIndex].get('alias');

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