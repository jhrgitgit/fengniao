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
	'../test/unit/row.spec'
], function() {
	window.onload();
});
