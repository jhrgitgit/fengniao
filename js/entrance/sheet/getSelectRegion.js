define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		getSelectRegion;

	/**
	 * 获取选中区域信息
	 * @param  {string} sheetId sheetId
	 * @return {object} 
	 */
	getSelectRegion = function(sheetId) {
		var result = {},
			cols = [],
			rows = [],
			selectRegion,
			startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex, i;

		selectRegion = selectRegions.findWhere({
			'selectType': 'operation'
		});
		startColIndex = selectRegion.get('wholePosi').startX;
		startRowIndex = selectRegion.get('wholePosi').startY;
		endColIndex = selectRegion.get('wholePosi').endX;
		endRowIndex = selectRegion.get('wholePosi').endY;
		for (i = startColIndex; i < endColIndex + 1; i++) {
			cols.push(headItemCols.models[i].get('displayName'));
		}
		for (i = startRowIndex; i < endRowIndex + 1; i++) {
			rows.push(headItemRows.models[i].get('displayName'));
		}
		result.col = cols;
		result.row = rows;
		return result;
	};
	return getSelectRegion;
});