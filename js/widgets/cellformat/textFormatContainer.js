'use strict';
define(function(require) {
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		config = require('spreadsheet/config'),
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
		el: '#contentFormat',
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
				case 'number-1':
					setTextType.setNum(true, 0);
					break;
				case 'number-2':
					setTextType.setNum(true, 2);
					break;
				case 'number-3':
					setTextType.setNum(true, 4);
					break;
				case 'date-1':
					setTextType.setDate(config.dateFormatType.frist);
					break;
				case 'date-2':
					setTextType.setDate(config.dateFormatType.second);
					break;
				case 'date-3':
					setTextType.setDate(config.dateFormatType.third);
					break;
				case 'date-4':
					setTextType.setDate(config.dateFormatType.fourth);
					break;
				case 'date-5':
					setTextType.setDate(config.dateFormatType.fifth);
					break;
				case 'date-6':
					setTextType.setDate(config.dateFormatType.sixth);
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