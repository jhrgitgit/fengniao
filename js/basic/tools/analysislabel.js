'use strict';
define(function(require) {
	var analysisLabel,
		headItemCol = require('collections/headItemCol'),
		headItemRow = require('collections/headItemRow');
	/**
	 * 对外开放接口，将开发者传入label转为内部可使用索引
	 * @param  {array/string} label 标签
	 * @return {object} 索引对象
	 */
	analysisLabel = function(regionLabel) {
		var region = {};

		if (regionLabel instanceof Array) {
			region.startColIndex = headItemCol.getIndexByDisplayname(getDisplayName(regionLabel[0], 'col'));
			region.startRowIndex = headItemRow.getIndexByDisplayname(getDisplayName(regionLabel[0], 'row'));
			region.endColIndex = headItemCol.getIndexByDisplayname(getDisplayName(regionLabel[1], 'col'));
			region.endRowIndex = headItemRow.getIndexByDisplayname(getDisplayName(regionLabel[1], 'row'));
		} else if (/^[A-Z]+$/.test(regionLabel)) { //整列操作
			region.startRowIndex = 0;
			region.endRowIndex = 'MAX';
			region.startColIndex = region.endColIndex = headItemCol.getIndexByDisplayname(regionLabel);
		} else if (/^[0-9]+$/.test(regionLabel)) { //整行操作
			region.startColIndex = 0;
			region.endColIndex = 'MAX';
			region.startRowIndex = region.endRowIndex = headItemRow.getIndexByDisplayname(regionLabel);
		} else {
			region.startColIndex = region.endColIndex = headItemCol.getIndexByDisplayname(getDisplayName(regionLabel, 'col'));
			region.startRowIndex = region.endRowIndex = headItemRow.getIndexByDisplayname(getDisplayName(regionLabel, 'row'));
		}
		return region;

		function getDisplayName(regionLabel, lineType) {
			var result = '',
				len = 0;
			if (/[A-Z]/i.test(regionLabel)) {
				len = regionLabel.match(/[A-Z]/ig).length;
			}
			if (lineType === 'col') {
				result = regionLabel.substring(0, len);
			} else if (lineType === 'row') {
				result = regionLabel.substring(len);
			}
			return result;
		}
	};
	return analysisLabel;
});