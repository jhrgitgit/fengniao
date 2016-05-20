define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		listener = require('basic/util/listener'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		siderLineCols = require('collections/siderLineCol'),
		siderLineRows = require('collections/siderLineRow'),
		sendRegion;

	var selectCellRows = function(sheetId, displayName, index, e) {
		var modelIndexCol,
			modelCell,
			headModelRow,
			headModelCol,
			headLineColModelList,
			headLineRowModelList,
			colDisplayNames = [],
			rowDisplayNames = [],
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

		if (e === undefined || e.isDefaultPrevented() === false) {
			if (cache.setDataSource === true) {

				if (selectRegions.getModelByType("dataSource")[0] === undefined) {
					Backbone.trigger('event:cellsContainer:createDataSourceRegion', {});
				}
				selectRegions.getModelByType("dataSource")[0].set({
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
				//selectregion effect
				selectRegions.models[0].set({
					physicsPosi: {
						left: left,
						top: top
					},
					physicsBox: {
						width: width,
						height: height
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

		}
	};
	return selectCellRows;
});