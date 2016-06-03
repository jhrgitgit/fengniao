'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		listener = require('basic/util/listener'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		siderLineCols = require('collections/siderLineCol'),
		siderLineRows = require('collections/siderLineRow');

	/**
	 * 整行选中
	 * @param  {string} sheetId     sheetId
	 * @param  {string} displayName 行标识名称
	 * @param  {[type]} index       行索引值
	 */
	var selectCellCols = function(sheetId, displayName, index) {
		var modelIndexRow,
			headModelRow,
			headLineColModelList,
			headLineRowModelList,
			colDisplayNames = [],
			rowDisplayNames = [],
			rowAlias,
			colAlias,
			left,
			top,
			width,
			height,
			point,
			len, i,
			e={};

		if (displayName !== null) {
			modelIndexRow = headItemRows.getIndexByDisplayname(displayName);
		} else {
			modelIndexRow = index;
		}
		//headColModels,headRowModels list
		headLineRowModelList = headItemRows.models;
		headLineColModelList = headItemCols.models;
		//this model index of headline
		//head model information
		headModelRow = headLineRowModelList[modelIndexRow];

		len = headLineColModelList.length;
		width = headLineColModelList[len - 1].get('left') + headLineColModelList[len - 1].get('width');
		top = headModelRow.toJSON().top;
		height = headModelRow.toJSON().height;
		left = 0;
		//ps:开放参数问题
		colDisplayNames.push('A');
		colDisplayNames.push(headLineColModelList[len - 1].get('displayName'));
		rowDisplayNames.push(headLineRowModelList[modelIndexRow].get('displayName'));

		e.point = {
			col: colDisplayNames,
			row: rowDisplayNames
		};
		listener.excute('regionChange', e);
		if (cache.setDataSource === true) {
			if (selectRegions.getModelByType('dataSource')[0] === undefined) {
				Backbone.trigger('event:cellsContainer:createDataSourceRegion', {});
			}
			selectRegions.getModelByType('dataSource')[0].set({
				physicsPosi: {
					left: left,
					top: top
				},
				physicsBox: {
					width: width,
					height: height
				}
			});
			e.point = point;
			listener.excute('dataSourceRegionChange', e);
			listener.excute('regionChange', e);
		} else {
			len = headLineRowModelList.length;
			for (i = 0; i < len; i++) {
				if (i === modelIndexRow) {
					headLineRowModelList[i].set({
						activeState: true
					});
					continue;
				}
				headLineRowModelList[i].set({
					activeState: false
				});
			}
			len = headLineColModelList.length;
			for (i = 0; i < len; i++) {
				headLineColModelList[i].set({
					activeState: true
				});
			}
			rowAlias = headModelRow.get('alias');
			colAlias = headLineColModelList[0].get('alias');
			//select region
			selectRegions.models[0].set({
				physicsPosi: {
					left: left,
					top: top
				},
				physicsBox: {
					width: width,
					height: height
				},
				wholePosi: {
					startX: colAlias,
					startY: rowAlias,
					endX: 'max',
					endY: rowAlias
				}
			});
			//siderline effect
			siderLineCols.models[0].set({
				left: left,
				width: width
			});
			siderLineRows.models[0].set({
				top: top,
				height: height
			});
		}
	};
	return selectCellCols;
});