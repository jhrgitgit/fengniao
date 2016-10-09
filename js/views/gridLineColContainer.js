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
		initialize: function(option) {
			this.offsetLeft = cache.TempProp.isFrozen ? (option.frozenLeft || 0) : 0;
			this.endIndex = option.endIndex;
			this.listenTo(this.model, 'change:hidden', this.destroy);
			this.listenTo(this.model, 'change:left', this.changeLeft);
			this.listenTo(this.model, 'change:width', this.changeWidth);
			this.listenTo(this.model, 'destroy', this.remove);
			this.currentRule = util.clone(cache.CurrentRule);

			if (cache.TempProp.isFrozen === false || this.endIndex === undefined) {
				this.listenTo(this.model, 'change:isView', this.destroy);
			}
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
			var userViewLeft = 0,
				userViewModel;
			if (cache.TempProp.isFrozen) {
				userViewModel = headItemCols.getModelByAlias(cache.UserView.colAlias);
				userViewLeft = userViewModel.toJSON().left;
			}

			this.$el.css({
				left: this.model.toJSON().left - this.offsetLeft - userViewLeft
			});
		},
		changeWidth: function() {
			this.$el.css({
				width: this.model.toJSON().width
			});
		},
		destroy: function() {
			if (!this.model.get('isView') || this.model.get('hidden')) {
				this.remove();
			}
		}
	});
	return GridLineColContainer;
});