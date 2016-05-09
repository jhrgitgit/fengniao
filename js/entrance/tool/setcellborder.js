define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cells = require('collections/cells'),
		selectRegions = require('collections/selectRegion'),
		common = require('entrance/regionoperation');

	var setCellBorder = function(sheetId, border, region) {
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
					startX: operationRegion.startColIndex,
					startY: operationRegion.startRowIndex,
					endX: operationRegion.endColIndex,
					endY: operationRegion.endRowIndex
				},
				frameStyle: border
			})
		});
		/**
		 * 清除全边框
		 * @method setNone
		 */
		function setNone(region) {
			common.regionOperation('1', region, function(cell) {
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
		function setAll(region) {
			common.regionOperation('1', region, function(cell) {
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
		function setTop(reverse) {
			var cellList = cells.getTopHeadModelByIndex(operationRegion.startColIndex, operationRegion.startRowIndex, operationRegion.endColIndex, operationRegion.endRowIndex);
			common.cellListOperation('1', cellList, function(cell) {
				cell.set('border.top', reverse);
			});
		}
		/**
		 * 设置左边框
		 * @method setLeft
		 * @param  {boolean} reverse
		 * @param  {object} [appointList]
		 */
		function setLeft(reverse) {
			var cellList = cells.getLeftHeadModelByIndex(operationRegion.startColIndex, operationRegion.startRowIndex, operationRegion.endColIndex, operationRegion.endRowIndex);
			common.cellListOperation('1', cellList, function(cell) {
				cell.set('border.left', reverse);
			});
		}
		/**
		 * 设置下边框
		 * @method setBottom
		 * @param  {boolean} reverse
		 * @param  {object} [appointList]
		 */
		function setBottom(reverse) {
			var cellList = cells.getBottomHeadModelByIndex(operationRegion.startColIndex, operationRegion.startRowIndex, operationRegion.endColIndex, operationRegion.endRowIndex);
			common.cellListOperation('1', cellList, function(cell) {
				cell.set('border.bottom', reverse);
			});
		}
		/**
		 * 设置右边框
		 * @method setRight
		 * @param  {boolean} reverse
		 * @param  {object} [appointList]
		 */
		function setRight(reverse) {
			var cellList = cells.getRightHeadModelByIndex(operationRegion.startColIndex, operationRegion.startRowIndex, operationRegion.endColIndex, operationRegion.endRowIndex);
			common.cellListOperation('1', cellList, function(cell) {
				cell.set('border.right', reverse);
			});
		}
		/**
		 * 设置外边框
		 * @method setOuter
		 */
		function setOuter() {
			setTop(true);
			setRight(true);
			setBottom(true);
			setLeft(true);
		}

	};
	return setCellBorder;
});