define(function(require) {
	'use strict';
	var $=require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		setFontColor=require('entrance/tool/setfontcolor');

	/**
	 * 设置字体颜色功能监听类
	 * @author ray wu
	 * @since 0.1.0
	 * @class FontColorContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var FontColorContainer = Backbone.View.extend({
		/**
		 * @property {element} el
		 */
		el: "#fontColor",
		/**
		 * @property {object} events
		 */
		events: {
			/**
			 * 选择下拉菜单时修改单元格背景颜色
			 * @event mousedown
			 */
			'mousedown .color-body': 'setFontColor'
		},
		/**
		 * 设置单元格背景颜色
		 * @method setFillColor
		 * @param  {event}     e 每个`.color-body`的事件对象
		 */
		setFontColor: function(e) {
			this.$el.removeClass('active');
			var color = $(e.currentTarget).css('background-color');
			setFontColor('1',color);
		}

	});
	return FontColorContainer;
});