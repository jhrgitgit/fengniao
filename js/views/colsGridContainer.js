//attention bug , bettwen this.number has mixed and user configure file. isn't exist worth

define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		config = require('spreadsheet/config'),
		binary = require('basic/util/binary'),
		cache = require('basic/tools/cache'),
		headItemCols = require('collections/headItemCol'),
		buildAlias = require('basic/tools/buildalias'),
		GridLineColContainer = require('views/gridLineColContainer'),
		ColsGridContainer;

	/**
	 * ColsGridContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class ColsGridContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	ColsGridContainer = Backbone.View.extend({
		/**
		 * @property {element} el
		 * @default div
		 */
		className: 'col-container',
		/**
		 * 初始化事件监听
		 * @method initialize
		 */
		initialize: function(option) {
			/**
			 * 已经加载列数
			 * @property {int} colNumber
			 * @default 0
			 */
			this.colNumber = 0;
			Backbone.on('event:restoreHideCols', this.restoreHideCols, this);
			this.currentRule = cache.CurrentRule;
			if (cache.TempProp.isFrozen === false || this.currentRule.displayPosition.endColIndex === undefined) {
				this.listenTo(headItemCols, 'add', this.addGridLineCol);
				//动态加载，还原删除的列视图
				Backbone.on('event:restoreColView', this.restoreGridLineColView, this);
			}
		},
		/**
		 * 渲染本身对象
		 * @method render
		 * @return {object} 返回自身对象`this`
		 */
		render: function() {
			var i = 0,
				gridLineColList,
				gridLineColRegionList,
				len;
			gridLineColList = gridLineColRegionList = headItemCols.models;
			if (cache.TempProp.isFrozen) {
				if (this.currentRule.displayPosition.endColIndex !== undefined) {
					gridLineColRegionList = headItemCols.models.slice(this.currentRule.displayPosition.startColIndex, this.currentRule.displayPosition.endColIndex);
				} else {
					gridLineColRegionList = headItemCols.models.slice(this.currentRule.displayPosition.startColIndex);
				}
			}
			len = gridLineColRegionList.length;
			for (; i < len; i++) {
				if (!gridLineColRegionList[i].get('hidden')) {
					this.addGridLineCol(gridLineColRegionList[i]);
				}
				this.colNumber++;
			}
			return this;
		},
		restoreHideCols: function() {
			var headItemColList = headItemCols.models,
				len = headItemColList.length,
				i = 0;
			for (; i < len; i++) {
				if (headItemColList[i].get('hidden')) {
					this.addGridLineCol(headItemColList[i]);
				}
			}
		},
		/**
		 * 动态加载过程中，重新加载隐藏列视图
		 * @return {[type]} [description]
		 */
		restoreGridLineColView: function(region) {
			var headItemColList = headItemCols.models,
				startPosi = region.start,
				endPosi = region.end,
				startIndex,
				endIndex,
				i, len;

			startIndex = binary.newModelBinary(startPosi, headItemColList, 'left', 'width');
			endIndex = binary.newModelBinary(endPosi, headItemColList, 'left', 'width');
			for (i = startIndex; i < endIndex + 1; i++) {
				if (!headItemColList[i].get('isView')) {
					this.addGridLineCol(headItemColList[i]);
				}
			}
		},
		/**
		 * 渲染view，增加列在`grid`区域内
		 * @method addGridLineCol
		 * @param  {object} modelGridLineCol 列model对象
		 */
		addGridLineCol: function(modelGridLineCol) {
			var gridLineCol = new GridLineColContainer({
				model: modelGridLineCol,
				frozenLeft: this.currentRule.displayPosition.offsetLeft,
				endIndex: this.currentRule.displayPosition.endColIndex
			});
			this.$el.append(gridLineCol.render().el);
		},
		/**
		 * collection增加新model对象
		 * @method createGridLineCol
		 */
		createGridLineCol: function() {
			headItemCols.add(this.newAttrCol());
		},
		/**
		 * 设置新对象属性
		 * @method newAttrCol
		 * @return {object} 新对象属性
		 * @deprecated 在行列调整后将会过时
		 */
		newAttrCol: function() {
			var currentObject;
			currentObject = {
				alias: (this.colNumber + 1).toString(),
				left: this.colNumber * config.User.cellWidth,
				width: config.User.cellWidth - 1,
				displayName: buildAlias.buildColAlias(this.colNumber)
			};
			return currentObject;
		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			Backbone.off('event:restoreHideCols');
			Backbone.off('event:restoreColView');
			this.remove();
		}
	});
	return ColsGridContainer;
});