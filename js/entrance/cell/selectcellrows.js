'use strict';
define(function(require) {
	var cache = require('basic/tools/cache'),
		config = require('spreadsheet/config'),
		listener = require('basic/util/listener'),
		selectRegions = require('collections/selectRegion'),
		SelectRegionModel = require('models/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		siderLineCols = require('collections/siderLineCol'),
		siderLineRows = require('collections/siderLineRow');

	var selectCellRows = function(sheetId, displayName, index, e) {
		var modelIndexCol,
			headModelCol,
			headLineColModelList,
			headLineRowModelList,
			colDisplayNames = [],
			rowDisplayNames = [],
			dataSourceRegion,
			rowAlias,
			colAlias,
			select,
			left,
			top,
			width,
			height,
			point,
			len, i;

		if (displayName !== null) {
			modelIndexCol = headItemCols.getIndexByDisplayname(displayName);
		} else {
			modelIndexCol = index;
		}
		//headColModels,headRowModels list
		headLineRowModelList = headItemRows.models;
		headLineColModelList = headItemCols.models;
		//this model index of headline
		//head model information
		headModelCol = headLineColModelList[modelIndexCol];

		len = headLineRowModelList.length;
		left = headModelCol.toJSON().left;
		top = 0;
		width = headModelCol.toJSON().width;
		height = headLineRowModelList[len - 1].get('top') + headLineRowModelList[len - 1].get('height');

		rowDisplayNames.push('1');
		rowDisplayNames.push(headLineRowModelList[len - 1].get('displayName'));
		colDisplayNames.push(headLineColModelList[modelIndexCol].get('displayName'));

		point = {
			col: colDisplayNames,
			row: rowDisplayNames
		};

		if (cache.mouseOperateState === config.mouseOperateState.dataSource) {
			dataSourceRegion = selectRegions.getModelByType('dataSource')[0];
			if (dataSourceRegion === undefined) {
				dataSourceRegion = new SelectRegionModel();
				dataSourceRegion.set('selectType', 'dataSource');
				selectRegions.add(dataSourceRegion);
			}
			dataSourceRegion.set({
				physicsPosi: {
					left: left,
					top: top
				},
				physicsBox: {
					width: width,
					height: height
				}
			});
			if (e !== undefined) {
				e = {};
				e.point = point;
				listener.excute('dataSourceRegionChange', e);
				listener.excute('regionChange', e);
				listener.excute('mousedown', e);
			}
		} else {
			select = selectRegions.getModelByType('operation')[0];
			for (i = 0; i < len; i++) {
				headLineRowModelList[i].set({
					activeState: true
				});
			}
			len = headLineColModelList.length;
			for (i = 0; i < len; i++) {
				if (i === modelIndexCol) {
					headLineColModelList[i].set({
						activeState: true
					});
					continue;
				}
				headLineColModelList[i].set({
					activeState: false
				});
			}
			rowAlias = headLineRowModelList[0].get('alias');
			colAlias = headLineColModelList[modelIndexCol].get('alias');
			//selectregion effect
			select.set({
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
					endX: colAlias,
					endY: 'MAX'
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
			if (e !== undefined) {
				e = {};
				e.point = point;
				listener.excute('selectRegionChange', e);
				listener.excute('regionChange', e);
				listener.excute('mousedown', e);
			}
		}
	};
	return selectCellRows;
});