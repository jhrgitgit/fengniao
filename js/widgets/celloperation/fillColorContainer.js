define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		setFillColor = require('entrance/tool/setFillColor'),
		FillColorContainer;

	/**
	 * 设置填充颜色功能监听类
	 * @author ray wu
	 * @since 0.1.0
	 * @class FillColorContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	FillColorContainer = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property {string} el 
		 */
		el: "#fillColor",
		/**
		 * 监听事件
		 * @property {object} events
		 */
		events: {
			'mousedown .color-body': 'setFillColor'
		},
		/**
		 * 设置填充颜色
		 * @method setFillColor
		 */
		setFillColor: function(e) {
			this.$el.removeClass('active');
			var color = $(e.currentTarget).css('background-color');
			setFillColor('1', color);
		}

	});
	return FillColorContainer;

});