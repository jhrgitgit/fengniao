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
		regionOperation = require('entrance/regionoperation'),
		sendRegion;

	var selectCellCols = function(sheetId, displayName, index, e) {
		var modelIndexRow,
			headModelRow,
			headModelCol,
			headLineColModelList,
			headLineRowModelList,
			colDisplayNames=[],
			rowDisplayNames=[],
			left,
			top,
			width,
			height,
			point,
			len, i;

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

		if (e === undefined || e.isDefaultPrevented() === false) {
			len = headLineColModelList.length;
			width = headLineColModelList[len - 1].get('left') + headLineColModelList[len - 1].get('width');
			top = headModelRow.toJSON().top;
			height = headModelRow.toJSON().height;
			left = 0;

			colDisplayNames.push('A');
			colDisplayNames.push(headLineColModelList[len - 1].get('displayName'));
			rowDisplayNames.push(headLineRowModelList[modelIndexRow].get('displayName'));

			point = {
				col: colDisplayNames,
				row: rowDisplayNames
			};
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
					e={};
					e.point=point;
					listener.excute('dataSourceRegionChange', e);
					listener.excute('regionChange', e);
					listener.excute('mousedown', e);
				}
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

				//select region
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
					e={};
					e.point=point;
					listener.excute('selectRegionChange', e);
					listener.excute('regionChange', e);
					listener.excute('mousedown', e);
				}
			}

		}

	};
	return selectCellCols;
});