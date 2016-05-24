define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cells = require('collections/cells'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		analysisLabel = require('basic/tools/analysislabel');

	var setCellBorder = function(sheetId, border, label) {
		var region = {},
			select;
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
		switch (border) {
			case 'bottom':
				setBottom(true, region);
				break;
			case 'top':
				setTop(true, region);
				break;
			case 'left':
				setLeft(true, region);
				break;
			case 'right':
				setRight(true, region);
				break;
			case 'none':
				setNone(region);
				break;
			case 'all':
				setAll(region);
				break;
			case 'outer':
				setOuter();
				break;
		}
		send.PackAjax({
			url: 'cells.htm?m=frame',
			data: JSON.stringify({
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startX: region.startColIndex,
					startY: region.startRowIndex,
					endX: region.endColIndex,
					endY: region.endRowIndex
				},
				frameStyle: border
			})
		});
		/**
		 * 清除全边框
		 * @method setNone
		 */
		function setNone() {
			cells.operateCellsByRegion(region, function(cell) {
				cell.set('border.left', false);
				cell.set('border.right', false);
				cell.set('border.top', false);
				cell.set('border.bottom', false);
			});
		}
		/**
		 * 设置全边框
		 * @method setAll
		 */
		function setAll() {
			cells.operateCellsByRegion(region, function(cell) {
				cell.set('border.left', true);
				cell.set('border.right', true);
				cell.set('border.top', true);
				cell.set('border.bottom', true);
			});
		}
		/**
		 * 设置上边框
		 * @method setTop
		 * @param  {boolean} reverse
		 */
		function setTop() {
			var cellList, i;
			cellList = cells.getTopHeadModelByIndex(region.startColIndex,
				region.startRowIndex,
				region.endColIndex,
				region.endRowIndex);
			for (i in cellList) {
				cellList[i].set('border.top', true);
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
			cellList = cells.getLeftHeadModelByIndex(region.startColIndex,
				region.startRowIndex,
				region.endColIndex,
				region.endRowIndex);
			for (i in cellList) {
				cellList[i].set('border.left', true);
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
			cellList = cells.getBottomHeadModelByIndex(region.startColIndex,
				region.startRowIndex,
				region.endColIndex,
				region.endRowIndex);
			for (i in cellList) {
				cellList[i].set('border.bottom', true);
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
			cellList = cells.getRightHeadModelByIndex(region.startColIndex,
				region.startRowIndex,
				region.endColIndex,
				region.endRowIndex);
			for (i in cellList) {
				cellList[i].set('border.right', true);
			}
		}
		/**
		 * 设置外边框
		 * @method setOuter
		 */
		function setOuter() {
			setTop(region);
			setRight(region);
			setBottom(region);
			setLeft(region);
		}

	};
	return setCellBorder;
});