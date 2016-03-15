define(function(require) {
	'use strict';

	/**
	 * 容器视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class TableContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var TableContainer = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property el
		 * @type {String}
		 */
		el: '#tableContainer',
		/**
		 * 类初始化方法
		 * @method initialize
		 */
		initialize: function() {

		},
		/**
		 * 初始化渲染方法
		 * @method initRender
		 */
		initRender: function() {
			var rowsPanelContainer = new RowsPanelContainer();
			this.$el.append(rowsPanelContainer.render().el);
		}
	});
	return TableContainer;
});