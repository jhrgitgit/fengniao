define(function(require) {
	var selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache');

	describe("重新加载cell数据测试", function() {
		var spreadSheet;

		beforeEach(function() {
			var SpreadSheet;
			jasmine.getFixtures().fixturesPath = './';
			loadFixtures('excel.html');
			SpreadSheet = require('excel');
			spreadSheet = new SpreadSheet();

			Mock.mock(
				"http://localhost:4711/excel.htm?m=openExcel", {
					returndata: {
						spreadSheet: [{
							sheet: {
								cells: [{
									occupy: {
										x: ['2'],
										y: ['1']
									}
								}]
							}
						}]
					}
				}
			);
			cells.add({
				occupy: {
					x: ['1'],
					y: ['1']
				}
			});
			cache.cachePosition('1', '1', 0);
			cells.add({
				occupy: {
					x: ['2'],
					y: ['1']
				}
			});
			cache.cachePosition('2', '1', 1);
		});

		it("", function() {
			spreadSheet.reloadCells();
			expect(cells.length).toEqual(1);
		});

		afterEach(function() {
			var sreenView;
			Backbone.trigger('event:screenContainer:destroy');
			cache.CellsPosition.strandX = [];
			cache.CellsPosition.strandY = [];
			cells.reset(null);
		});
		window.onload();
	});
});