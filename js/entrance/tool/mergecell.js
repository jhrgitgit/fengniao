'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		Cell = require('models/cell'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		analysisLabel = require('basic/tools/analysislabel'),
		mergeCell;

	mergeCell = function(sheetId, label) {
		var gridLineColList = headItemCols.models,
			gridLineRowList = headItemRows.models,
			startRowIndex,
			startColIndex,
			endRowIndex,
			endColIndex,
			startRowAlias,
			startColAlias,
			endRowAlias,
			endColAlias,
			textCellNum,
			region = {},
			select,
			cacheCell,
			cellList,
			occupyX = [],
			occupyY = [],
			aliasCol,
			aliasRow,
			width = 0,
			height = 0,
			len, i = 0,
			j = 0;

		if (label !== undefined) {
			region = analysisLabel(label);
		} else {
			select = selectRegions.getModelByType('operation')[0];
			region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
			region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
			region.endColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').endX);
			region.endRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').endY);
		}
		if (region.endColIndex === 'MAX' || region.endRowIndex === 'MAX') {
			return;
		}
		region = cells.getFullOperationRegion(region);
		startRowIndex = region.startRowIndex;
		startColIndex = region.startColIndex;
		endRowIndex = region.endRowIndex;
		endColIndex = region.endColIndex;
		/**
		 * 合并操作：
		 * 存在含有文本单元格，按照先行后列，
		 *
		 */
		cellList = cells.getCellByRow(startRowIndex, startColIndex, endRowIndex, endColIndex);

		len = cellList.length;
		for (i = 0; i < len; i++) {
			if (cellList[i].get('content').texts !== '') {
				textCellNum++;
				cacheCell = cellList[i].clone();
			}
		}
		if (textCellNum > 1) {
			return;
		}
		if (textCellNum === 0 && cellList.length > 0) {
			cacheCell = cellList[0].clone();
		}
		if (cacheCell === undefined) {
			cacheCell = new Cell();
		}
		if (len) {
			for (i = 0; i < len; i++) {
				cellList[i].set('isDestroy', true);
			}
		}
		//删除position索引
		for (i = 0; i < endColIndex - startColIndex + 1; i++) {
			for (j = 0; j < endRowIndex - startRowIndex + 1; j++) {
				aliasCol = gridLineColList[startColIndex + i].get('alias');
				aliasRow = gridLineRowList[startRowIndex + j].get('alias');
				cache.deletePosi(aliasCol, aliasRow);
			}
		}
		//获取occupy信息
		for (i = 0; i < endColIndex - startColIndex + 1; i++) {
			occupyX.push(gridLineColList[startColIndex + i].get('alias'));
			width += gridLineColList[startColIndex + i].get('width') + 1;
		}
		for (i = 0; i < endRowIndex - startRowIndex + 1; i++) {
			occupyY.push(gridLineRowList[startRowIndex + i].get('alias'));
			height += gridLineRowList[startRowIndex + i].get('height') + 1;
		}
		cacheCell.set('physicsBox', {
			top: gridLineRowList[startRowIndex].get('top'),
			left: gridLineColList[startColIndex].get('left'),
			width: width - 1,
			height: height - 1
		});
		cacheCell.set('occupy', {
			x: occupyX,
			y: occupyY
		});
		cells.add(cacheCell);
		for (i = 0; i < endColIndex - startColIndex + 1; i++) {
			for (j = 0; j < endRowIndex - startRowIndex + 1; j++) {
				aliasCol = gridLineColList[startColIndex + i].get('alias');
				aliasRow = gridLineRowList[startRowIndex + j].get('alias');
				cache.cachePosition(aliasRow, aliasCol, cells.length - 1);
			}
		}
		startRowAlias = gridLineRowList[startRowIndex].get('alias');
		startColAlias = gridLineColList[startColIndex].get('alias');
		endRowAlias = gridLineRowList[endRowIndex].get('alias');
		endColAlias = gridLineColList[endColIndex].get('alias');

		send.PackAjax({
			url: 'cells.htm?m=merge',
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


	return mergeCell;
});