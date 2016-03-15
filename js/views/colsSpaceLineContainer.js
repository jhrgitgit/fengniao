define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone');
	/**
	 * ColsSpaceLineContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class ColsSpaceLineContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var ColsSpaceLineContainer = Backbone.View.extend({
		/**
		 * @property {element} className
		 */
		className: 'col-space-container',
		/**
		 * 初始化监听事件
		 * @method initialize
		 * @param  {object}   allAttributes 盒模型属性集合
		 */
		initialize: function(allAttributes) {
			Backbone.on('call:colsSpaceLineContainer', this.callColsSpaceLineContainer, this);
			Backbone.on('event:colsSpaceLineContainer:destroy', this.destroy, this);
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
		 * @method callColsSpaceLineContainer
		 * @param  {Function} receiveFunc 传入接受对象的方法
		 */
		callColsSpaceLineContainer: function(receiveFunc) {
			receiveFunc(this);
		},
		/**
		 * 自身属性渲染
		 * @method attributesRender
		 * @param  {object} newAttributes 盒模型属性
		 */
		attributesRender: function(newAttributes) {
			this.$el.css({
				'left': newAttributes.left
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
	return ColsSpaceLineContainer;
});