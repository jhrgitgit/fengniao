'use strict';
define(function(require) {
	var cache = require('basic/tools/cache'),
		// addRowhandle = require('entrance/tool/addrow'),
		// headItemRows = require('collections/headItemRow'),
		// headItemCols = require('collections/headItemCol'),
		build = require('../util/build');

	describe("插入行功能测试", function() {
		// beforeEach(function() {
		// 	build.buildRow();
		// });
		// it("调整行集合测试", function() {
		// 	var insertModel,
		// 		nextModel,
		// 		lastModel;

		// 	nextModel = headItemRows.models[5];
		// 	addRowhandle._adaptHeadRowItem(5);
		// 	insertModel = headItemRows.models[5];
		// 	lastModel = headItemRows.models[headItemRows.length - 1];


		// 	expect(insertModel.get('alias')).toEqual('101');
		// 	expect(insertModel.get('sort')).toEqual(5);
		// 	expect(insertModel.get('top')).toEqual(120);
		// 	expect(insertModel.get('displayName')).toEqual('6');

		// 	expect(nextModel.get('sort')).toEqual(6);
		// 	expect(nextModel.get('top')).toEqual(140);
		// 	expect(nextModel.get('displayName')).toEqual('7');

		// 	expect(lastModel.get('sort')).toEqual(10);
		// 	expect(lastModel.get('top')).toEqual(220);
		// 	expect(lastModel.get('displayName')).toEqual('11');

		// });
		// afterEach(function() {
		// 	build.destroyRow();
		// 	build.destroyCol();
		// 	cache.aliasRowCounter = '100';
		// });
	});
});