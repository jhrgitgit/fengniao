'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cells = require('collections/cells'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		analysisLabel = require('basic/tools/analysislabel'),
		rowOperate = require('entrance/row/rowoperation');

	var setCellBorder = function(sheetId, border, label) {
		var region = {},
			select,
			clip,
			startColAlias,
			startRowAlias,
			endColAlias,
			endRowAlias;

		if (label !== undefined) {
			region = analysisLabel(label);
		} else {
			select = selectRegions.getModelByType('operation')[0];
			region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
			region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
			region.endColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').endX);
			region.endRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').endY);
		}
		clip = selectRegions.getModelByType('clip')[0];
		if (clip !== undefined) {
			cache.clipState = 'null';
			clip.destroy();
		}
		if (region.endColIndex === 'MAX') { //整行操作
			endColAlias = 'MAX';
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		} else {
			region = cells.getFullOperationRegion(region);
			endColAlias = headItemCols.models[region.endColIndex].get('alias');
			endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
		}

		switch (border) {
			case 'bottom':
				setBottom(true);
				break;
			case 'top':
				setTop(true);
				break;
			case 'left':
				setLeft(true);
				break;
			case 'right':
				setRight(true);
				break;
			case 'none':
				setNone();
				break;
			case 'all':
				setAll();
				break;
			case 'outer':
				setOuter();
				break;
		}

		startColAlias = headItemCols.models[region.startColIndex].get('alias');
		startRowAlias = headItemRows.models[region.startRowIndex].get('alias');

		send.PackAjax({
			url: 'cells.htm?m=frame',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: startColAlias,
					startY: startRowAlias,
					endX: endColAlias,
					endY: endRowAlias
				},
				frameStyle: border
			})
		});
		/**
		 * 清除全边框
		 * @method setNone
		 */
		function setNone() {
			if (region.endColIndex === 'MAX') {
				rowOperate.rowPropOper(region.startRowIndex, 'border.left', false);
				rowOperate.rowPropOper(region.startRowIndex, 'border.right', false);
				rowOperate.rowPropOper(region.startRowIndex, 'border.top', false);
				rowOperate.rowPropOper(region.startRowIndex, 'border.bottom', false);
			} else {
				cells.operateCellsByRegion(region, function(cell) {
					cell.set('border.left', false);
					cell.set('border.right', false);
					cell.set('border.top', false);
					cell.set('border.bottom', false);
				});
			}
		}
		/**
		 * 设置全边框
		 * @method setAll
		 */
		function setAll() {
			if (region.endColIndex === 'MAX') {
				rowOperate.rowPropOper(region.startRowIndex, 'border.left', true);
				rowOperate.rowPropOper(region.startRowIndex, 'border.right', true);
				rowOperate.rowPropOper(region.startRowIndex, 'border.top', true);
				rowOperate.rowPropOper(region.startRowIndex, 'border.bottom', true);
			} else {
				cells.operateCellsByRegion(region, function(cell) {
					cell.set('border.left', true);
					cell.set('border.right', true);
					cell.set('border.top', true);
					cell.set('border.bottom', true);
				});
			}
		}
		/**
		 * 设置上边框
		 * @method setTop
		 * @param  {boolean} reverse
		 */
		function setTop() {
			var cellList, i;
			if (region.endColIndex === 'MAX') {
				rowOperate.rowPropOper(region.startRowIndex, 'border.top', true);
			} else {
				cellList = cells.getTopHeadModelByIndex(region.startColIndex,
					region.startRowIndex,
					region.endColIndex,
					region.endRowIndex);
				for (i in cellList) {
					cellList[i].set('border.top', true);
				}
			}
		}
		/**
		 * 设置左边框
		 * @method setLeft
		 * @param  {boolean} reverse
		 * @param  {object} [appointList]
		 */
		function setLeft() {
			var cellList, i;
			if (region.endColIndex === 'MAX') {
				rowOperate.rowPropOper(region.startRowIndex, 'border.left', true);
			} else {
				cellList = cells.getLeftHeadModelByIndex(region.startColIndex,
					region.startRowIndex,
					region.endColIndex,
					region.endRowIndex);
				for (i in cellList) {
					cellList[i].set('border.left', true);
				}
			}
		}
		/**
		 * 设置下边框
		 * @method setBottom
		 * @param  {boolean} reverse
		 * @param  {object} [appointList]
		 */
		function setBottom() {
			var cellList, i;
			if (region.endColIndex === 'MAX') {
				rowOperate.rowPropOper(region.startRowIndex, 'border.bottom', true);
			} else {
				cellList = cells.getBottomHeadModelByIndex(region.startColIndex,
					region.startRowIndex,
					region.endColIndex,
					region.endRowIndex);
				for (i in cellList) {
					cellList[i].set('border.bottom', true);
				}
			}
		}
		/**
		 * 设置右边框
		 * @method setRight
		 * @param  {boolean} reverse
		 * @param  {object} [appointList]
		 */
		function setRight() {
			var cellList, i;
			if (region.endColIndex === 'MAX') {
				rowOperate.rowPropOper(region.startRowIndex, 'border.right', true);
			} else {
				cellList = cells.getRightHeadModelByIndex(region.startColIndex,
					region.startRowIndex,
					region.endColIndex,
					region.endRowIndex);
				for (i in cellList) {
					cellList[i].set('border.right', true);
				}
			}
		}
		/**
		 * 设置外边框
		 * @method setOuter
		 */
		function setOuter() {
			setTop(region);
			setBottom(region);
			if (region.endColIndex !== 'MAX') {
				setLeft(region);
				setRight(region);
			}
		}

	};
	return setCellBorder;
});