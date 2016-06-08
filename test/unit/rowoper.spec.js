'use strict';
define(function(require) {
	var cache = require('basic/tools/cache'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		buildColAlias = require('basic/tools/buildcolalias'),
		cells = require('collections/cells'),
		rowOper = require('entrance/row/rowoperation');
	describe("行属性测试", function() {
		beforeEach(function() {
			var i = 0,
				len = 10;
			for (; i < len; i++) {
				headItemRows.add({
					sort: i,
					alias: (i + 1).toString(),
					top: i * 20,
					displayName: (i + 1).toString()
				});
			}
			i = 0;
			for (; i < len; i++) {
				headItemCols.add({
					sort: i,
					alias: (i + 1).toString(),
					top: i * 72,
					displayName: buildColAlias(i)
				});
			}
			cache.loadStartColAlias = '1';
			cache.loadEndColAlias = '10';
		});
		it('设置属性测试', function() {
			var headModel;
			headModel = headItemRows.models[3];
			rowOper.rowPropOper(3, 'content.color', 'rgb(89, 89, 89)');
			expect(headModel.get('operProp')).toEqual({
				content: {
					color: 'rgb(89, 89, 89)'
				}
			});
			rowOper.rowPropOper(3, 'content.color', 'rgb(0, 0, 0)');
			expect(headModel.get('operProp')).toEqual({});
		});
		afterEach(function() {
			headItemRows.reset();
			headItemRows.reset();
			cells.reset();
		});
	});
	describe("单元格创建测试", function() {
		beforeEach(function() {
			var i = 0,
				len = 10;
			for (; i < len; i++) {
				headItemRows.add({
					sort: i,
					alias: (i + 1).toString(),
					top: i * 20,
					displayName: (i + 1).toString()
				});
			}
			i = 0;
			for (; i < len; i++) {
				headItemCols.add({
					sort: i,
					alias: (i + 1).toString(),
					top: i * 72,
					displayName: buildColAlias(i)
				});
			}
			cells.add({
				occupy: {
					x: ['1'],
					y: ['2']
				}
			});
			cells.add({
				occupy: {
					x: ['2'],
					y: ['2', '3', '4']
				}
			});
			cells.add({
				occupy: {
					x: ['3', '4', '5'],
					y: ['2']
				}
			});
			cache.cachePosition('2', '1', 0);
			cache.cachePosition('2', '2', 1);
			cache.cachePosition('3', '2', 1);
			cache.cachePosition('4', '2', 1);
			cache.cachePosition('2', '3', 2);
			cache.cachePosition('2', '4', 2);
			cache.cachePosition('2', '5', 2);
			cache.loadStartColAlias = '1';
			cache.loadEndColAlias = '10';
		});
		it('设置属性测试', function() {
			rowOper.rowPropOper(1, 'content.color', 'rgb(89, 89, 89)');
			expect(cells.length).toEqual(8);
			for (var i = 0; i < 8; i++) {
				if (i === 1) {
					expect(cells.models[i].get('content').color).toEqual('rgb(0, 0, 0)');
				} else {
					expect(cells.models[i].get('content').color).toEqual('rgb(89, 89, 89)');
				}

			}
		});
		afterEach(function() {
			headItemRows.reset();
			headItemRows.reset();
			cells.reset();
		});
	});
});