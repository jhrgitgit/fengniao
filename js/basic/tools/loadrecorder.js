'use strict';
define(function(require) {
	var binary = require('basic/util/binary');

	/**
	 * 该模块对行列动态加载,提供区域区域缓存变量的维护
	 */
	return {
		insertPosi: function(startPosi, endPosi, region) {
			var startIndex,
				endIndex,
				startExist,
				endExist,
				newStartPosi,
				newEndPosi,
				len;
			startIndex = binary.indexArrayBinary(startPosi, region, 'start', 'end');
			endIndex = binary.indexArrayBinary(endPosi, region, 'start', 'end');
			startExist = binary.existArrayBinary(startPosi, region, 'start', 'end');
			endExist = binary.existArrayBinary(endPosi, region, 'start', 'end');

			newStartPosi = startExist === false ? startPosi : region[startIndex].start;
			newEndPosi = endExist === false ? endPosi : region[endIndex].end;
			//ps:对于相应区域，未进行合并，需要改进
			if (startIndex === endIndex) {
				if (startExist === true && endExist === true) {
					return;
				}
				len = (startExist === true || endExist === true) ? 1 : 0;
			} else {
				if (startExist === true && endExist === true) {
					len = endIndex - startIndex + 1;
				} else if (startExist === true || endExist === true) {
					len = endIndex - startIndex;
				} else {
					len = endIndex - startIndex - 1;
				}
			}
			region.splice(startIndex, len, {
				start: newStartPosi,
				end: newEndPosi
			});
		},
		adaptPosi: function(startPosi, value, region) {
			var startIndex,
				startExist,
				i;
			startIndex = binary.indexArrayBinary(startPosi, region, 'start', 'end');
			startExist = binary.existArrayBinary(startPosi, region, 'start', 'end');
			//问题
			if (startExist === true && region[startIndex].start !== startPosi) {
				region[startIndex].end = region[startIndex].end + value;
				for (i = startIndex + 1; i < region.length; i++) {
					region[i].start += value;
					region[i].end += value;
				}
			} else {
				for (i = startIndex; i < region.length; i++) {
					region[i].start += value;
					region[i].end += value;
				}
			}
		},
		getUnloadPosi: function(startPosi, endPosi, region) {
			var result = [],
				startIndex,
				endIndex,
				startExist,
				endExist,
				newStartPosi,
				newEndPosi,
				existStartPosi,
				existEndPosi,
				i, len;
			startIndex = binary.indexArrayBinary(startPosi, region, 'start', 'end');
			endIndex = binary.indexArrayBinary(endPosi, region, 'start', 'end');
			startExist = binary.existArrayBinary(startPosi, region, 'start', 'end');
			endExist = binary.existArrayBinary(endPosi, region, 'start', 'end');


			if (startIndex === endIndex) {

				if (startExist === false && endExist === false) {
					result.push({
						start: startPosi,
						end: endPosi
					});
				} else if (startExist === false && endExist === true) {
					newEndPosi = region[endIndex].end - 1;
					result.push({
						start: startPosi,
						end: newEndPosi
					});
				} else if (startExist === true && endExist === false) {
					newStartPosi = region[startIndex].start + 1;
					result.push({
						start: newStartPosi,
						end: endPosi
					});
				}

			} else {
				len = endIndex - startIndex;
				for (i = 0; i < endIndex + 1; i++) {
					if (region[startIndex + i] === undefined) {
						result.push({
							start: startPosi,
							end: endPosi
						});
						break;
					}
					existStartPosi = region[startIndex + i].start;
					existEndPosi = region[startIndex + i].end;
					if (startPosi > endPosi) {
						break;
					} else if (existStartPosi < startPosi) {
						startPosi = existEndPosi + 1;
					} else {
						newStartPosi = startPosi;
						newEndPosi = existStartPosi - 1;
						if (newStartPosi <= newEndPosi) {
							result.push({
								start: newStartPosi,
								end: newEndPosi
							});
						}
						startPosi = existEndPosi + 1;
					}
				}
			}
			return result;
		},
		/**
		 * 判断是否含有未从服务器请求区域
		 * @param  {int}  left       左边界
		 * @param  {int}  right      右边界
		 * @param  {int}  top        上边界
		 * @param  {int}  bottom     下边界
		 * @param  {object}  loadRegion 加载在区域
		 * @return {Boolean}   是否存在
		 */
		isIncludeUnLoadRegion: function(left, right, top, bottom, loadRegion) {
			var leftIndex,
				rightIndex,
				topIndex,
				bottomIndex;
			leftIndex = binary.tempModelBinary(left, loadRegion.transverse, 'start', 'end');
			rightIndex = binary.tempModelBinary(right, loadRegion.transverse, 'start', 'end');
			topIndex = binary.tempModelBinary(top, loadRegion.vertical, 'start', 'end');
			bottomIndex = binary.tempModelBinary(bottom, loadRegion.vertical, 'start', 'end');
			if (leftIndex === -1 ||
				rightIndex === -1 ||
				topIndex === -1 ||
				bottomIndex === -1) {
				return true;
			}
			if (leftIndex !== rightIndex ||
				topIndex !== bottomIndex) {
				return true;
			}
			return false;
		},
		/**
		 * 添加从服务器请求区域
		 * @param  {int}  left       左边界
		 * @param  {int}  right      右边界
		 * @param  {int}  top        上边界
		 * @param  {int}  bottom     下边界
		 * @param  {object}  loadRegion 加载区域
		 * @return {Boolean}   是否存在
		 */
		insertLoadRegion: function(left, right, top, bottom, loadRegion) {
			insertLeftIndex,
			insertRightIndex,
			insertTopIndex,
			insertBottomIndex,
			exsitLeftIndex,
			exsitRightIndex,
			exsitTopIndex,
			exsitBottomIndex,
			len;

			//插入数据，插入开始点与结束点，不在一起区域，需要修改原有区域
			if (insertLeftIndex !== insertRightIndex) {
				len = exsitRightIndex - exsitLeftIndex;
				if (exsitLeftIndex) {
					left = loadRegion.transverse[exsitLeftIndex].start;
				}
				if (exsitRightIndex) {
					right = loadRegion.transverse[exsitRightIndex].start;
				}
			}

		},
		/**
		 * 进行行高列宽调整，
		 * @param  {int} startPosi 调整点坐标
		 * @param  {int} value     调整值
		 * @param  {string} type      调整类型：横向/纵向
		 * @param  {object}  loadRegion 加载区域
		 */
		adjustLoadRegion: function(startPosi, value, type, loadRegion) {

		},
		/**
		 * 清空记录值
		 */
		clearLoadRegion: function(loadRegion) {},
	};
});