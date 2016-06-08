'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
		headItemRows = require('collections/headItemRow');


	var setCellHeight = function(sheetId, rowLabel, height) {
		var index;
		index = headItemRows.getIndexByDisplayname(rowLabel);
		if (index > -1) {
			// adjustHeight = height - headItemRows.models[index].get('height');
			Backbone.trigger('event:rowHeightAdjust', index, height);
		}

	};
	return setCellHeight;
});