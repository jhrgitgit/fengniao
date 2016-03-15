define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		binary = require('basic/util/binary'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		common = require('entrance/regionoperation'),
		sendRegion;

	var splitCell = function(sheetId, region) {
		var operationRegion = {};
		//选中区域内开始坐标，结束坐标
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
			selectRegionCells,
			cacheCell,
			headLineColList,
			headLineRowList,
			i, j, len,
			aliasCol, aliasRow;


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
			url: 'cells.htm?m=merge_delete',
			data: JSON.stringify(data),
			success: function(data) {}
		});


		//选中区域内所有单元格对象
		selectRegionCells = cells.getCellByX(startIndexCol, startIndexRow, endIndexCol, endIndexRow);
		headLineColList = headItemCols.models;
		headLineRowList = headItemRows.models;
		//删除position索引
		for (i = 0; i < endIndexCol - startIndexCol + 1; i++) {
			for (j = 0; j < endIndexRow - startIndexRow + 1; j++) {
				aliasCol = headLineColList[startIndexCol + i].get('alias');
				aliasRow = headLineRowList[startIndexRow + j].get('alias');
				deletePosi(aliasCol, aliasRow);
			}
		}
		len = selectRegionCells.length;
		for (i = 0; i < len; i++) {
			cacheCell = selectRegionCells[i].clone();
			selectRegionCells[i].set('isDestroy', true);
			splitCreateCell(cacheCell);
		}
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

	function splitCreateCell(cacheCell) {
		var gridLineColList,
			gridLineRowList,
			startIndexCol,
			startIndexRow,
			endIndexRow,
			endIndexCol;
		gridLineColList = headItemCols.models;
		gridLineRowList = headItemRows.models;

		startIndexRow = binary.modelBinary(cacheCell.get('physicsBox').top, gridLineRowList, 'top', 'height', 0, gridLineRowList.length - 1);
		startIndexCol = binary.modelBinary(cacheCell.get('physicsBox').left, gridLineColList, 'left', 'width', 0, gridLineColList.length - 1);
		endIndexRow = binary.modelBinary(cacheCell.get('physicsBox').top + cacheCell.get('physicsBox').height, gridLineRowList, 'top', 'height', 0, gridLineRowList.length - 1);
		endIndexCol = binary.modelBinary(cacheCell.get('physicsBox').left + cacheCell.get('physicsBox').width, gridLineColList, 'left', 'width', 0, gridLineColList.length - 1);

		var i = 0,
			top, left, width, height, tempCell, aliasCol, aliasRow;
		for (; i < endIndexCol - startIndexCol + 1; i++) {
			for (var j = 0; j < endIndexRow - startIndexRow + 1; j++) {
				aliasCol = gridLineColList[startIndexCol + i].get('alias');
				aliasRow = gridLineRowList[startIndexRow + j].get('alias');
				left = gridLineColList[startIndexCol + i].get('left');
				top = gridLineRowList[startIndexRow + j].get('top');
				width = gridLineColList[startIndexCol + i].get('width');
				height = gridLineRowList[startIndexRow + j].get('height');
				tempCell = cacheCell.clone();
				tempCell.set('occupy', {
					x: aliasCol,
					y: aliasRow
				});
				tempCell.set('physicsBox', {
					top: top,
					left: left,
					width: width,
					height: height
				});
				if (i !== 0) {
					tempCell.set('border.left', false);
				}
				if (j !== 0) {
					tempCell.set('border.top', false);
				}
				if (i !== 0 || j !== 0) {
					tempCell.set('content.texts', '');
				}
				cache.cachePosition(aliasRow, aliasCol, cells.length);
				cells.add(tempCell);
			}
		}
	}
	return splitCell;
});