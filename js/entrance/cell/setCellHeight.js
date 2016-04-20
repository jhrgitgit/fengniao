define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion'),
		common = require('entrance/regionoperation'),
		sendRegion;


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