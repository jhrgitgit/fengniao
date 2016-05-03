define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		setTextType = require('entrance/tool/settexttype');
	/**
	 * 文本类型视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class TextFormatContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var TextFormatContainer = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property {string} el
		 */
		el: "#contentFormat",
		/**
		 * 绑定鼠标事件
		 * @method events
		 */
		events: {
			'mousedown li': 'setContentFormat'
		},
		/**
		 * 设置选中区域文本格式
		 * @method setContentFormat
		 * @param e {event}  鼠标点击事件
		 */
		setContentFormat: function(e) {
			this.$el.removeClass('active');
			var formatPosition = $(e.currentTarget).data('format');
			// setTextType('1',formatPosition);
			switch (formatPosition) {
				case 'text':
					setTextType.setText();
					break;
				case 'number':
					setTextType.setNum(true, 2);
					break;
				case 'date':
					setTextType.setDate("yyyy-MM-dd");
					break;
				case 'percent':
					setTextType.setPercent(2);
					break;
				case 'coin':
					setTextType.setCoin(2);
					break;
				default:
					setTextType.setText();
					break;
			}
		}
	});
	return TextFormatContainer;
});