requirejs.config({
	baseUrl: '../js',
	paths: {
		"excel": "./spreadsheet/spreadsheet"
	}
});
requirejs([
	//'./lib/backbone',
	// '../test/unit/clipBoardTest',
	// '../test/unit/reloadCellTest',
	// '../test/unit/wordWrapTest',
	// '../test/unit/texttype.spec',
	// '../test/unit/commentspec',
	//'../test/unit/row.spec',
	//'../test/unit/rowoper.spec.js',
	'../test/unit/col.spec'
], function() {
	window.onload();
});
