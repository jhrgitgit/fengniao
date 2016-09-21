'use strict';
define(function(require) {
	var Backbone = require('lib/backbone');

	function reloadCells() {
		//待修改：使用对象实现
		Backbone.trigger('event:contentCellsContainer:reloadCells');
		//待修改:使用选中区集合，实现自适应
		Backbone.trigger('event:cellsContainer:adaptSelectRegion');
	}
	return reloadCells;
});