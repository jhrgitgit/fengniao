'use strict';
define(function(require) {

	var headItemRows = require('collections/headItemRow'),
		setCellHeight;


	setCellHeight = function(sheetId, rowLabel, height) {
		var index;
		index = headItemRows.getIndexByDisplayname(rowLabel);
		if (index > -1) {
			headItemRows.models[index].set('height', height);
		}
	};
	return setCellHeight;
});