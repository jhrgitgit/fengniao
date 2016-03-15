define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		Handlebars = require('lib/handlebars'),
		headItemCols = require('collections/headItemCol'),
		cache = require('basic/tools/cache'),
		config = require('spreadsheet/config'),
		util = require('basic/util/clone'),
		HeadItemColContainer;

	/**
	 * HeadItemColContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class HeadItemColContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	HeadItemColContainer = Backbone.View.extend({
		/**
		 * @property {element} className
		 */
		className: 'col-head-item',
		/**
		 * 初始化监听
		 * @method initialize
		 */
		initialize: function(option) {
			// this.frozenOffsetLeft = option.frozenLeft;

			this.listenTo(this.model, 'change:activeState', this.toggleActive);
			this.listenTo(this.model, 'change:isView', this.remove);
			this.listenTo(this.model, 'change:left', this.changeLeft);
			this.listenTo(this.model, 'change:width', this.changeWidth);
			this.currentRule = util.clone(cache.CurrentRule);
			this.offsetLeft = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetLeft || 0) : 0;
		},
		/**
		 * 渲染本身对象
		 * @method render
		 */
		render: function() {

			/**
			 * @property {string} template
			 */
			this.template = Handlebars.compile($('#tempColHeadItem').html());
			this.changeLeft();
			this.changeWidth();
			this.$el.html(this.template(this.model.toJSON())).data('alias', this.model.get('alias'));
			this.toggleActive();
			return this;
		},
		/**
		 * 切换DOM对象的状态
		 * @method toggleActive
		 */
		toggleActive: function() {
			this.$el.toggleClass("active", this.model.toJSON().activeState);
		},
		/**
		 * 修改DOM对象的`left`值
		 * @method changeLeft
		 */
		changeLeft: function() {
			var userViewLeft = 0,
				userViewModel;
			if (this.currentRule.reduceUserView) {
				userViewModel = headItemCols.getModelByAlias(cache.UserView.colAlias);
				userViewLeft = userViewModel.toJSON().left;
			}
			this.$el.css({
				left: this.model.toJSON().left - this.offsetLeft - userViewLeft
			});
		},
		/**
		 * 修改DOM对象的`width`值
		 * @method changeWidth		 
		 */
		changeWidth: function() {
			this.$el.css({
				width: this.model.toJSON().width
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
	return HeadItemColContainer;
});