define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		common = require('entrance/regionoperation'),
		sendRegion;

	var mergeCell = function(sheetId, region) {
		var operationRegion = {};
		if (region !== undefined && region !== null) {
			operationRegion = common.getRegionIndexByRegionLabel(region);
			operationRegion = common.getFullSelectRegion(operationRegion.startColIndex, operationRegion.startRowIndex, operationRegion.endColIndex, operationRegion.endRowIndex);
		} else {
			operationRegion.startColIndex = selectRegions.models[0].get('wholePosi').startX;
			operationRegion.startRowIndex = selectRegions.models[0].get('wholePosi').startY;
			operationRegion.endColIndex = selectRegions.models[0].get('wholePosi').endX;
			operationRegion.endRowIndex = selectRegions.models[0].get('wholePosi').endY;
		}

		var startIndexCol = operationRegion.startColIndex,
			startIndexRow = operationRegion.startRowIndex,
			endIndexCol = operationRegion.endColIndex,
			endIndexRow = operationRegion.endRowIndex,
			selectRegionCells = cells.getCellByRow(startIndexRow, startIndexCol, endIndexRow, endIndexCol),
			i, j,
			len,
			cacheCell,
			gridLineColList = headItemCols.models,
			gridLineRowList = headItemRows.models,
			occupyX = [],
			occupyY = [],
			tempCell,
			width = 0,
			height = 0,
			aliasCol,
			aliasRow;

		//ajax action
		var data = {
			excelId: window.SPREADSHEET_AUTHENTIC_KEY,
			sheetId: '1',
			coordinate: {
				startX: startIndexCol,
				startY: startIndexRow,
				endX: endIndexCol,
				endY: endIndexRow
			}

		};
		send.PackAjax({
			url: 'cells.htm?m=merge',
			data: JSON.stringify(data),
			success: function(data) {}
		});
		len = selectRegionCells.length;

		for (i = 0; i < len; i++) {
			if (selectRegionCells[i].get('content').texts !== '') {
				cacheCell = selectRegionCells[i].clone();
				break;
			}
		}

		//cells中包含文本的单元格的个数
		if (len) {
			//销毁选中的单元格
			for (i = 0; i < len; i++) {
				selectRegionCells[i].set('isDestroy', true);
			}
		}
		//删除position索引
		for (i = 0; i < endIndexCol - startIndexCol + 1; i++) {
			for (j = 0; j < endIndexRow - startIndexRow + 1; j++) {
				aliasCol = gridLineColList[startIndexCol + i].get('alias');
				aliasRow = gridLineRowList[startIndexRow + j].get('alias');
				deletePosi(aliasCol, aliasRow);
			}
		}
		//获取occupy信息
		for (i = 0; i < endIndexCol - startIndexCol + 1; i++) {
			occupyX.push(gridLineColList[startIndexCol + i].get('alias'));
			width += gridLineColList[startIndexCol + i].get('width') + 1;
		}
		for (i = 0; i < endIndexRow - startIndexRow + 1; i++) {
			occupyY.push(gridLineRowList[startIndexRow + i].get('alias'));
			height += gridLineRowList[startIndexRow + i].get('height') + 1;
		}
		tempCell = {
			occupy: {
				x: occupyX,
				y: occupyY
			},
			physicsBox: {
				top: gridLineRowList[startIndexRow].get('top'),
				left: gridLineColList[startIndexCol].get('left'),
				width: width - 1,
				height: height - 1
			}
		};
		if (cacheCell) {
			cacheCell.set('occupy', tempCell.occupy);
			cacheCell.set('physicsBox', tempCell.physicsBox);
			tempCell = cacheCell;
		}
		cells.add(tempCell);
		//维护posi
		for (i = 0; i < endIndexCol - startIndexCol + 1; i++) {
			for (j = 0; j < endIndexRow - startIndexRow + 1; j++) {
				cache.cachePosition(gridLineRowList[startIndexRow + j].get('alias'), gridLineColList[startIndexCol + i].get('alias'), cells.length - 1);
			}
		}
		//更新选中视图
	};
	
	function deletePosi(indexCol, indexRow) {
		var currentCellPosition = cache.CellsPosition,
			currentStrandX = currentCellPosition.strandX,
			currentStrandY = currentCellPosition.strandY;
		if (currentStrandX[indexCol] !== undefined && currentStrandX[indexCol][indexRow] !== undefined) {
			delete currentStrandX[indexCol][indexRow];
			if (!Object.getOwnPropertyNames(currentStrandX[indexCol]).length) {
				delete currentStrandX[indexCol];
			}
		}
		if (currentStrandY[indexRow] !== undefined && currentStrandY[indexRow][indexCol] !== undefined) {
			delete currentStrandY[indexRow][indexCol];
			if (!Object.getOwnPropertyNames(currentStrandY[indexRow]).length) {
				delete currentStrandY[indexRow];
			}
		}
	}
	return mergeCell;
});