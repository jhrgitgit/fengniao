define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		siderLineCols = require('collections/siderLineCol'),
		headItemCols = require('collections/headItemCol'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache'),
		ColsHeadContainer = require('views/colsHeadContainer'),
		SiderLineColContainer = require('views/siderLineColContainer'),
		ColsAllHeadContainer;

	/**
	 * ColsAllHeadContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class ColsAllHeadContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	ColsAllHeadContainer = Backbone.View.extend({
		/**
		 * @property {element} className
		 */
		className: 'col-head-bg col-head-height',
		/**
		 * 初始化监听事件
		 * @method initialize
		 * @param  {object}   allAttributes 盒模型属性集合
		 */
		initialize: function(options) {
			Backbone.on('call:colsAllHeadContainer', this.callColsAllHeadContainer, this);
			Backbone.on('event:colsAllHeadContainer:adaptWidth', this.adaptWidth, this);
			this.listenTo(siderLineCols, 'add', this.addSiderLineCol);
			this.boxAttributes = options.boxAttributes;
			this.currentRule = cache.CurrentRule;
		},
		/**
		 * 初始化`ColHeadContainer`，渲染DOM结构
		 * @method render
		 * @return {object} 返回自身对象`this`
		 */
		render: function() {
			var modelSiderLineColList = siderLineCols.models,
				len = modelSiderLineColList.length,
				i;
			this.colsHeadContainer = new ColsHeadContainer();
			this.attributesRender(this.boxAttributes);
			this.$el.append(this.colsHeadContainer.render().el);
			if (len === 0) {
				this.createSiderLineCol();
			} else {
				for (i = len - 1; i >= 0; i--) {
					this.addSiderLineCol(modelSiderLineColList[i]);
				}
			}
			return this;
		},
		/**
		 * 对外开放自身对象`this`
		 * @method callColsAllHeadContainer
		 * @param  {function} receiveFunc 传入接受对象的方法
		 */
		callColsAllHeadContainer: function(receiveFunc) {
			receiveFunc(this);
		},
		/**
		 * 自身属性渲染
		 * @method attributesRender
		 * @param  {object} newAttributes 盒模型属性
		 */
		attributesRender: function(newAttributes) {
			if (newAttributes.width !== -1) {
				this.$el.css({
					'width': newAttributes.width
				});
			}
		},
		adaptWidth: function() {
			var headItemColList = headItemCols.models,
				endIndex,
				width,
				left, i;

			endIndex = this.currentRule.displayPosition.endColIndex;
			if (typeof endColIndex === 'undefined') {
				endIndex = headItemColList.length - 1;
			}
			for (i = endIndex; i > -1; i--) {
				if (!headItemColList[i].get('hidden')) {
					left = headItemColList[i].get('left');
					width = headItemColList[i].get('width');
					break;
				}
			}
			this.$el.css('width', width + left);
		},
		/**
		 * [addSiderLineCol description]
		 * @method addSiderLineCol
		 * @param  {[type]}        modelSiderLineCol
		 */
		addSiderLineCol: function(modelSiderLineCol) {
			this.siderLineColContainer = new SiderLineColContainer({
				model: modelSiderLineCol
			});
			this.$el.append(this.siderLineColContainer.render().el);
		},
		/**
		 * [createSiderLineCol description]
		 * @method createSiderLineCol
		 * @return {[type]}
		 */
		createSiderLineCol: function() {
			siderLineCols.add({
				left: 0,
				width: config.User.cellWidth - 1
			});
		},
		destroy: function() {
			Backbone.off('call:colsAllHeadContainer');
			Backbone.off('event:colsAllHeadContainer:adaptWidth');
			this.colsHeadContainer.destroy();
			this.remove();
		}
	});
	return ColsAllHeadContainer;

});