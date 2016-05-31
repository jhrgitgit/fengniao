define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		getPointByPosi;

	getPointByPosi = function(sheetId, mouseColPosi, mouseRowPosi) {
		var result = {};
		var getResult = function() {
			return function(callback) {
				result.point = callback;
			};
		};
		Backbone.trigger('event:cellsContainer:getCoordinate', getResult(), mouseColPosi, mouseRowPosi);
		if (result.point === undefined) {
			result.point = {
				col: '',
				row: ''
			};
			return result;
		} else {
			return result;
		}
	};
	return getPointByPosi;
});