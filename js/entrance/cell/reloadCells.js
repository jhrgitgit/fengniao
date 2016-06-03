'use strict';
define(function(require) {
	var Backbone = require('lib/backbone');

	function reloadCells() {
		Backbone.trigger('event:contentCellsContainer:reloadCells');
		Backbone.trigger('event:cellsContainer:adaptSelectRegion');
	}
	return reloadCells;
});