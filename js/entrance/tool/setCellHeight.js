define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion'),
		setCellHeight;

		
	setCellHeight = function(sheetId, rowLabel, height) {
		var index,
			adjustHeight;
		index = headItemRows.getIndexByDisplayname(rowLabel);
		if (index > -1) {
			headItemRows.models[index].set('height',height);
		}
	};
	return setCellHeight;
});