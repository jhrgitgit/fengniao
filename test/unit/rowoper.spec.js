'use strict';
define(function(require) {
	var cache = require('basic/tools/cache'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		buildColAlias = require('basic/tools/buildcolalias'),
		rowOper = require('/entrance/row/rowoperation');
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
		it('设置属性测试',function(){
			var headModel;
			headModel = headItemRows.models[3];
			rowOper.rowPropOper(3,'content.color','rgb(89, 89, 89)');
			expect(headModel.get('operProp')).toEqual({content:{color:'rgb(89, 89, 89)'}});
			rowOper.rowPropOper(3,'content.color','rgb(0,0,0)');
			expect(headModel.get('operProp')).toEqual({content:{color:'rgb(0,0,0)'}});
		});
	});
	describe("单元格创建测试", function() {

	});
});