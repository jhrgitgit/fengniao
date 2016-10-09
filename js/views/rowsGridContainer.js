define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		binary = require('basic/util/binary'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		GridLineRowContainer = require('views/gridLineRowContainer');

	/**
	 * RowsGridContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class RowsGridContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var RowsGridContainer = Backbone.View.extend({
		/**
		 * @property {element} className
		 */
		className: 'row-container',
		/**
		 * 初始化事件监听
		 * @method initialize
		 */
		initialize: function(option) {
			// _.bindAll(this, 'callScreenContainer');
			/**
			 * 已经加载行数
			 * @property {int} rowNumber
			 */
			this.rowNumber = 0;
			this.currentRule = cache.CurrentRule;
			if (cache.TempProp.isFrozen !== true || this.currentRule.displayPosition.endRowIndex === undefined) {
				this.listenTo(headItemRows, 'add', this.addGridLineRow);
				//动态加载，还原删除的列视图
				Backbone.on('event:restoreRowView', this.restoreGridLineRowView, this);
			}
			Backbone.on('call:rowsGridContainer', this.rowsGridContainer, this);
		},
		rowsGridContainer: function(receiveFunc) {
			receiveFunc(this);
		},
		/**
		 * 渲染本身对象
		 * @method render
		 * @return {object} 返回自身对象`this`
		 */
		render: function() {
			var i = 0,
				gridLineRowList,
				gridLineRowRegionList,
				len;
			gridLineRowList = gridLineRowRegionList = headItemRows.models;
			if (cache.TempProp.isFrozen) {
				if (this.currentRule.displayPosition.endRowIndex !== undefined) {
					gridLineRowRegionList = gridLineRowList.slice(this.currentRule.displayPosition.startRowIndex, this.currentRule.displayPosition.endRowIndex);
				} else {
					gridLineRowRegionList = gridLineRowList.slice(this.currentRule.displayPosition.startRowIndex);
				}
			}
			len = gridLineRowRegionList.length;
			for (; i < len; i++) {
				if (!gridLineRowRegionList[i].get('hidden')) {
					this.addGridLineRow(gridLineRowRegionList[i]);
					this.rowNumber++;
				}
			}
			return this;
		},
		/**
		 * 重新加载因动态加载删除的视图
		 * @param  {[type]} region [description]
		 */
		restoreGridLineRowView: function(region) {
			var headItemRowList = headItemRows.models,
				startPosi = region.start,
				endPosi = region.end,
				startIndex,
				endIndex,
				i, len;
			startIndex = binary.newModelBinary(startPosi, headItemRowList, 'top', 'height');
			endIndex = binary.newModelBinary(endPosi, headItemRowList, 'top', 'height');
			for (i = startIndex; i < endIndex + 1; i++) {
				if (!headItemRowList[i].get('isView')) {
					this.addGridLineRow(headItemRowList[i]);
				}
			}
		},
		/**
		 * 渲染view，增加行在`grid`区域内
		 * @method addGridLineRow
		 * @param  {object} modelGridLineRow 行model对象
		 */
		addGridLineRow: function(modelGridLineRow) {
			//处理冻结状态
			var gridLineRow = new GridLineRowContainer({
				model: modelGridLineRow,
				frozenTop: this.currentRule.displayPosition.offsetTop,
				endIndex: this.currentRule.displayPosition.endRowIndex
			});
			this.$el.append(gridLineRow.render().el);
		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			Backbone.off('event:restoreRowView');
			Backbone.off('call:rowsGridContainer');
			this.remove();
		}
	});
	return RowsGridContainer;
});