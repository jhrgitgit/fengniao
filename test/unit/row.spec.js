'use strict';
define(function(require) {
	var cache = require('basic/tools/cache'),
		addRowhandle = require('entrance/tool/addrow'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		selectRegions = require('collections/selectRegion'),
		siderLineRows = require('collections/siderLineRow'),
		cells = require('collections/cells'),
		build = require('../util/build');

	describe("插入行功能测试", function() {
		beforeEach(function() {
			build.buildRow();
			siderLineRows.add({
				top: 0,
				height: 17
			});
		});
		it("调整行集合测试", function() {
			var insertModel,
				nextModel,
				lastModel;

			nextModel = headItemRows.models[5];
			addRowhandle._adaptHeadRowItem(5);

			insertModel = headItemRows.models[5];
			lastModel = headItemRows.models[headItemRows.length - 1];


			expect(insertModel.get('alias')).toEqual('101');
			expect(insertModel.get('sort')).toEqual(5);
			expect(insertModel.get('top')).toEqual(100);
			expect(insertModel.get('displayName')).toEqual('6');

			expect(nextModel.get('sort')).toEqual(6);
			expect(nextModel.get('top')).toEqual(120);
			expect(nextModel.get('displayName')).toEqual('7');

			expect(lastModel.get('sort')).toEqual(10);
			expect(lastModel.get('top')).toEqual(200);
			expect(lastModel.get('displayName')).toEqual('11');

		});
		it("调整选中区域测试", function() {
			var select;

			selectRegions.add({
				physicsPosi: {
					top: 40,
					left: 72,
				},
				physicsBox: {
					width: 68,
					height: 76
				},
				wholePosi: {
					startX: '2',
					startY: '3',
					endX: '2',
					endY: '6'
				}
			});
			select = selectRegions.getModelByType('operation')[0];

			addRowhandle._adaptSelectRegion(5);
			expect(select.get('physicsPosi').top).toEqual(40);
			expect(select.get('physicsPosi').left).toEqual(72);
			expect(select.get('physicsBox').width).toEqual(68);
			expect(select.get('physicsBox').height).toEqual(96);
			expect(select.get('wholePosi').startX).toEqual('2');
			expect(select.get('wholePosi').startY).toEqual('3');
			expect(select.get('wholePosi').endX).toEqual('2');
			expect(select.get('wholePosi').endY).toEqual('6');

			addRowhandle._adaptSelectRegion(1);
			expect(select.get('physicsPosi').top).toEqual(60);
			expect(select.get('physicsPosi').left).toEqual(72);
			expect(select.get('physicsBox').width).toEqual(68);
			expect(select.get('physicsBox').height).toEqual(96);
			expect(select.get('wholePosi').startX).toEqual('2');
			expect(select.get('wholePosi').startY).toEqual('3');
			expect(select.get('wholePosi').endX).toEqual('2');
			expect(select.get('wholePosi').endY).toEqual('6');

			addRowhandle._adaptSelectRegion(9);
			expect(select.get('physicsPosi').top).toEqual(60);
			expect(select.get('physicsPosi').left).toEqual(72);
			expect(select.get('physicsBox').width).toEqual(68);
			expect(select.get('physicsBox').height).toEqual(96);
			expect(select.get('wholePosi').startX).toEqual('2');
			expect(select.get('wholePosi').startY).toEqual('3');
			expect(select.get('wholePosi').endX).toEqual('2');
			expect(select.get('wholePosi').endY).toEqual('6');

		});

		it("调选单元格测试", function() {
			var cell1,
				cell2,
				cell3;

			cells.add({
				physicsBox: {
					top: 19,
					left: -1,
					height: 19,
					width: 71
				},
				occupy: {
					x: ['1'],
					y: ['2']
				},
			});
			cells.add({
				physicsBox: {
					top: 19,
					left: 71,
					height: 59,
					width: 71
				},
				occupy: {
					x: ['2'],
					y: ['2', '3', '4']
				},
			});
			cells.add({
				physicsBox: {
					top: 79,
					left: 143,
					height: 19,
					width: 71
				},
				occupy: {
					x: ['3'],
					y: ['5']
				},
			});
			cache.cachePosition('2', '1', 0);
			cache.cachePosition('2', '2', 1);
			cache.cachePosition('3', '2', 1);
			cache.cachePosition('4', '2', 1);
			cache.cachePosition('5', '3', 2);

			addRowhandle._adaptHeadRowItem(2);
			addRowhandle._adaptCells(2);

			cell1 = cells.models[0];
			cell2 = cells.models[1];
			cell3 = cells.models[2];

			expect(cell1.get('physicsBox').top).toEqual(19);
			expect(cell1.get('physicsBox').left).toEqual(-1);
			expect(cell1.get('physicsBox').height).toEqual(19);
			expect(cell1.get('physicsBox').width).toEqual(71);
			expect(cell1.get('occupy')).toEqual({
				x: ['1'],
				y: ['2']
			});

			expect(cell2.get('physicsBox').top).toEqual(19);
			expect(cell2.get('physicsBox').left).toEqual(71);
			expect(cell2.get('physicsBox').height).toEqual(79);
			expect(cell2.get('physicsBox').width).toEqual(71);
			expect(cell2.get('occupy')).toEqual({
				x: ['2'],
				y: ['2', '101', '3', '4']
			});

			expect(cell3.get('physicsBox').top).toEqual(99);
			expect(cell3.get('physicsBox').left).toEqual(143);
			expect(cell3.get('physicsBox').height).toEqual(19);
			expect(cell3.get('physicsBox').width).toEqual(71);
			expect(cell3.get('occupy')).toEqual({
				x: ['3'],
				y: ['5']
			});

		});
		it("插入行接口测试", function() {
			var insertModel;
			cache.TempProp = {
				isFrozen: true,
				colAlias: '3',
				rowAlias: '3',
				rowFrozen: true,
				colFrozen: true
			}
			addRowhandle.addRow('1', '6');
			insertModel=headItemRows.models[5];
			expect(insertModel.get('alias')).toEqual('101');
			expect(insertModel.get('sort')).toEqual(5);
			expect(insertModel.get('top')).toEqual(100);
			expect(insertModel.get('displayName')).toEqual('6');

			selectRegions.add({
				physicsPosi: {
					top: 40,
					left: 72,
				},
				physicsBox: {
					width: 68,
					height: 76
				},
				wholePosi: {
					startX: '2',
					startY: '3',
					endX: '2',
					endY: '6'
				}
			});
			addRowhandle.addRow();
			insertModel=headItemRows.models[2];
			expect(insertModel.get('alias')).toEqual('102');
			expect(insertModel.get('sort')).toEqual(2);
			expect(insertModel.get('top')).toEqual(40);
			expect(insertModel.get('displayName')).toEqual('3');

		});
		afterEach(function() {
			build.destroyRow();
			build.destroyCol();
			cells.reset();
			cache.CellsPosition.strandX={};
			cache.CellsPosition.strandY={};
			cache.aliasRowCounter = '100';
		});
	});
});