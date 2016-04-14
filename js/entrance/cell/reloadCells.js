define(function(require) {
	'use strict';
	var cells = require('collections/cells'),
		cache = require('basic/tools/cache');

	function reloadCells() {
		Backbone.trigger('event:contentCellsContainer:reloadCells');
		Backbone.trigger('event:cellsContainer:adaptSelectRegion');
	}
	return reloadCells;
});