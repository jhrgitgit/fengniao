'use strict';
define(function(require) {


	var Backbone = require('lib/backbone'),
		headItemCols = require('collections/headItemCol');


	var setCellWidth = function(sheetId, colLable, width) {
		var index;
		index = headItemCols.getIndexByDisplayname(colLable);
		if (index > -1) {
			Backbone.trigger('event:colWidthAdjust', index, width);
		}
	};
	return setCellWidth;
});