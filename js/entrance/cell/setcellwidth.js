define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		sendRegion;


	var setCellWidth = function(sheetId, colLable, width) {
		var index;
		index = headItemCols.getIndexByDisplayname(colLable);
		if (index > -1) {
			Backbone.trigger('event:colWidthAdjust', index, width);
		}
	};
	return setCellWidth;
});