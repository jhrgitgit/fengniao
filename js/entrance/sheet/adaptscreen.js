	'use strict';
	define(function(require) {



		var Backbone = require('lib/backbone'),
			adaptScreen;
		adaptScreen = function(sheetId) {
			Backbone.trigger('call:screenContainer:adaptScreen');
		};
		return adaptScreen;
	});