define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		binary = require('basic/util/binary'),
		selectRegions = require('collections/selectRegion'),
		siderLineRows = require('collections/siderLineRow'),
		siderLineCols = require('collections/siderLineCol'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		sendRegion;


	var selectCell = function(sheetId, region) {
		var startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex,
			operationRegion,
			headItemColList = headItemCols.models,
			headItemRowList = headItemRows.models,
			top = 0,
			left = 0,
			width = 0,
			height = 0,
			len, i;

		operationRegion = regionOperation.getRegionIndexByRegionLabel(region);
		if (operationRegion.startColIndex < 0 || operationRegion.startRowIndex < 0 || operationRegion.endColIndex < 0 || operationRegion.endRowIndex < 0) return;

		operationRegion = regionOperation.getFullSelectRegion(operationRegion.startColIndex, operationRegion.startRowIndex, operationRegion.endColIndex, operationRegion.endRowIndex);
		startColIndex = operationRegion.startColIndex;
		startRowIndex = operationRegion.startRowIndex;
		endColIndex = operationRegion.endColIndex;
		endRowIndex = operationRegion.endRowIndex;


		width = headItemColList[endColIndex].get('width') + headItemColList[endColIndex].get('left') - headItemColList[startColIndex].get('left');
		height = headItemRowList[endRowIndex].get('height') + headItemRowList[endRowIndex].get('top') - headItemRowList[startRowIndex].get('top');

		selectRegions.models[0].set({
			initPosi: {
				startX: startColIndex,
				startY: startRowIndex
			},
			mousePosi: {
				mouseX: endColIndex,
				mouseY: endRowIndex
			},
			physicsPosi: {
				top: headItemRowList[startRowIndex].get('top'),
				left: headItemColList[startColIndex].get('left')

			},
			physicsBox: {
				width: width - 1,
				height: height - 1
			},
			wholePosi: {
				startX: startColIndex,
				startY: startRowIndex,
				endX: endColIndex,
				endY: endRowIndex
			}
		});
		siderLineRows.models[0].set({
			top: headItemRowList[startRowIndex].get('top'),
			height: height - 1
		});
		siderLineCols.models[0].set({
			left: headItemColList[startColIndex].get('left'),
			width: width - 1

		});
		len = headItemRowList.length;

		for (i = 0; i < len; i++) {
			headItemRowList[i].set({
				activeState: false
			});
		}

		len = headItemColList.length;
		for (i = 0; i < len; i++) {
			headItemColList[i].set({
				activeState: false
			});
		}
		for (i = 0; i < endColIndex - startColIndex + 1; i++) {
			headItemColList[startColIndex + i].set({
				activeState: true
			});
		}
		for (i = 0; i < endRowIndex - startRowIndex + 1; i++) {
			headItemRowList[startRowIndex + i].set({
				activeState: true
			});
		}
	};
	return selectCell;
});