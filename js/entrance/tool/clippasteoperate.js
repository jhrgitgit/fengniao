define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		cells = require('collections/cells'),
		Cell = require('models/cell'),
		send = require('basic/tools/send'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion');

	function clipPasteOperate(pasteText) {
		if (cache.clipState === "copy") {
			excelDataPaste("copy");
		} else if (cache.clipState === "cut") {
			excelDataPaste("cut");
		} else {
			clipBoardDataPaste(pasteText);
		}
	}

	function excelDataPaste(type) {
		var clipRegion,
			selectRegion,
			startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex,
			clipColAlias,
			clipRowAlias,
			selectColAlias,
			selectRowAlias,
			relativeColIndex,
			relativeRowIndex,
			tempCopyCellModel,
			tempCellModel,
			CellModel,
			sendData = [],
			text = "",
			i,
			j;

		clipRegion = selectRegions.getModelByType("clip")[0];
		selectRegion = selectRegions.getModelByType("operation")[0];

		startColIndex = clipRegion.get("wholePosi").startX;
		startRowIndex = clipRegion.get("wholePosi").startY;
		endColIndex = clipRegion.get("wholePosi").endX;
		endRowIndex = clipRegion.get("wholePosi").endY;

		relativeColIndex = startColIndex - selectRegion.get("wholePosi").startX;
		relativeRowIndex = startRowIndex - selectRegion.get("wholePosi").startY;

		if (isAblePaste(endRowIndex - startRowIndex + 1, endColIndex - startColIndex + 1) === false) return;
		//超出已加载区域处理
		for (i = startRowIndex; i < endRowIndex + 1; i++) {
			for (j = startColIndex; j < endColIndex + 1; j++) {
				clipColAlias = headItemCols.models[j].get('alias');
				clipRowAlias = headItemRows.models[i].get('alias');
				selectColAlias = headItemCols.models[j - relativeColIndex].get('alias');
				selectRowAlias = headItemRows.models[i - relativeRowIndex].get('alias');

				tempCellModel = cells.getCellByAlias(selectColAlias, selectRowAlias);

				CellModel = cells.getCellByAlias(clipColAlias, clipRowAlias);

				deletePosi(selectColAlias, selectRowAlias);
				if (type === "cut") deletePosi(clipColAlias, clipRowAlias);
				if (CellModel !== null && CellModel.get('occupy').x[0] === clipColAlias && CellModel.get('occupy').y[0] === clipRowAlias) {
					if (tempCellModel !== null) {
						tempCellModel.set('isDestroy', true);
					}
					tempCopyCellModel = CellModel.clone();
					if (type === "cut") {
						CellModel.set('isDestroy', true);
					}
					adaptCell(tempCopyCellModel, relativeColIndex, relativeRowIndex);
					cacheCellPosition(tempCopyCellModel);
					cells.add(tempCopyCellModel);
				}
			}
		}
		cache.clipState = "null";
		Backbone.trigger('event:cellsContainer:adjustSelectRegion', {
			startColIndex: startColIndex - relativeColIndex,
			startRowIndex: startRowIndex - relativeRowIndex,
			endColIndex: endColIndex - relativeColIndex,
			endRowIndex: endRowIndex - relativeRowIndex
		});
		send.PackAjax({
			url: 'plate.htm?m=' + type,
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				orignal: {
					startColAlias: headItemCols.models[clipRegion.get("wholePosi").startX].get('alias'),
					endColAlias: headItemCols.models[clipRegion.get("wholePosi").endX].get('alias'),
					startRowAlias: headItemRows.models[clipRegion.get("wholePosi").startY].get('alias'),
					endRowAlias: headItemRows.models[clipRegion.get("wholePosi").endY].get('alias')
				},
				target: {
					colAlias: headItemCols.models[selectRegion.get("wholePosi").startX].get('alias'),
					rowAlias: headItemRows.models[selectRegion.get("wholePosi").startY].get('alias'),
				}
			})
		});
		clipRegion.destroy();
	}

	function cacheCellPosition(cell) {
		var occupyCols = cell.get('occupy').x,
			occupyRows = cell.get('occupy').y,
			aliasCol,
			aliasRow,
			rowLen,
			colLen,
			i = 0,
			j;
		rowLen = occupyRows.length;
		colLen = occupyCols.length;
		for (; i < rowLen; i++) {
			for (j = 0; j < colLen; j++) {
				cache.cachePosition(occupyRows[i], occupyCols[j], cells.length);
			}
		}

	}

	function adaptCell(cell, relativeColIndex, relativeRowIndex) {
		var arrayOriginalColAlias,
			arrayOriginalRowAlias,
			arrayColAlias = [],
			arrayRowAlias = [],
			colIndex,
			rowIndex,
			left, top,
			width = 0,
			height = 0,
			rowLen, colLen, i;

		arrayOriginalColAlias = cell.get("occupy").x;
		arrayOriginalRowAlias = cell.get("occupy").y;
		rowLen = arrayOriginalRowAlias.length;
		colLen = arrayOriginalColAlias.length;
		//增加超过加载区域处理
		for (i = 0; i < rowLen; i++) {
			rowIndex = headItemRows.getIndexByAlias(arrayOriginalRowAlias[i]) - relativeRowIndex;
			arrayRowAlias.push(headItemRows.models[rowIndex].get("alias"));
			height += headItemRows.models[rowIndex].get("height") + 1;
			if (i === 0) top = headItemRows.models[rowIndex].get("top");
		}
		for (i = 0; i < colLen; i++) {
			colIndex = headItemCols.getIndexByAlias(arrayOriginalColAlias[i]) - relativeColIndex;
			arrayColAlias.push(headItemCols.models[colIndex].get("alias"));
			width += headItemCols.models[colIndex].get("width") + 1;
			if (i === 0) left = headItemCols.models[colIndex].get("left");
		}

		cell.set("occupy", {
			x: arrayColAlias,
			y: arrayRowAlias
		});
		cell.set("physicsBox", {
			top: top,
			left: left,
			width: width - 1,
			height: height - 1
		});
	}

	function isAblePaste(rowlen, collen) {
		var rowStartIndex,
			colStartIndex,
			rowEndIndex,
			colEndIndex,
			cellModelArray,
			i = 0;

		colStartIndex = selectRegions.models[0].get('wholePosi').startX;
		rowStartIndex = selectRegions.models[0].get('wholePosi').startY;
		rowEndIndex = rowStartIndex + rowlen - 1;
		colEndIndex = colStartIndex + collen - 1;
		cellModelArray = cells.getRegionCells(colStartIndex, rowStartIndex, colEndIndex, rowEndIndex);
		for (; i < cellModelArray.length; i++) {
			if (cellModelArray[i] === null) continue;
			if (cellModelArray[i].get('occupy').x.length > 1 || cellModelArray[i].get('occupy').y.length > 1) {
				return false;
			}
		}
		return true;
	}

	function deletePosi(aliasCol, aliasRow) {
		var currentCellPosition = cache.CellsPosition,
			currentStrandX = currentCellPosition.strandX,
			currentStrandY = currentCellPosition.strandY;
		if (currentStrandX[aliasCol] !== undefined && currentStrandX[aliasCol][aliasRow] !== undefined) {
			delete currentStrandX[aliasCol][aliasRow];
			if (!Object.getOwnPropertyNames(currentStrandX[aliasCol]).length) {
				delete currentStrandX[aliasCol];
			}
		}
		if (currentStrandY[aliasRow] !== undefined && currentStrandY[aliasRow][aliasCol] !== undefined) {
			delete currentStrandY[aliasRow][aliasCol];
			if (!Object.getOwnPropertyNames(currentStrandY[aliasRow]).length) {
				delete currentStrandY[aliasRow];
			}
		}
	}
	/**
	 * 剪切板数据源数据解析
	 * @method shearPlateDataPaste
	 * @param  {String} pasteText 复制数据内容
	 */
	function clipBoardDataPaste(pasteText) {
		var encodeText,
			rowData = [],
			tempCellData = [],
			decodeText,
			sendData = [],
			clipRegion;

		encodeText = encodeURI(pasteText);
		rowData = encodeText.split('%0D%0A');
		if (isAblePaste(rowData.length - 1, rowData[0].split('%09').length) === false) return;

		for (var i = 0; i < rowData.length; i++) {
			tempCellData = rowData[i].split('%09');
			for (var j = 0; j < tempCellData.length; j++) {
				if (tempCellData[j] !== '') {
					sendData.push(textToCell(i, j, decodeURI(analysisText(tempCellData[j]))));
				}
			}
		}

		clipRegion = selectRegions.getModelByType("clip")[0];
		if (clipRegion !== null && clipRegion !== undefined) {
			clipRegion.destory();
		}
		cache.clipState = "null";
		send.PackAjax({
			url: 'plate.htm?m=paste',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				pasteData: sendData
			})
		});

		function analysisText(text) {
			var head = '',
				tail = '';
			if (text.indexOf("%0A") === -1) {
				return text;
			}
			text = text.substring(3, text.length - 3);
			while (true) {
				if (text.indexOf("%22%22") === 0) {
					text = text.substring(6);
					head += "%22";
				} else {
					break;
				}
			}
			while (true) {
				if (text.lastIndexOf("%22%22") === text.length - 6 && text.length > 6) {
					text = text.substring(0, text.length - 6);
					tail += "%22";
				} else {
					break;
				}
			}
			text = head + text + tail;
			return text;
		}
	}

	function textToCell(relativeRowIndex, relativeColIndex, text) {
		var cacheCell,
			tempCell,
			indexCol,
			indexRow,
			aliasCol,
			aliasRow,
			gridLineColList,
			gridLineRowList,
			result;

		if (text === '') return;
		gridLineColList = headItemCols.models;
		gridLineRowList = headItemRows.models;
		indexCol = selectRegions.models[0].get('wholePosi').startX + relativeColIndex;
		indexRow = selectRegions.models[0].get('wholePosi').startY + relativeRowIndex;

		tempCell = cells.getCellByX(indexCol, indexRow)[0];

		if (tempCell !== undefined && tempCell.get(isDestroy) === false) {
			tempCell = null;
			tempCell.set("isDestroy", true);
		}

		var top, left, width, height;
		top = gridLineRowList[indexRow].get('top');
		left = gridLineColList[indexCol].get('left');
		width = gridLineColList[indexCol].get('width');
		height = gridLineRowList[indexRow].get('height');
		cacheCell = new Cell();
		//判断是否已经存在单元格
		aliasCol = gridLineColList[indexCol].get('alias');
		aliasRow = gridLineRowList[indexRow].get('alias');
		cacheCell.set('occupy', {
			x: [aliasCol],
			y: [aliasRow]
		});
		cacheCell.set('physicsBox', {
			top: top,
			left: left,
			width: width,
			height: height
		});
		cacheCell.set("content.texts", text);
		cache.cachePosition(aliasRow, aliasCol, cells.length);
		cells.add(cacheCell);
		result = {
			aliasCol: aliasCol,
			aliasRow: aliasRow,
			text: text
		};
		return result;
	}

	return clipPasteOperate;
});