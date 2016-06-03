'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache');
	return {
		startHighlight: function() {
			Backbone.trigger('event:cellsContainer:startHighlight');
		},
		stopHighlight: function() {
			Backbone.trigger('event:cellsContainer:stopHighlight');
		},
		getHighlightDirection: function(){
			return cache.highlightDirection;
		}
	};
});