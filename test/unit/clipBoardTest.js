define(function(require) {
	var selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		cache = require('basic/tools/cache');

	describe("剪切功能测试", function() {
		var spreadSheet;
		beforeEach(function() {
			var SpreadSheet;
			jasmine.getFixtures().fixturesPath = './';
			loadFixtures('excel.html');
			SpreadSheet = require('excel');
			spreadSheet = new SpreadSheet();
		});
		
		it("选择剪切区域测试", function() {
			var cutRegion,
				clipPasteOperate;
			clipSelectOperate = require('entrance/tool/clipselectoperate');

			spreadSheet.selectCell("1", ["B3", "F5"]);
			clipSelectOperate("cut");
			cutRegion = selectRegions.getModelByType("clip")[0];

			expect(cutRegion.get("wholePosi").startX).toEqual(1);
			expect(cutRegion.get("wholePosi").startY).toEqual(2);
			expect(cutRegion.get("wholePosi").endX).toEqual(5);
			expect(cutRegion.get("wholePosi").endY).toEqual(4);
		});
		it("剪切板数据进行复制测试", function() {
			var tempCell,
				cutRegion,
				clipPasteOperate;
			clipPasteOperate = require('entrance/tool/clippasteoperate');

			spreadSheet.selectCell("1", ["B3", "F5"]);
			clipPasteOperate("！1	中文		123\r\nen	&&**\r\n");

			tempCell = cells.getCellByAlias("2", "3");
			expect(tempCell.get("content").texts).toEqual("！1");
			tempCell = cells.getCellByAlias("3", "3");
			expect(tempCell.get("content").texts).toEqual("中文");
			tempCell = cells.getCellByAlias("2", "4");
			expect(tempCell.get("content").texts).toEqual("en");
			tempCell = cells.getCellByAlias("3", "4");
			expect(tempCell.get("content").texts).toEqual("&&**");
		});
		it("excel内部数据进行剪切测试", function() {
			var cutRegion,
				clipSelectOperate,
				clipPasteOperate;

			clipSelectOperate = require('entrance/tool/clipselectoperate');
			clipPasteOperate = require('entrance/tool/clippasteoperate');

			spreadSheet.selectCell("1", ["B3", "F5"]);
			clipPasteOperate("！1	中文		123\r\nen	&&**\r\n");
			clipSelectOperate("cut");
			spreadSheet.selectCell("1", "A1");
			clipPasteOperate();

			tempCell = cells.getCellByAlias("2", "3");
			expect(tempCell).toEqual(null);
			tempCell = cells.getCellByAlias("3", "3");
			expect(tempCell).toEqual(null);
			tempCell = cells.getCellByAlias("2", "4");
			expect(tempCell).toEqual(null);
			tempCell = cells.getCellByAlias("3", "4");
			expect(tempCell).toEqual(null);

			tempCell = cells.getCellByAlias("1", "1");
			expect(tempCell.get("content").texts).toEqual("！1");
			tempCell = cells.getCellByAlias("2", "1");
			expect(tempCell.get("content").texts).toEqual("中文");
			tempCell = cells.getCellByAlias("1", "2");
			expect(tempCell.get("content").texts).toEqual("en");
			tempCell = cells.getCellByAlias("2", "2");
			expect(tempCell.get("content").texts).toEqual("&&**");

		});

		afterEach(function() {
			var sreenView;
			Backbone.trigger('event:screenContainer:destroy');
			cache.clipState = 'null';
			cache.CellsPosition.strandX=[];
			cache.CellsPosition.strandY=[];
			cells.reset(null);
		});
	});
	window.onload();
});