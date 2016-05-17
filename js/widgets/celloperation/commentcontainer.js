define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		commentOpr = require('entrance/tool/comment'),
		commentContainer;

	/**
	 * 设置填充颜色功能监听类
	 * @author ray wu
	 * @since 0.1.0
	 * @class FillColorContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	commentContainer = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property {string} el 
		 */
		el: "#reviewContainer",
		/**
		 * 监听事件
		 * @property {object} events
		 */
		events: {
			'click .fui-section': 'commentAction'
		},
		commentAction: function(e) {
			var action;
			action = $(e.currentTarget).data('toolbar');
			switch (action) {
				case 'addComment':
					commentOpr.createAddCommentView();
					break;
				case 'editComment':
					commentOpr.createEditComment();
					break;
				case 'deleteComment':
					commentOpr.deleteComment();
					break;
				default:
					break;
			}
		},
	});
	return commentContainer;
});