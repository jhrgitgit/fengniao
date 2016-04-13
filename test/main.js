requirejs.config({
	baseUrl: '../../js',
	paths: {
		"excel": "./spreadsheet/spreadsheet",
		"mock": "../test/lib/mock"
	}
});
requirejs(['./lib/backbone',
	'../test/unit/clipBoardTest',
	'../test/unit/reloadCellTest'], function() {
});