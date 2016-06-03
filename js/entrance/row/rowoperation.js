'use strict';
define(function(require) {
	var Cell = require('models/cell'),
		headItemRows = require('collections/headitemrow'),
		headItemCols = require('collections/headitemcol'),
		cells = require('collections/cells');
	return {
		rowMerge: function() {

		},
		rowSplit: function() {

		},
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
				headColModel,
				headRowProp,
				defaultProp,
				startColAlias,
				endRowAlias,
				startColIndex,
				endColIndex,
				cellList;

			prop = prop.split('.');
			if (prop.length > 1) {
				childProp = prop[1];
			}
			parentProp = prop[0];

			//维护行对象operProp属性
			headRowModel = headItemRows.models[0];
			headRowProp = headRowModel.get('operProp');
			defaultProp = (new Cell()).toJSON();

			if (headRowProp[parentProp] !== undefined &&
				headRowProp[parentProp][childProp] !== undefined) {
				if (defaultProp[parentProp][childProp] === value) {
					delete headRowProp[parentProp][childProp];
					if (!Object.getOwnPropertyNames(defaultProp[parentProp]).length) {
						delete defaultProp[parentProp];
					}
				} else {
					headRowProp[parentProp][childProp] = headRowProp[parentProp][childProp];
				}
			} else {
				if (defaultProp[parentProp][childProp] !== value) {
					if (!headRowProp[parentProp]) {
						headRowProp[parentProp] = {};
					}
					headRowProp[parentProp][childProp] = headRowProp[parentProp][childProp];
				}
			}
			headRowModel.set('operProp', headRowProp);
			//修改行上已存在单元格集合
			cellList = cells.getCellByRow(index, 0, index, headItemCols.length - 1);
			//判断设置值与默认值是否相等

			//相等删除row中属性

			//不相等

			//新建加载域内单元格
		},
	};
});