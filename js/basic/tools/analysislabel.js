'use strict';
define(function(require) {
	var analysisLabel,
		binary = require('basic/util/binary'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow');
	/**
	 * 对外开放接口，将开发者传入label转为内部可使用索引
	 * @param  {array/string} label 标签
	 * @return {object} 索引对象
	 */
	analysisLabel = function(regionLabel) {
		var region = {},
			reg = /^[A-Z]+[0-9]+$/,
			startColSort, //后台Excel对象存储的正确索引值
			endColSort,
			startRowSort,
			endRowSort,
			headItemColList = headItemCols.models,
			headItemRowList = headItemRows.models;

		if (regionLabel instanceof Array) {
			//判断数组长度
			if (regionLabel.length !== 2) {
				throw new Error('Parameter format error');
			}
			//匹配数据格式
			if (!reg.test(regionLabel[0]) && !reg.test(regionLabel[1])) {
				throw new Error('Parameter format error');
			}

			region.startColDisplayName = getDisplayName(regionLabel[0], 'col');
			region.startRowDisplayName = getDisplayName(regionLabel[0], 'row');
			region.endColDisplayName = getDisplayName(regionLabel[1], 'col');
			region.endRowDisplayName = getDisplayName(regionLabel[1], 'row');

			startColSort = colSignToSort(region.startColDisplayName);
			endColSort = colSignToSort(region.endColDisplayName);
			startRowSort = rowSignToSort(region.startRowDisplayName);
			endRowSort = rowSignToSort(region.endRowDisplayName);

			region.startColIndex = binary.indexAttrBinary(startColSort, headItemColList, 'sort');
			region.endColIndex = binary.indexAttrBinary(endColSort, headItemColList, 'sort');
			region.startRowIndex = binary.indexAttrBinary(startRowSort, headItemRowList, 'sort');
			region.endRowIndex = binary.indexAttrBinary(endRowSort, headItemColList, 'sort');

		} else if (/^[A-Z]+$/.test(regionLabel)) { //整列操作
			region.startRowIndex = 0;
			region.endRowIndex = 'MAX';
			region.startRowDisplayName = '1';
			region.startColDisplayName = regionLabel;
			startColSort = colSignToSort(regionLabel);
			region.startColIndex = region.endColIndex = binary.indexAttrBinary(startColSort, headItemColList, 'sort');
		} else if (/^[0-9]+$/.test(regionLabel)) { //整行操作
			region.startColIndex = 0;
			region.endColIndex = 'MAX';
			startRowSort = rowSignToSort(regionLabel);
			region.startRowDisplayName = regionLabel;
			region.startColDisplayName = 'A';
			region.startRowIndex = region.endRowIndex = binary.indexAttrBinary(startRowSort, headItemRowList, 'sort');
		} else {
			region.startRowDisplayName = getDisplayName(regionLabel, 'row');
			region.startColDisplayName = getDisplayName(regionLabel, 'col');
			startColSort = colSignToSort(region.startColDisplayName);
			startRowSort = rowSignToSort(region.startRowDisplayName);

			region.startColIndex = region.endColIndex = binary.indexAttrBinary(startColSort, headItemColList, 'sort');
			region.startRowIndex = region.endRowIndex = binary.indexAttrBinary(startRowSort, headItemRowList, 'sort');
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

		function colSignToSort(sign) {
			var i = 0,
				sort = 0,
				len = sign.length,
				letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
				index;
			for (; i < len; i++) {
				index = letter.indexOf(sign[i]) + 1;
				sort += index * (Math.pow(26, (len - i - 1)));
			}
			return sort - 1;
		}

		function rowSignToSort(sign) {
			return parseInt(sign) - 1;
		}
	};
	return analysisLabel;
});