define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cells = require('collections/cells'),
		selectRegions = require('collections/selectRegion'),
		setCellBorder=require('entrance/tool/setCellBorder');

	/**
	 * 边框功能视图
	 * @author ray wu
	 * @since 0.1.0
	 * @class BorderContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var BorderContainer = Backbone.View.extend({
		/**
		 * 页面的toolbar里的id
		 * @property {object} el
		 */
		el: '#funcBorder',
		/**
		 * 事件绑定
		 * @property {obejct} events
		 */
		events: {
			/**
			 * 当边框下`li`触发`mousedown`时，进行判断需要触发哪个位置边框
			 * @event mousedown
			 */
			'mousedown li': 'transAction'
		},
		initialize: function() {
		},
		render: function() {},
		/**
		 * 传递动作
		 * @method transAction
		 *
		 * @param  {event}    e
		 *
		 * @return {[type]}
		 */
		transAction: function(e) {
			var borderPositon = $(e.currentTarget).data('border');
			setCellBorder('1',borderPositon);
		}
	});
	return BorderContainer;
});