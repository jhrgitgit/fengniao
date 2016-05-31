define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		headItemRows = require('collections/headItemRow'),
		cache = require('basic/tools/cache'),
		util = require('basic/util/clone'),
		config = require('spreadsheet/config');
	/**
	 * GridLineRowContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class GridLineRowContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var GridLineRowContainer = Backbone.View.extend({
		/**
		 * @property {element} className
		 */
		className: 'row',
		/**
		 * 初始化监听
		 * @method initialize
		 * @return {[type]}
		 */
		initialize: function(option) {
			var modelList,
				currentIndex;

			this.offsetTop = cache.TempProp.isFrozen ? (option.frozenTop || 0) : 0;
			this.endIndex = option.endIndex;
			this.listenTo(this.model, 'change:top', this.changeTop);
			this.listenTo(this.model, 'change:height', this.changeHeight);
			this.listenTo(this.model, 'destroy', this.remove);
			this.currentRule = util.clone(cache.CurrentRule);
			modelList = headItemRows;

			if (cache.TempProp.isFrozen !== true || this.endIndex === undefined) {
				this.listenTo(this.model, 'change:isView', this.destroy);
			}
		},
		/**
		 * 渲染本身对象
		 * @method render
		 * @return {object} 返回自身对象`this`
		 */
		render: function() {
			this.changeTop();
			this.changeHeight();
			return this;
		},
		/**
		 * 更新top
		 * @method changeTop
		 */
		changeTop: function() {
			var userViewTop = 0,
				userViewModel;
			if (cache.TempProp.isFrozen) {
				userViewModel = headItemRows.getModelByAlias(cache.UserView.rowAlias);
				userViewTop = userViewModel.toJSON().top;
			}
			this.$el.css({
				top: this.model.toJSON().top - this.offsetTop - userViewTop
			});
		},
		/**
		 * 更新高度
		 * @method changeTop
		 */
		changeHeight: function() {
			this.$el.css({
				height: this.model.toJSON().height
			});
		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			this.remove();
		}
	});
	return GridLineRowContainer;
});