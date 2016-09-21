'use strict';
define(function(require) {
	var Cell = require('models/cell'),
		cache = require('basic/tools/cache'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		cells = require('collections/cells');
	return {
		/**
		 * 整行设置单元格属性
		 * @param  {number} index 行索引
		 * @param  {string} prop  需要修改属性,二级属性设置,例:'content.size'
		 * @param  {string} value 修改值
		 */
		rowPropOper: function(index, prop, value) {
			var parentProp,
				childProp,
				headRowModel,
				headRowProp,
				defaultProp,
				startColAlias,
				endColAlias,
				startColIndex,
				endColIndex,
				rowAlias,
				colAlias,
				cellList,
				cell,
				currentStrandX,
				props,
				len, i;

			props = prop.split('.');
			if (props.length > 1) {
				childProp = props[1];
			}
			parentProp = props[0];

			//维护行对象operProp属性
			headRowModel = headItemRows.models[index];
			headRowProp = headRowModel.get('operProp');
			defaultProp = (new Cell()).toJSON();

			if (headRowProp[parentProp] !== undefined &&
				headRowProp[parentProp][childProp] !== undefined) {
				if (defaultProp[parentProp][childProp] === value) {
					delete headRowProp[parentProp][childProp];
					if (!Object.getOwnPropertyNames(headRowProp[parentProp]).length) {
						delete headRowProp[parentProp];
					}
				} else {
					headRowProp[parentProp][childProp] = value;
				}
			} else {
				if (defaultProp[parentProp][childProp] !== value) {
					if (!headRowProp[parentProp]) {
						headRowProp[parentProp] = {};
					}
					headRowProp[parentProp][childProp] = value;
				}
			}
			headRowModel.set('operProp', headRowProp);
			cellList = cells.getCellByRow(index, 0, index, headItemCols.length - 1);
			len = cellList.length;
			i = 0;
			for (; i < len; i++) {
				if (cellList[i].get('occupy').y.length === 1) {
					cellList[i].set(prop, value);
				}
			}
			//在加载区域内，填充创建单元格，并设置属性
			//暂时取所有值，完成横向动态加载时需要修改
			// startColAlias = cache.loadStartColAlias;
			// endColAlias = cache.loadEndColAlias;

			// startColIndex = headItemCols.getIndexByAlias(startColAlias);
			// endColIndex = headItemCols.getIndexByAlias(endColAlias);

			startColIndex = 0;
			endColIndex = headItemCols.length - 1;

			i = startColIndex;
			currentStrandX = cache.CellsPosition.strandX;
			for (; i < endColIndex + 1; i++) {
				rowAlias = headItemRows.models[index].get('alias');
				colAlias = headItemCols.models[i].get('alias');
				if (currentStrandX[colAlias] === undefined ||
					currentStrandX[colAlias][rowAlias] === undefined) {
					//创建单元格
					cell = new Cell();
					cell.set('occupy', {
						x: [colAlias],
						y: [rowAlias]
					});
					cell.set('physicsBox', {
						top: headItemRows.models[index].get('top'),
						left: headItemCols.models[i].get('left'),
						width: headItemCols.models[i].get('width'),
						height: headItemRows.models[index].get('height')
					});
					cell.set(prop, value);
					cache.cachePosition(rowAlias, colAlias, cells.length);
					cells.add(cell);
				}
			}
		},
		/**
		 * 自增加列，自动填充整行操作效果单元格
		 * @param  {int} startIndex 起始列索引
		 * @param  {int} endIndex   结束列索引
		 */
		generateCol: function(startIndex, endIndex) {
			var len = headItemRows.length,
				headItemRowList = headItemRows.models,
				headItemColList = headItemCols.models,
				occupyCol = cache.CellsPosition.strandX,
				rowOperProp,
				rowAlias,
				colAlias,
				i, j;

			for (i = 0; i < len; i++) {
				rowOperProp = headItemRowList[i].get('operProp');
				if (!isEmptyObject(rowOperProp)) {
					for (j = startIndex; j < endIndex + 1; j++) {
						colAlias = headItemRowList[j].get('alias');
						rowAlias = headItemColList[i].get('alias');
						if (occupyCol[colAlias] === undefined || occupyCol[colAlias][rowAlias] === undefined) {
							cells.createCellModel(j, i, rowOperProp);
						}
					}
				}
			}
			function isEmptyObject(obj) {
				var name;
				for (name in obj) {
					return false;
				}
				return true;
			}
		}
	};
});