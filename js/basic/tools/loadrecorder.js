define(function(require) {
	'use strict';
	var binary = require('basic/util/binary');

	return {
		insertPosi: function(startPosi, endPosi, region) {
			var startIndex,
				endIndex,
				startExist,
				endExist,
				newStartPosi,
				newEndPosi,
				i, len;
			startIndex = binary.indexArrayBinary(startPosi, region, 'start', 'end');
			endIndex = binary.indexArrayBinary(endPosi, region, 'start', 'end');
			startExist = binary.existArrayBinary(startPosi, region, 'start', 'end');
			endExist = binary.existArrayBinary(endPosi, region, 'start', 'end');

			newStartPosi = startExist === false ? startPosi : region[startIndex].start;
			newEndPosi = endExist === false ? endPosi : region[endIndex].end;

			if (startIndex === endIndex) {
				if (startExist === true && endExist === true) return;
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
				endIndex,
				startExist,
				endExist,
				newStartPosi,
				newEndPosi,
				i, len;
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
		}
	};
});