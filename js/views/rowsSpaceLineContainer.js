define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone');

	/**
	 * 行标题容器视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class RowsSpaceLineContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var RowsSpaceLineContainer = Backbone.View.extend({
		/**
		 * @property {element} className
		 */
		className: 'row-space-container',
		/**
		 * 初始化监听事件
		 * @method initialize
		 * @param  {object}   allAttributes 盒模型属性集合
		 */
		initialize: function(allAttributes) {
			Backbone.on('call:rowsSpaceLineContainer', this.callRowsSpaceLineContainer, this);
			Backbone.on('event:rowsSpaceLineContainer:destroy', this.destroy, this);
			this.boxAttributes = allAttributes.boxAttributes;
		},
		/**
		 * 渲染DOM对象属性
		 * @method render
		 * @return {object} 返回自身对象`this`
		 */
		render: function() {
			this.attributesRender(this.boxAttributes);
			return this;
		},
		/**
		 * 对外开放自身对象`this`
		 * @method callRowsSpaceLineContainer
		 * @param  {Function} receiveFunc 传入接受对象的方法
		 */
		callRowsSpaceLineContainer: function(receiveFunc) {
			receiveFunc(this);
		},
		/**
		 * 自身属性渲染
		 * @method attributesRender
		 * @param  {object} newAttributes 盒模型属性
		 */
		attributesRender: function(newAttributes) {
			this.$el.css({
				'top': newAttributes.top
			});
		},
		/**
		 * 销毁当前view视图
		 * @method destroy
		 */
		destroy: function() {
			this.remove();
		}
	});
	return RowsSpaceLineContainer;
});