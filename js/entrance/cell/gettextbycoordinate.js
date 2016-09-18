
define(function(require) {
	'use strict';
	var cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		analysisLabel = require('basic/tools/analysislabel'),
		getOperRegion = require('basic/tools/getoperregion'),
		getTextByCoordinate;

	getTextByCoordinate = function(sheetId, label) {
		var select,
			region,
			headLineColModelList = headItemCols.models,
			headLineRowModelList = headItemRows.models,
			aliasGridRow,
			aliasGridCol,
			cellsPositionX,
			modelCell;

		region = getOperRegion(label).operRegion;

		aliasGridCol = headLineColModelList[region.startColIndex].get('alias');
		aliasGridRow = headLineRowModelList[region.startRowIndex].get('alias');

		cellsPositionX = cache.CellsPosition.strandX;

		if (cellsPositionX[aliasGridCol] !== undefined &&
			cellsPositionX[aliasGridCol][aliasGridRow] !== undefined) {
			modelCell = cells.models[cellsPositionX[aliasGridCol][aliasGridRow]];
			return modelCell.get('content').texts;
		} else {
			return '';
		}
	};
	return getTextByCoordinate;
});