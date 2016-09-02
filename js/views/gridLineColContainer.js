/**
 * GridLineColContainer
 * @author ray wu
 * @module view
 * @since 1.0.0
 * @main view
 */
define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone');
	var headItemCols = require('collections/headItemCol');
	var cache = require('basic/tools/cache');
	var config = require('spreadsheet/config');
	var util = require('basic/util/clone');
	/**
	 * @class GridLineColContainer
	 */
	var GridLineColContainer = Backbone.View.extend({
		/**
		 * @property {element} className
		 */
		className: 'col',
		/**
		 * 出书啊监听
		 * @method initialize
		 */
		initialize: function() {
			var modelList, currentIndex, currentModel;
			this.offsetLeft = 0;
			this.listenTo(this.model, 'change:isView', this.destroy);
			this.listenTo(this.model, 'change:isHide', this.destroy);
			this.listenTo(this.model, 'change:left', this.changeLeft);
			this.listenTo(this.model, 'change:width', this.changeWidth);
			this.listenTo(this.model, 'destroy', this.remove);
			modelList = headItemCols;
			currentModel = modelList.getModelByAlias(cache.TempProp.colAlias);
			this.userViewLeft = cache.TempProp.isFrozen ? modelList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			this.offsetLeft = cache.TempProp.isFrozen && cache.CurrentRule.autoColAlign ? ((currentModel.get('left') - this.userViewLeft) || 0) : 0;
		},
		/**
		 * 渲染本身对象
		 * @method render
		 * @return {object} 返回自身对象`this`
		 */
		render: function() {
			this.changeLeft();
			this.changeWidth();
			return this;
		},
		changeLeft: function() {
			this.$el.css({
				left: this.model.toJSON().left - this.offsetLeft - this.userViewLeft
			});
		},
		changeWidth: function() {
			this.$el.css({
				width: this.model.toJSON().width
			});
		},
		destroy: function() {
			if (!this.model.get('isView') || this.model.get('isHide')) {
				this.remove();
			}
		}
	});
	return GridLineColContainer;
});