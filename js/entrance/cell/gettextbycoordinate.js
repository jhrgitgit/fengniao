define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		regionOperation = require('entrance/regionoperation'),
		getTextByCoordinate;

	getTextByCoordinate = function(sheetId, region) {
		var operationRegion = {},
			headLineColModelList = headItemCols.models,
			headLineRowModelList = headItemRows.models,
			aliasGridRow,
			aliasGridCol,
			cellsPositionX,
			modelCell;

		if (region !== undefined && region !== null) {
			operationRegion = regionOperation.getRegionIndexByRegionLabel(region);
		} else {
			operationRegion.startColIndex = selectRegions.models[0].get('wholePosi').startX;
			operationRegion.startRowIndex = selectRegions.models[0].get('wholePosi').startY;
		}
		aliasGridCol = headLineColModelList[operationRegion.startColIndex].get('alias');
		aliasGridRow = headLineRowModelList[operationRegion.startRowIndex].get('alias');

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