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
			startColDisplayName,
			startRowDisplayName,
			endColDisplayName,
			endRowDisplayName,
			startColSort, //后台Excel对象存储的正确索引值
			endColSort,
			startRowSort,
			endRowSort,
			headItemColList = headItemCols.models,
			headItemRowList = headItemRows.models,
			tempSort,
			tempDisplayName;

		if (regionLabel instanceof Array) {
			//判断数组长度
			if (regionLabel.length !== 2) {
				throw new Error('Parameter format error');
			}
			//匹配数据格式
			if (!reg.test(regionLabel[0]) && !reg.test(regionLabel[1])) {
				throw new Error('Parameter format error');
			}

			startColDisplayName = getDisplayName(regionLabel[0], 'col');
			startRowDisplayName = getDisplayName(regionLabel[0], 'row');
			endColDisplayName = getDisplayName(regionLabel[1], 'col');
			endRowDisplayName = getDisplayName(regionLabel[1], 'row');

			startColSort = colSignToSort(startColDisplayName);
			endColSort = colSignToSort(endColDisplayName);
			startRowSort = rowSignToSort(startRowDisplayName);
			endRowSort = rowSignToSort(endRowDisplayName);

			if (startColSort > endColSort) {
				tempSort = startColSort;
				startColSort = endColSort;
				endColSort = tempSort;
				tempDisplayName = startColDisplayName;
				startColDisplayName = endColDisplayName;
				endColDisplayName = tempDisplayName;
			}
			if (startRowSort > endRowSort) {
				tempSort = startRowSort;
				startRowSort = endRowSort;
				endRowSort = tempSort;
				tempDisplayName = startRowDisplayName;
				startRowDisplayName = endRowDisplayName;
				endRowDisplayName = tempDisplayName;
			}
			//暂时使用，以后更改为sort
			region.startRowDisplayName = startRowDisplayName;
			region.endRowDisplayName = endRowDisplayName;
			region.startColDisplayName = startColDisplayName;
			region.endColDisplayName = endColDisplayName;

			region.startColSort = startColSort;
			region.endColSort = endColSort;
			region.startRowSort = startRowSort;
			region.endRowSort = endRowSort;

			region.startColIndex = binary.indexAttrBinary(startColSort, headItemColList, 'sort');
			region.endColIndex = binary.indexAttrBinary(endColSort, headItemColList, 'sort');
			region.startRowIndex = binary.indexAttrBinary(startRowSort, headItemRowList, 'sort');
			region.endRowIndex = binary.indexAttrBinary(endRowSort, headItemRowList, 'sort');

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
			region.endRowDisplayName = region.startRowDisplayName = getDisplayName(regionLabel, 'row');
			region.endColDisplayName = region.startColDisplayName = getDisplayName(regionLabel, 'col');
			startColSort = colSignToSort(region.startColDisplayName);
			startRowSort = rowSignToSort(region.startRowDisplayName);
			region.startColSort = region.endColSort = startColSort;
			region.startRowSort = region.endRowSort = startRowSort;
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