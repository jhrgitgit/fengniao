define(function(require) {
	'use strict';
	var cache = require('basic/tools/cache'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		getOperRegion = require('basic/tools/getoperregion'),
		getTextByCoordinate;

	getTextByCoordinate = function(sheetId, label) {
		var region,
			operRegion,
			headLineColModelList = headItemCols.models,
			headLineRowModelList = headItemRows.models,
			aliasGridRow,
			aliasGridCol,
			cellsPositionX,
			modelCell;

		//bug：超出加载区域，出现错误
		region = getOperRegion(label);
		operRegion = region.operRegion;

		aliasGridCol = headLineColModelList[operRegion.startColIndex].get('alias');
		aliasGridRow = headLineRowModelList[operRegion.startRowIndex].get('alias');

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