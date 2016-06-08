'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
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