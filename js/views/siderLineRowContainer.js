define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		util = require('basic/util/clone'),
		headItemRows = require('collections/headItemRow');
	/**
	 * 选中区域行标线视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class SiderLineRowContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var SiderLineRowContainer = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property el
		 * @type {String}
		 */
		className: 'row-head-line',
		/**
		 * 视图初始化函数
		 * @method initialize
		 */
		initialize: function() {
			var modelList;
			this.listenTo(this.model, 'change', this.render);
			this.currentRule = util.clone(cache.CurrentRule);
			modelList = headItemRows;
			this.userViewTop = cache.TempProp.isFrozen ? modelList.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.offsetTop = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetTop || 0) : 0;
		},
		/**
		 * 页面渲染方法
		 * @method render
		 */
		render: function() {
			var modelJSON = this.model.toJSON();
			this.$el.css({
				top: modelJSON.top - this.offsetTop - this.userViewTop,
				height: modelJSON.height - 2
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
	return SiderLineRowContainer;
});