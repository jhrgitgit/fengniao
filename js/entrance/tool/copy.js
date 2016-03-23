define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion'),
		copy;

	copy = function(e) {
		var tempCellModel,
			selectRegion,
			startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex,
			colAlias,
			rowAlias,
			text = "",
			i,
			j;
		Backbone.trigger('event:cellsContainer:addClipRegion');
		cache.clipState = "copy";
		selectRegion = selectRegions.getModelByType("operation")[0];

		startColIndex = selectRegion.get("wholePosi").startX;
		startRowIndex = selectRegion.get("wholePosi").startY;
		endColIndex = selectRegion.get("wholePosi").endX;
		endRowIndex = selectRegion.get("wholePosi").endY;

		for (i = startRowIndex; i < endRowIndex + 1; i++) {
			for (j = startColIndex; j < endColIndex + 1; j++) {
				colAlias = headItemCols.models[j].get('alias');
				rowAlias = headItemRows.models[i].get('alias');
				tempCellModel = cells.getCellByAlias(colAlias, rowAlias);
				if (tempCellModel !== null) {
					text += cellToText(tempCellModel);
				}
				if (j !== endColIndex) {
					text += "\t";
				} else {
					text += "\r\n";
				}
			}
		}
		if (e !== undefined) {
			e.preventDefault();
			if (window.clipboardData) {
				window.clipboardData.setData("Text", text);
			} else {
				e.originalEvent.clipboardData.setData("Text", text);
			}
		}

		function cellToText(cell) {
			var text,
				head = '',
				tail = '';
			text = cell.get("content").texts;

			if (text.indexOf('\n') === -1) {
				return text;
			}
			while (true) {
				if (text.indexOf('"') === 0) {
					text = text.substring(1);
					head += '""';
				} else {
					break;
				}
			}
			while (true) {
				if (text.lastIndexOf('"') === text.length - 1 && text.length > 1) {
					text = text.substring(0, text.length - 1);
					tail += '""';
				} else {
					break;
				}
			}
			text = head + text + tail;
			return text;
		}
	};
	return copy;
});