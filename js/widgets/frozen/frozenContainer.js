define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		setFrozen = require('entrance/sheet/setFrozen');

	/**
	 * 冻结功能视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class frozenContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var frozenContainer = Backbone.View.extend({
		/**
		 * @property {string} el 绑定视图
		 */
		el: "#frozen",
		/**
		 * @property {object} events 监听事件
		 */
		events: {
			'mousedown li': 'transAction'
		},
		/**
		 * 初始化函数
		 * @method initialize
		 */
		initialize: function() {
			Backbone.on('event:frozenContainer:changeState', this.changeState, this);
			this.unfrozenBtn = $('li[data-frozen="unfrozen"]', this.$el);
			this.customBtn = $('li[data-frozen="custom"]', this.$el);
			this.changeState();
		},
		/**
		 * 渲染本身对象
		 * @method render
		 */
		render: function() {},
		/**
		 * 改变冻结状态
		 * @method changeState
		 */
		changeState: function() {
			if (cache.TempProp.isFrozen) {
				this.unfrozenBtn.show();
				this.customBtn.hide();
			} else {
				this.unfrozenBtn.hide();
				this.customBtn.show();
			}
		},
		/**
		 * 监听冻结操作
		 * @method transAction
		 */
		transAction: function(e) {
			var frozenPositon = $(e.currentTarget).data('frozen');
			setFrozen('1', frozenPositon);
			this.changeState();
		},
		/**
		 * 过滤超出用户可视区域操作
		 * @method filterOutUserView
		 */
		filterOutUserView: function() {
			var headItemRowList = headItemRows.models,
				headItemColList = headItemCols.models,
				firstSelectRegionModel = selectRegions.models[0],
				splitColAlias = headItemColList[firstSelectRegionModel.get('initPosi').startX].get('alias'),
				splitRowAlias = headItemRowList[firstSelectRegionModel.get('initPosi').startY].get('alias'),
				splitColIndex = headItemCols.getIndexByAlias(splitColAlias),
				splitRowIndex = headItemRows.getIndexByAlias(splitRowAlias),
				userViewColIndex = headItemCols.getIndexByAlias(cache.UserView.colAlias),
				userViewRowIndex = headItemRows.getIndexByAlias(cache.UserView.rowAlias),
				userViewEndColIndex = headItemCols.getIndexByAlias(cache.UserView.colEndAlias),
				userViewEndRowIndex = headItemRows.getIndexByAlias(cache.UserView.rowEndAlias);
			//初始化，未进行滚动
			if (userViewRowIndex === userViewEndRowIndex) {
				return false;
			} else if (splitColIndex < userViewColIndex || splitRowIndex < userViewRowIndex || splitColIndex > userViewEndColIndex || splitRowIndex > userViewEndRowIndex) {
				return true;
			} else {
				return false;
			}
		},
		/**
		 * 执行自定义冻结
		 * @method setCustom
		 */
		setCustom: function() {
			if (this.filterOutUserView()) {
				return;
			}
			var headItemRowList = headItemRows.models,
				headItemColList = headItemCols.models,
				firstSelectRegionModel = selectRegions.models[0],
				splitColAlias = headItemColList[firstSelectRegionModel.get('initPosi').startX].get('alias'),
				splitRowAlias = headItemRowList[firstSelectRegionModel.get('initPosi').startY].get('alias'),
				splitColIndex = headItemCols.getIndexByAlias(splitColAlias),
				splitRowIndex = headItemRows.getIndexByAlias(splitRowAlias);

			cache.TempProp = {
				isFrozen: true,
				colAlias: splitColAlias,
				rowAlias: splitRowAlias,
				rowFrozen: true,
				colFrozen: true
			};

			this.requestFrozen(splitColAlias, splitRowAlias, cache.UserView.colAlias, cache.UserView.rowAlias);
		},
		/**
		 * 执行列冻结
		 * @method setCustom
		 */
		setCol: function() {
			var neighborModel = headItemCols.getNeighborModelByAlias(cache.UserView.colAlias, 'RIGHT');
			cache.TempProp = {
				isFrozen: true,
				colAlias: neighborModel.get('alias'),
				rowAlias: '1',
				colFrozen: true
			};
			cache.UserView.rowAlias = '1';
			this.requestFrozen(neighborModel.get('alias'), '1', cache.UserView.colAlias, cache.UserView.rowAlias);
		},
		/**
		 * 执行行冻结
		 * @method setCustom
		 */
		setRow: function() {
			var neighborModel = headItemRows.getNeighborModelByAlias(cache.UserView.rowAlias, 'RIGHT');
			cache.TempProp = {
				isFrozen: true,
				colAlias: '1',
				rowAlias: neighborModel.get('alias'),
				rowFrozen: true
			};

			cache.UserView.colAlias = '1';
			this.requestFrozen('1', neighborModel.get('alias'), cache.UserView.colAlias, cache.UserView.rowAlias);
		},
		/**
		 * 解除冻结
		 * @method setUnfrozen
		 */
		setUnfrozen: function() {
			cache.TempProp = {
				isFrozen: false,
				colAlias: '1',
				rowAlias: '1'
			};
			this.requestUnfrozen();
		},
		/**
		 * 绑定其他视图使用
		 * @method callView
		 */
		callView: function(name) {
			var self = this;
			return function(callback) {
				self[name] = callback;
			};
		},
		/**
		 * 向后台请求冻结操作
		 * @method requestFrozen
		 */
		requestFrozen: function(frozenColAlias, frozenRowAlias, startColAlias, startRowAlias) {
			var excelId = SPREADSHEET_AUTHENTIC_KEY,
				sheetId = $("#sheetId").val();
			send.PackAjax({
				url: 'sheet.htm?m=frozen&excelId=' + excelId + '&sheetId=' + sheetId + '&frozenX=' + frozenColAlias + '&frozenY=' + frozenRowAlias + '&startX=' + startColAlias + '&startY=' + startRowAlias,
				success: function(data) {
					console.log('success');
				}
			});
		},
		/**
		 * 向后台请求解除冻操作
		 * @method requestUnfrozen
		 */
		requestUnfrozen: function() {
			var excelId = window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId = $("#sheetId").val();
			send.PackAjax({
				url: 'sheet.htm?m=unFrozen&excelId=' + excelId + '&sheetId=' + sheetId,
				success: function(data) {

				}
			});
		}
	});
	return frozenContainer;
});