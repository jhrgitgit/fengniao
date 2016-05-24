define(function(require) {
	'use strict';

	var send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		analysisLabel = require('basic/tools/analysislabel');

	var setCellContent = function(sheetId, text, label) {
		var select,
			region = {};
		if (label !== undefined) {
			region = analysisLabel(label);
			region = cells.getFullOperationRegion(region);
		} else {
			select = selectRegions.getModelByType('operation')[0];
			region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
			region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
		}
		cells.operateCellsByRegion(region, function(cell) {
			cell.set('content.texts', text);
		});		
		send.PackAjax({
			url: 'text.htm?m=data',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: region.startColIndex,
					startY: region.startRowIndex,
				},
				content: text
			})
		});
	};
	return setCellContent;
});