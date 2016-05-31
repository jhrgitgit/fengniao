'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		analysisLabel = require('basic/tools/analysislabel'),
		splitCell;

	splitCell = function(sheetId, label) {
		var region = {},
			select,
			startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex,
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias,
			selectRegionCells,
			cacheCell,
			headLineColList,
			headLineRowList,
			i, j, len,
			aliasCol,
			aliasRow;
		//选中区域内开始坐标，结束坐标
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
		startColIndex = region.startColIndex;
		startRowIndex = region.startRowIndex;
		endColIndex = region.endColIndex;
		endRowIndex = region.endRowIndex;

		//选中区域内所有单元格对象
		selectRegionCells = cells.getCellByX(startColIndex, startRowIndex, endColIndex, endRowIndex);
		headLineColList = headItemCols.models;
		headLineRowList = headItemRows.models;
		//删除position索引
		for (i = 0; i < endColIndex - startColIndex + 1; i++) {
			for (j = 0; j < endRowIndex - startRowIndex + 1; j++) {
				aliasCol = headLineColList[startColIndex + i].get('alias');
				aliasRow = headLineRowList[startRowIndex + j].get('alias');
				cache.deletePosi(aliasRow, aliasCol);
			}
		}
		//ps:逻辑错误待修改
		len = selectRegionCells.length;
		for (i = 0; i < len; i++) {
			cacheCell = selectRegionCells[i].clone();
			selectRegionCells[i].set('isDestroy', true);
			modifyCell(cacheCell);
		}

		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias = headItemRows.models[region.startRowIndex].get('alias');
		endColAlias = headItemCols.models[region.endColIndex].get('alias');
		endRowAlias = headItemRows.models[region.endRowIndex].get('alias');

		send.PackAjax({
			url: 'cells.htm?m=merge_delete',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: startColAlias,
					startY: startRowAlias,
					endX: endColAlias,
					endY: endRowAlias
				}
			}),
		});
	};

	function modifyCell(cacheCell) {
		var occupy = cacheCell.get('occupy'),
			aliasCol,
			aliasRow,
			colIndex,
			rowIndex,
			width,
			height;

		aliasCol = occupy.x[0];
		aliasRow = occupy.y[0];
		colIndex = headItemCols.getIndexByAlias(aliasCol);
		rowIndex = headItemRows.getIndexByAlias(aliasRow);

		height = headItemRows.models[rowIndex].get('height');
		width = headItemCols.models[colIndex].get('width');
		cacheCell.set('occupy', {
			x: aliasCol,
			y: aliasRow
		});
		cacheCell.set('physicsBox.width', width);
		cacheCell.set('physicsBox.height', height);
		cache.cachePosition(aliasRow, aliasCol, cells.length);
		cells.add(cacheCell);
	}
	return splitCell;
});