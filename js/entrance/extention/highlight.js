define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone');
	return {
		startHighlight: function() {
			Backbone.trigger('event:cellsContainer:startHighlight');
		},
		stopHighlight: function() {
			Backbone.trigger('event:cellsContainer:stopHighlight');
		}
	};
});