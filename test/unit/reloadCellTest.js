define(function(require) {
	var selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache'),
		mock = require('mock');
	mock.mock('http://192.168.1.250:8080/acmrexcel-0.1.5/excel.htm?m=openExcel', {
		returndata: {
			spreadSheet: [{
				sheet: {
					cells: [{
						occupy: {
							x: ['1'],
							y: ['1']
						}
					}]
				}
			}]
		}
	});
	describe("重新加载cell数据测试", function() {
		var spreadSheet;

		beforeEach(function() {
			var SpreadSheet;
			jasmine.getFixtures().fixturesPath = './';
			loadFixtures('excel.html');
			SpreadSheet = require('excel');
			spreadSheet = new SpreadSheet();


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
			cells.add({
				occupy: {
					x: ['1'],
					y: ['2']
				}
			});
			cache.cachePosition('1', '2', 2);
			cells.add({
				occupy: {
					x: ['2'],
					y: ['2']
				}
			});
			cache.cachePosition('2', '2', 3);
			cells.add({
				occupy: {
					x: ['3'],
					y: ['3']
				}
			});
			cache.cachePosition('2', '2', 4);
		});

		it("判断原有对象是否清空", function() {
			spreadSheet.reloadCells();
			expect(cells.length).toEqual(0);
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