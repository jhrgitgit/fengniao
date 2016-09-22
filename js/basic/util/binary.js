'use strict';
define(function() {
	/**
	 * 二分查询工具类
	 * @author ray wu
	 * @class binary
	 * @module basic
	 * @main  binary
	 */
	return {
		/**
		 * @method modelBinary
		 * @deprecated 找个二分查询存在性能瓶颈，使用`newModelBinary`
		 */
		modelBinary: function(value, array, strandAttr, rangeAttr, startIndex, endIndex) {
			var middle,
				start = startIndex ? startIndex : 0,
				end,
				findValue = Math.floor(value),
				strandAttrByArray,
				rangeAttrByArray,
				middleArray;
			if (endIndex === undefined) {
				end = array.length - 1;
			} else {
				end = endIndex;
			}

			if (start <= end) {
				if (array[start].get(strandAttr) === findValue) {
					return start;
				}
				if (array[end].get(strandAttr) === findValue) {
					return end;
				}
				middle = end + start >>> 1;
				middleArray = array[middle];
				strandAttrByArray = middleArray.get(strandAttr);
				rangeAttrByArray = middleArray.get(rangeAttr);
				if (strandAttrByArray <= findValue && strandAttrByArray + rangeAttrByArray >= findValue) {
					return middle;
				} else if (strandAttrByArray > findValue) {
					return this.modelBinary(findValue, array, strandAttr, rangeAttr, start, middle - 1);
				} else if (strandAttrByArray + rangeAttrByArray < findValue) {
					return this.modelBinary(findValue, array, strandAttr, rangeAttr, middle + 1, end);
				}
			}
			return -1;
		},
		/**
		 * 两个属性之间查询 二分查询(backbone模型对象使用)
		 * @method newModelBinary
		 * @param  {int}       value       想查询的数据值
		 * @param  {array}       array     查询的list集合
		 * @param  {string}       strandAttr 起始属性
		 * @param  {string}       rangeAttr  结束属性
		 * @param  {int}       startIndex 起始索引
		 * @param  {int}       endIndex   结束索引
		 * @return {int} `array`中的索引值
		 */
		newModelBinary: function(value, array, strandAttr, rangeAttr, startIndex, endIndex) {
			var middle,
				start = startIndex ? startIndex : 0,
				end = endIndex ? endIndex : array.length,
				findValue = Math.floor(value),
				strandAttrByArray,
				rangeAttrByArray,
				middleArray;
			while (start < end) {
				middle = end + start >>> 1;
				middleArray = array[middle];
				strandAttrByArray = middleArray.get(strandAttr);
				rangeAttrByArray = middleArray.get(rangeAttr);
				if (strandAttrByArray + rangeAttrByArray < findValue) {
					start = middle + 1;
				} else {
					end = middle;
				}
			}
			return start;
		},
		/**
		 * 两个属性之间查询（未查询到，返回-1,普通对象数组使用）
		 * @method newModelBinary
		 * @param  {int}       value       想查询的数据值
		 * @param  {array}       array     查询的list集合
		 * @param  {string}       strandAttr 起始属性
		 * @param  {string}       endAttr  结束值
		 * @param  {int}       startIndex 起始索引
		 * @param  {int}       endIndex   结束索引
		 * @return {int} `array`中的索引值
		 */
		tempObjectBinary: function(value, array, startAttr, endAttr, startIndex, endIndex) {
			var middle,
				start = startIndex ? startIndex : 0,
				end = endIndex ? endIndex : array.length - 1,
				findValue = Math.floor(value),
				startAttrValue,
				endAttrValue,
				middleArray;
			while (start <= end) {
				middle = end + start >>> 1;
				middleArray = array[middle];
				startAttrValue = middleArray[startAttr];
				endAttrValue = middleArray[endAttr];
				if (startAttrValue <= findValue && findValue <= endAttrValue) {
					return middle;
				}
				if (end === start) {
					return -1;
				}
				if (value < startAttrValue) {
					end = middle - 1;
				} else {
					start = middle + 1;
				}
			}
			return -1;
		},
		/**
		 * 不连续的区域内，插入一个元素时，返回元素的位置
		 * @param  {[type]} value      [description]
		 * @param  {[type]} array      [description]
		 * @param  {[type]} startAttr  [description]
		 * @param  {[type]} endAttr    [description]
		 * @param  {[type]} startIndex [description]
		 * @param  {[type]} endIndex   [description]
		 * @return {[type]}            [description]
		 */
		tempInsertObjectBinary: function(value, array, startAttr, endAttr, startIndex, endIndex) {
			var middle,
				start,
				end,
				findValue = Math.floor(value);

			start = startIndex || 0;
			end = endIndex || array.length - 1;
			while (start < end) {
				if (array[start][endAttr] >= findValue) {
					return start;
				}
				if (array[end][startAttr] <= findValue || array[end][endAttr] >= findValue) {
					return end;
				}
				if (array[end][endAttr] < findValue) {
					return end + 1;
				}
				middle = end + start >>> 1;
				if (array[middle][end] < findValue) {
					start = middle + 1;
				} else {
					end = middle;
				}
			}
			return start;
		},

		/**
		 * 二分查询（用于插入元素，确定元素位置使用）
		 * @method newModelBinary
		 * @param  {int}       value       想查询的数据值
		 * @param  {array}       array     查询的list集合
		 * @param  {string}       strandAttr 起始属性
		 * @param  {string}       rangeAttr  结束属性
		 * @param  {int}       startIndex 起始索引
		 * @param  {int}       endIndex   结束索引
		 * @return {int} `array`中的索引值
		 */
		indexModelBinary: function(value, array, strandAttr, rangeAttr, startIndex, endIndex) {
			if (array.length === 0) {
				return 0;
			}
			var middle,
				start = startIndex ? startIndex : 0,
				end = endIndex ? endIndex : array.length - 1,
				findValue = Math.floor(value),
				strandAttrByArray,
				rangeAttrByArray,
				middleArray;
			if (array.length === 1) {
				return (array[0].get(strandAttr) + array[0].get(rangeAttr) >= findValue) ? 0 : 1;
			}
			while (start < end) {
				if (array[start].get(strandAttr) + array[start].get(rangeAttr) >= findValue) {
					return start;
				}
				if (array[end].get(strandAttr) + array[end].get(rangeAttr) === findValue) {
					return end;
				}
				if (array[end].get(strandAttr) + array[end].get(rangeAttr) < findValue) {
					return end + 1;
				}
				middle = end + start >>> 1;
				middleArray = array[middle];
				strandAttrByArray = middleArray.get(strandAttr);
				rangeAttrByArray = middleArray.get(rangeAttr);
				if (strandAttrByArray + rangeAttrByArray < findValue) {
					start = middle + 1;
				} else {
					end = middle;
				}
			}
			return start;
		},
		//待删除
		existArrayBinary: function(value, array, startAttr, endAttr, startIndex, endIndex) {
			var middle,
				start = startIndex ? startIndex : 0,
				end = endIndex ? endIndex : array.length - 1,
				findValue = Math.floor(value);
			if (array.length === 0) {
				return false;
			}
			if (array.length === 1) {
				if (array[0][endAttr] >= findValue && array[0][startAttr] <= findValue) {
					return true;
				} else {
					return false;
				}
			}
			while (start < end) {
				if (array[start][startAttr] <= findValue && array[start][endAttr] >= findValue) {
					return true;
				}
				if (array[end][startAttr] <= findValue && array[end][endAttr] >= findValue) {
					return true;
				}
				middle = end + start >>> 1;
				if (array[end][startAttr] <= findValue && array[end][endAttr] >= findValue) {
					return true;
				} else if (array[middle][endAttr] < findValue) {
					start = middle + 1;
				} else {
					end = middle;
				}
			}
			return false;
		},
		//待删除
		indexArrayBinary: function(value, array, startAttr, endAttr, startIndex, endIndex) {
			var middle,
				start = startIndex ? startIndex : 0,
				end = endIndex ? endIndex : array.length - 1,
				findValue = Math.floor(value);
			if (array.length === 0) {
				return 0;
			}
			if (array.length === 1) {
				if (array[start][endAttr] < findValue) {
					return 1;
				} else {
					return 0;
				}
			}
			while (start < end) {
				if (array[start][startAttr] >= findValue) {
					return start;
				}
				if (array[end][endAttr] < findValue) {
					return end + 1;
				}

				middle = end + start >>> 1;

				if (array[middle][startAttr] <= findValue && array[middle][endAttr] >= findValue) {
					return middle;
				} else if (array[middle][endAttr] < findValue) {
					start = middle + 1;
				} else {
					end = middle;
				}
			}
			return start;
		},
		/**
		 * 二分查询，暂时查询sort值使用
		 */
		indexAttrBinary: function(value, array, attr, startIndex, endIndex) {
			var middleIndex;

			startIndex = startIndex || 0;
			endIndex = endIndex || array.length - 1;
			if (array[startIndex].get(attr) > value) {
				return -1;
			}
			if (array[endIndex].get(attr) < value) {
				return -1;
			}
			while (startIndex < endIndex) {
				if (array[startIndex].get(attr) === value) {
					return startIndex;
				}
				if (array[endIndex].get(attr) === value) {
					return endIndex;
				}
				middleIndex = endIndex + startIndex >>> 1;
				if (array[middleIndex].get(attr) === value) {
					return middleIndex;
				} else if (array[middleIndex].get(attr) < value) {
					startIndex = middleIndex + 1;
				} else {
					endIndex = middleIndex;
				}
			}
			return -1;
		}
	};

});