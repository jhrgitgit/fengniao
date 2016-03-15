define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		util = require('basic/util/clone'),
		headItemCols = require('collections/headItemCol');


	/**
	 * 选中区域列标线视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class SiderLineColContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var SiderLineColContainer = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property el
		 * @type {String}
		 */
		className: 'col-head-line',
		/**
		 * 视图初始化函数
		 * @method initialize
		 */
		initialize: function() {
			var modelList;
			this.listenTo(this.model, 'change', this.render);
			this.currentRule = util.clone(cache.CurrentRule);
			modelList = headItemCols;
			this.userViewLeft = cache.TempProp.isFrozen ? modelList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			this.offsetLeft = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetLeft || 0) : 0;
		},
		/**
		 * 页面渲染方法
		 * @method render
		 */
		render: function() {
			var modelJSON = this.model.toJSON();
			this.$el.css({
				left: modelJSON.left - this.offsetLeft - this.userViewLeft,
				width: modelJSON.width - 2
			});
			return this;
		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			this.remove();
		}
	});
	return SiderLineColContainer;
});