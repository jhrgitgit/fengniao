//在文本在定宽情况下，高度是否计算正确
//行高自动更新
define(function(require) {
	var getTextBox = require("basic/tools/gettextbox"),
		selectRegions = require('collections/selectRegion'),
		Cell = require ("models/cell"),
		cells = require('collections/cells'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache');

	describe("自动换行功能测试", function() {
		beforeEach(function() {
			var SpreadSheet;
			jasmine.getFixtures().fixturesPath = './';
			loadFixtures('excel.html');
			SpreadSheet = require('excel');
			spreadSheet = new SpreadSheet();
		});
		it("校验计算文本显示高度", function() {
			var text,
				fontsize,
				width;
			text = "1111111111111111111111111111111111";
			fontsize = "1pt";
			width = 72;
			expect(14).toEqual(getTextBox.getTextHeight(text, false, fontsize, width));
			expect(42).toEqual(getTextBox.getTextHeight(text, true, fontsize, width));
			fontsize = "36pt";
			expect(55).toEqual(getTextBox.getTextHeight(text, false, fontsize, width));
			expect(660).toEqual(getTextBox.getTextHeight(text, true, fontsize, width));
		});
		it("校验是否能自动修改wordWrap属性", function() {
			//插入cell
			//创建inputcontainer
			//输入内容
			//获取
		});
		afterEach(function() {
			Backbone.trigger('event:screenContainer:destroy');
			cache.CellsPosition.strandX = [];
			cache.CellsPosition.strandY = [];
			cells.reset(null);
		});
	});
	window.onload();
});