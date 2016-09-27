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
		 * @return {Boolean}   true:存在未加载区域，false:不存在未加载区域
		 */
		isIncludeUnLoadRegion: function(left, right, top, bottom, loadRegion) {
			var leftIndex,
				rightIndex,
				topIndex,
				bottomIndex;
			leftIndex = binary.tempObjectBinary(left, loadRegion.transverse, 'start', 'end');
			rightIndex = binary.tempObjectBinary(right, loadRegion.transverse, 'start', 'end');
			topIndex = binary.tempObjectBinary(top, loadRegion.vertical, 'start', 'end');
			bottomIndex = binary.tempObjectBinary(bottom, loadRegion.vertical, 'start', 'end');
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
			this._insert(left, right, loadRegion, 'transverse');
			this._insert(top, bottom, loadRegion, 'vertical');
		},
		_insert: function(start, end, loadRegion, type) {
			var insertStartIndex,
				insertEndIndex,
				exsitStartIndex,
				exsitEndIndex,
				exsitAdjacentStartIndex,
				exsitAdjacentEndIndex,
				len = 0;
			//查询相应坐标
			insertStartIndex = binary.tempInsertObjectBinary(start, loadRegion[type], 'start', 'end');
			insertEndIndex = binary.tempInsertObjectBinary(end, loadRegion[type], 'start', 'end');
			exsitStartIndex = binary.tempObjectBinary(start, loadRegion[type], 'start', 'end');
			exsitEndIndex = binary.tempObjectBinary(end, loadRegion[type], 'start', 'end');
			//判断需要插入位置，相邻位置是否已存在加载去
			exsitAdjacentStartIndex = binary.tempObjectBinary(start - 1, loadRegion[type], 'start', 'end');
			exsitAdjacentEndIndex = binary.tempObjectBinary(end + 1, loadRegion[type], 'start', 'end');
			//原水平方向区间数组维护
			if (insertStartIndex !== insertEndIndex) {
				//插入点位于已存在区间内，插入点需扩大到区间边界
				if (exsitStartIndex !== -1) {
					start = loadRegion[type][exsitStartIndex].start;
				} else if (exsitAdjacentStartIndex !== -1) {
					start = loadRegion[type][exsitAdjacentStartIndex].start;
					insertStartIndex--;
				}
				if (exsitEndIndex !== -1) {
					end = loadRegion[type][exsitEndIndex].end;
				} else if (exsitAdjacentEndIndex !== -1) {
					end = loadRegion[type][exsitAdjacentEndIndex].end;
				}
				//需要删除原始数组中区间的数据长度
				len = insertEndIndex - insertStartIndex + 1;
				//right需要判断是否包含在区域内，包含，删除长度+1
				if (exsitEndIndex === -1 && exsitAdjacentEndIndex === -1) {
					len--;
				}
				loadRegion[type].splice(insertStartIndex, len, {
					start: start,
					end: end
				});
			} else {
				//插入区域已存在
				if (exsitStartIndex !== -1 && exsitEndIndex !== -1) {
					return;
				}
				if (exsitAdjacentStartIndex !== -1) {
					start = loadRegion[type][exsitAdjacentStartIndex].start;
					insertStartIndex = exsitAdjacentStartIndex;
					exsitStartIndex = exsitAdjacentStartIndex;
					len++;
				}
				if (exsitAdjacentEndIndex !== -1) {
					end = loadRegion[type][exsitAdjacentEndIndex].end;
					exsitEndIndex = exsitAdjacentEndIndex;
				}
				if (exsitStartIndex === -1 && exsitEndIndex !== -1) {
					len++;
				}
				loadRegion[type].splice(insertStartIndex, len, {
					start: start,
					end: end
				});
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
			var insertIndex,
				start,
				end,
				len, i;
			insertIndex = binary.tempObjectBinary(startPosi, loadRegion[type], 'start', 'end');
			len = loadRegion[type].length;
			end = loadRegion[type][insertIndex].end;
			loadRegion[type][insertIndex].end = end + value;
			for (i = insertIndex + 1; i < len; i++) {
				start = loadRegion[type][i].start;
				end = loadRegion[type][i].end;
				loadRegion[type][i].start = start + value;
				loadRegion[type][i].end = end + value;
			}
		},
		/**
		 * 清空记录值
		 */
		clearLoadRegion: function(loadRegion) {
			loadRegion.transverse = [];
			loadRegion.vertical = [];
		},
	};
});