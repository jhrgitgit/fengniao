define(function(require) {
	'use strict';

	var Backbone = require('lib/backbone');
	var adaptScreen = function(sheetId) {
		Backbone.trigger('call:screenContainer:adaptScreen');
	};
	return adaptScreen;
});