define(function(require) {
	var $ = require('lib/jquery'),
		Cell = require('models/cell'),
		SelectRegion = require('models/selectRegion'),
		SelectRegionContainer = require('views/selectRegion'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache'),
		CellContainer = require('views/CellContainer');

	// describe("单元格视图显示批注功能测试", function() {
	// 	var cellContainer;
	// 	beforeEach(function() {
	// 		var cell;
	// 		headItemRows.add({
	// 			'alias': '1'
	// 		});
	// 		headItemCols.add({
	// 			'alias': '1'
	// 		});
	// 		cell = new Cell();
	// 		cell.set('occupy', {
	// 			x: ['1'],
	// 			y: ['1']
	// 		})
	// 		cell.set('customProp.comment', '批注内容');
	// 		$('body').append('<script type="text/x-handlebars-template" id="tempItemCell"><div class="bg" style="display:table-cell">{{cotent.texts}}</div></script>');
	// 		$('body').append('<script type="text/x-handlebars-template" id="comment"><div></div></script>');
	// 		cellContainer = new CellContainer({
	// 			model: cell
	// 		});
	// 		selectRegion = new SelectRegion();
	// 		selectRegions.add(selectRegion);

	// 		$('body').append('<div class="cellsContainer"><div class="contentContainer"></div></div>');
	// 		$('.contentContainer').append(cellContainer.render().el);
	// 	});
	// 	// 延时处理，不能进行测试
	// 	// it("显示备注视图", function() {
	// 	// });
	// 	it("新建备注视图", function() {
	// 		cellContainer.newCommentView();
	// 		expect($('.comment').length).toEqual(1);
	// 		expect($('.comment').val()).toEqual('批注内容');
	// 		expect($('.comment').css('top')).toEqual('0px');
	// 		expect($('.comment').css('left')).toEqual('74px');
	// 	});
	// 	it("销毁备注视图", function() {
	// 		cellContainer.newCommentView();
	// 		expect($('.comment').length).toEqual(1);
	// 		cellContainer.hideComment();
	// 		expect($('.comment').length).toEqual(0);
	// 	});
	// 	afterEach(function() {
	// 		headItemRows.reset();
	// 		headItemCols.reset();
	// 		cellContainer.remove();
	// 		selectRegions.reset();
	// 		$('.cellsContainer').remove();
	// 		$("#tempItemCell").remove();
	// 		$("#comment").remove();
	// 	});
	// });
	// describe("选中区域显示备注视图", function() {
	// 	var selectRegionContainer,
	// 		cell;
	// 	beforeEach(function() {
	// 		var selectRegion;
	// 		headItemRows.add({
	// 			'alias': '1'
	// 		});
	// 		headItemCols.add({
	// 			'alias': '1'
	// 		});
	// 		cell = new Cell();
	// 		cell.set('occupy', {
	// 			x: ['1'],
	// 			y: ['1']
	// 		})
	// 		cell.set('customProp.comment', '批注内容');
	// 		cells.add(cell);
	// 		cache.CellsPosition.strandX['1'] = {};
	// 		cache.CellsPosition.strandX['1']['1'] = 0;
	// 		cache.CellsPosition.strandY['1'] = {};
	// 		cache.CellsPosition.strandY['1']['1'] = 0;
	// 		selectRegion = new SelectRegion();
	// 		selectRegions.add(selectRegion);
	// 		selectRegionContainer = new SelectRegionContainer({
	// 			model: selectRegion
	// 		});
	// 		$('body').append('<script type="text/x-handlebars-template" id="tempSelectContainer"><div class="box"><div class="expand"></div><div class="bg"></div></div></script>');
	// 		$('body').append('<script type="text/x-handlebars-template" id="comment"><div></div></script>');
	// 		$('body').append('<div class="cellsContainer"></div>');
	// 		$('.cellsContainer').append(selectRegionContainer.render().el);
	// 	});

	// 	it("显示鼠标覆盖单元格批注视图", function() {
	// 		var conmentView;
	// 		selectRegionContainer.createCommentContainer(cell, 'show');
	// 		conmentView = selectRegionContainer.commentView;
	// 		expect(conmentView.$el.val()).toEqual('批注内容');
	// 	});
	// 	it("已存在视图,显示鼠标覆盖单元格批注视图", function() {
	// 		var conmentView;
	// 		selectRegionContainer.createCommentContainer(cell, 'show');
	// 		selectRegionContainer.createCommentContainer(cell, 'show');
	// 		conmentView = selectRegionContainer.commentView;
	// 		expect(conmentView.$el.val()).toEqual('批注内容');
	// 	});

	// 	it("建立选中区域新建批注视图", function() {
	// 		var conmentView;
	// 		selectRegionContainer.createCommentContainer(undefined, 'add');
	// 		conmentView = selectRegionContainer.commentView;
	// 		expect(conmentView.$el.val()).toEqual('');
	// 	});
	// 	it("建立选中区域编辑批注视图", function() {
	// 		var conmentView;
	// 		selectRegionContainer.createCommentContainer(undefined, 'edit');
	// 		conmentView = selectRegionContainer.commentView;
	// 		expect(conmentView.$el.val()).toEqual('批注内容');
	// 	});

	// 	afterEach(function() {
	// 		selectRegionContainer.remove();
	// 		headItemRows.reset();
	// 		headItemCols.reset();
	// 		cells.reset();
	// 		selectRegions.reset();
	// 		cell.destroy();
	// 		$(".cellsContainer").remove();
	// 		$("#tempSelectContainer").remove();
	// 		$("#comment").remove();
	// 	});
	// });
	describe("冻结状态，选中视图，显示备注视图测试", function() {
		var selectRegionContainer,
			cell;
		beforeEach(function() {
			var selectRegion;
			headItemRows.add({
				'alias': '1'
			});
			headItemRows.add({
				'alias': '2'
			});
			headItemCols.add({
				'alias': '1'
			});
			headItemCols.add({
				'alias': '2'
			});
			cell = new Cell();
			cell.set('occupy', {
				x: ['2'],
				y: ['2']
			})
			cell.set('customProp.comment', '批注内容');
			cells.add(cell);
			cache.CellsPosition.strandX['2'] = {};
			cache.CellsPosition.strandX['2']['2'] = 0;
			cache.CellsPosition.strandY['2'] = {};
			cache.CellsPosition.strandY['2']['2'] = 0;
			cache.TempProp.isFrozen = true;

			selectRegion = new SelectRegion();
			selectRegion.set('wholePosi.startX', 1);
			selectRegion.set('wholePosi.startY', 1);
			selectRegion.set('wholePosi.endX', 1);
			selectRegion.set('wholePosi.endY', 1);
			selectRegions.add(selectRegion);
			selectRegionContainer = new SelectRegionContainer({
				model: selectRegion,
				currentRule: {
					UserView: {
						rowAlias: '1',
						colAlias: '1'
					},
					displayPosition: {
						offsetLeft: 0,
						offsetTop: 0
					}
				}
			});
			$('body').append('<script type="text/x-handlebars-template" id="tempSelectContainer"><div class="box"><div class="expand"></div><div class="bg"></div></div></script>');
			$('body').append('<script type="text/x-handlebars-template" id="comment"><div></div></script>');
			$('body').append('<div class="cellsContainer"></div>');
			$('.cellsContainer').append(selectRegionContainer.render().el);
		});

		it("显示鼠标覆盖单元格批注视图", function() {
			var conmentView;
			selectRegionContainer.createCommentContainer(cell, 'show');
			conmentView = selectRegionContainer.commentView;
			expect(conmentView.$el.val()).toEqual('批注内容');
		});
		it("已存在视图,显示鼠标覆盖单元格批注视图", function() {
			var conmentView;
			selectRegionContainer.createCommentContainer(cell, 'show');
			selectRegionContainer.createCommentContainer(cell, 'show');
			conmentView = selectRegionContainer.commentView;
			expect(conmentView.$el.val()).toEqual('批注内容');
		});

		it("建立选中区域新建批注视图", function() {
			var conmentView;
			selectRegionContainer.createCommentContainer(undefined, 'add');
			conmentView = selectRegionContainer.commentView;
			expect(conmentView.$el.val()).toEqual('');
		});
		it("建立选中区域编辑批注视图", function() {
			var conmentView;
			selectRegionContainer.createCommentContainer(undefined, 'edit');
			conmentView = selectRegionContainer.commentView;
			expect(conmentView.$el.val()).toEqual('批注内容');
		});

		afterEach(function() {
			selectRegionContainer.remove();
			headItemRows.reset();
			headItemCols.reset();
			cells.reset();
			selectRegions.reset();
			cell.destroy();
			$(".cellsContainer").remove();
			$("#tempSelectContainer").remove();
			$("#comment").remove();
		});
	});
});