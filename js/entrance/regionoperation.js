define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		binary = require('basic/util/binary'),
		Cell = require('models/cell'),
		headItemRow = require('collections/headItemRow'),
		headItemCol = require('collections/headItemCol'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion');


	var common = {
		getRegionIndexByRegionLabel: function(regionLabel) {
			var region = {},
				startColIndex,
				startRowIndex,
				endColIndex,
				endRowIndex;
			if (regionLabel instanceof Array) {
				region.startColIndex = headItemCol.getIndexByDisplayname(getDisplayName(regionLabel[0],'col'));
				region.startRowIndex = headItemRow.getIndexByDisplayname(getDisplayName(regionLabel[0],'row'));

				region.endColIndex = headItemCol.getIndexByDisplayname(getDisplayName(regionLabel[1],'col'));
				region.endRowIndex = headItemRow.getIndexByDisplayname(getDisplayName(regionLabel[1],'row'));
			} else {
				region.startColIndex = region.endColIndex = headItemCol.getIndexByDisplayname(getDisplayName(regionLabel,'col'));
				region.startRowIndex = region.endRowIndex = headItemRow.getIndexByDisplayname(getDisplayName(regionLabel,'row'));
			}
			return region;

			function getDisplayName(regionLabel, lineType) {
				var result = '',
					len = 0;
				if(/[A-Z]/i.test(regionLabel)){
					len = regionLabel.match(/[A-Z]/ig).length;
				}
				if (lineType === 'col') {
					result = regionLabel.substring(0, len);
				} else if (lineType === 'row') {
					result = regionLabel.substring(len);
				}
				return result;
			}
		},
		getFullSelectRegion: function(startColIndex, startRowIndex, endColIndex, endRowIndex) {
			var headItemRowList = headItemRows.models,
				headItemColList = headItemCols.models,
				tempCellList,
				cellstartColIndex,
				cellstartRowIndex,
				cellendColIndex,
				cellendRowIndex,
				cache, region,
				flag = true,
				i = 0;

			if (startColIndex > endColIndex) {
				cache = startColIndex;
				startColIndex = endColIndex;
				endColIndex = cache;
			}
			if (startRowIndex > endRowIndex) {
				cache = startRowIndex;
				startRowIndex = endRowIndex;
				endRowIndex = cache;
			}
			while (flag) {
				flag = false;
				tempCellList = cells.getCellByX(startColIndex, startRowIndex, endColIndex, endRowIndex);
				for (; i < tempCellList.length; i++) {
					cellstartRowIndex = binary.modelBinary(tempCellList[i].get('physicsBox').top, headItemRowList, 'top', 'height', 0, headItemRowList.length - 1);
					cellstartColIndex = binary.modelBinary(tempCellList[i].get('physicsBox').left, headItemColList, 'left', 'width', 0, headItemColList.length - 1);
					cellendRowIndex = binary.modelBinary(tempCellList[i].get('physicsBox').top + tempCellList[i].get('physicsBox').height, headItemRowList, 'top', 'height', 0, headItemRowList.length - 1);
					cellendColIndex = binary.modelBinary(tempCellList[i].get('physicsBox').left + tempCellList[i].get('physicsBox').width, headItemColList, 'left', 'width', 0, headItemColList.length - 1);
					if (cellstartColIndex < startColIndex) {
						startColIndex = cellstartColIndex;
						flag = true;
						break;
					}
					if (cellstartRowIndex < startRowIndex) {
						startRowIndex = cellstartRowIndex;
						flag = true;
						break;
					}
					if (cellendRowIndex > endRowIndex) {
						endRowIndex = cellendRowIndex;
						flag = true;
						break;
					}
					if (cellendColIndex > endColIndex) {
						endColIndex = cellendColIndex;
						flag = true;
						break;
					}
				}
			}
			region = {
				startRowIndex: startRowIndex,
				startColIndex: startColIndex,
				endRowIndex: endRowIndex,
				endColIndex: endColIndex
			};
			return region;
		},
		regionOperation: function(sheetId, regionLabel, callback) {
			var region = {},
				resultRegion,
				regionCellsList,
				headLineColModelList,
				headLineRowModelList,
				colLen,
				rowLen,
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				cellList,
				currentCell,
				i, j, h = 0;
			if (regionLabel !== null && regionLabel !== undefined) {
				region = this.getRegionIndexByRegionLabel(regionLabel);
				region = this.getFullSelectRegion(region.startColIndex, region.startRowIndex, region.endColIndex, region.endRowIndex);
			} else {
				region.startColIndex = selectRegions.models[0].get('wholePosi').startX;
				region.startRowIndex = selectRegions.models[0].get('wholePosi').startY;
				region.endColIndex = selectRegions.models[0].get('wholePosi').endX;
				region.endRowIndex = selectRegions.models[0].get('wholePosi').endY;
			}

			startRowIndex = region.startRowIndex;
			startColIndex = region.startColIndex;
			endColIndex = region.endColIndex;
			endRowIndex = region.endRowIndex;
			cellList = cells.getRegionCells(startColIndex, startRowIndex, endColIndex, endRowIndex);
			for (i = startRowIndex; i < endRowIndex + 1; i++) {
				for (j = startColIndex; j < endColIndex + 1; j++) {
					currentCell = cellList[h];
					if (currentCell === null) {
						currentCell = this.createCell(i, j);
					}
					callback(currentCell);
					h++;
				}
			}
			resultRegion = {
				startColIndex: startColIndex,
				startRowIndex: startRowIndex,
				endColIndex: endColIndex,
				endRowIndex: endRowIndex
			};
			return region;
		},
		cellListOperation: function(sheetId, cellList, callback) {
			var len, i = 0;
			len = cellList.length;
			for (; i < len; i++) {
				callback(cellList[i]);
			}
		},
		createCell: function(indexRow, indexCol) {
			var cacheCell,
				aliasCol,
				aliasRow,
				gridLineColList,
				gridLineRowList;

			gridLineColList = headItemCols.models;
			gridLineRowList = headItemRows.models;
			aliasCol = gridLineColList[indexCol].get('alias');
			aliasRow = gridLineRowList[indexRow].get('alias');
			var top, left, width, height;
			top = gridLineRowList[indexRow].get('top');
			left = gridLineColList[indexCol].get('left');
			width = gridLineColList[indexCol].get('width');
			height = gridLineRowList[indexRow].get('height');
			cacheCell = new Cell();
			cacheCell.set('occupy', {
				x: [aliasCol],
				y: [aliasRow]
			});
			cacheCell.set('physicsBox', {
				top: top,
				left: left,
				width: width,
				height: height
			});
			cache.cachePosition(aliasRow, aliasCol, cells.length);
			cells.add(cacheCell);
			return cacheCell;
		}
	};
	return common;

});