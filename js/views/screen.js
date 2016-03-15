define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		BodyContainer = require('views/bodyContainer'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		listener = require('basic/util/listener'),
		Screen;


	/**
	 * 屏幕视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class screen  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	Screen = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property {String} el
		 */
		el: window,
		/**
		 * 鼠标事件
		 * @property {Object} events
		 */
		events: {
			'resize': 'attributesRender',
			'mouseup': 'realseDrag',
			'beforeunload': 'closeWindow',
			'paste': 'pasteData',
			'mousedown': 'transAction',
			'keydown': 'onKeyDown'
		},

		/**
		 * 类初始化方法，绑定关联视图对象
		 * @method initialize
		 * @return {[type]} [description]
		 */
		initialize: function(id) {
			Backbone.on('call:screenContainer', this.screenContainer, this);
			Backbone.on('call:screenContainer:adaptScreen', this.attributesRender, this);
			_.bindAll(this, 'callView');
			this.render();
		},
		onKeyDown: function(e) {
			var flag = false;
			if ($(':focus').length > 0) return;
			if (e.ctrlKey === true || e.altKey === true) return;

			switch (true) {
				//判断回车按钮
				case (e.keyCode === 32):
					flag = true;
					break;
				case (36 <= e.keyCode && e.keyCode <= 46):
					flag = true;
					break;
				case (48 <= e.keyCode && e.keyCode <= 57):
					flag = true;
					break;
				case (65 <= e.keyCode && e.keyCode <= 90):
					flag = true;
					break;
				case (96 <= e.keyCode && e.keyCode <= 107):
					flag = true;
					break;
				case (109 <= e.keyCode && e.keyCode <= 111):
					flag = true;
					break;
				case (186 <= e.keyCode && e.keyCode <= 192):
					flag = true;
					break;
				case (219 <= e.keyCode && e.keyCode <= 222):
					flag = true;
					break;
				default:
					break;
			}
			if(flag){
				Backbone.trigger('event:selectRegion:createInputContainer');
			}
			// if (e.keyCode === 32 || (36 < e.keyCode && e.keyCode < 46) ||
			// 	(48 < e.keyCode && e.keyCode < 57) || (65 < e.keyCode && e.keyCode < 90) ||
			// 	 (96 < e.keyCode && e.keyCode < 107) || (109 < e.keyCode && e.keyCode < 111) || e.keyCode === 144 || 
			// 	 (186 < e.keyCode && e.keyCode < 192) || (219 < e.keyCode && e.keyCode < 222)) {
			// 	Backbone.trigger('event:selectRegion:createInputContainer');
			// }
		},
		//触发回车事件
		/**
		 * 视图渲染方法
		 * @method render
		 */
		render: function() {
			this.bodyContainer = new BodyContainer();
			this.bodyContainer.render();
			this.triggerCallback();
		},
		transAction: function(e) {
			this.toolbar(e);
		},
		/**
		 * 工具菜单栏选中效果
		 * @method toolbar
		 * @param  {object} e mouse的click对象
		 */
		toolbar: function(e) {
			var currentBar,
				widgetList,
				len,
				i = 0,
				$target,
				targetLen;

			if ($(e.target).length) {
				$target = $(e.target);
			}
			if ($(e.target).parents('[data-toolbar]').length) {
				$target = $(e.target).parents('[data-toolbar]');
			}
			targetLen = $target.length;
			widgetList = $('.widget-list > div');
			widgetList.removeClass('active');
			$('#toolBar .fui-section,#toolBar .section,#toolBar .ico-section').removeClass('active');
			if (targetLen === 0) {
				return;
			}
			len = widgetList.length;
			currentBar = $target.data('toolbar');
			for (; i < len; i++) {
				var currentWidget = widgetList.eq(i);
				if (currentBar === currentWidget.data('widget')) {
					var excuHeight = 0;
					if ($target[0].offsetHeight > $target[0].clientHeight) {
						excuHeight = parseInt(($target[0].offsetHeight - $target[0].clientHeight) / 2, 0) + $target[0].clientHeight;
					} else {
						excuHeight = $target.outerHeight();
					}
					currentWidget.css({
						left: $target.offset().left,
						top: $target.offset().top + excuHeight
					}).addClass('active');
				}
			}
			$target.addClass('active');
		},
		/**
		 * 绑定视图
		 * @method triggerCallback
		 */
		triggerCallback: function() {
			Backbone.trigger('call:rowsPanelContainer', this.callView('viewRowsPanelContainer'));
			Backbone.trigger('call:colsPanelContainer', this.callView('viewColsPanelContainer'));
			Backbone.trigger('call:mainContainer', this.callView('viewMainContainer'));

			Backbone.trigger('call:cellsContainer', this.callView('viewCellsContainer'));
			Backbone.trigger('call:colsHeadContainer', this.callView('viewColsHeadContainer'));
			Backbone.trigger('call:rowsHeadContainer', this.callView('viewRowsHeadContainer'));
		},
		/**
		 * 关闭浏览器监听事件
		 * @method closeWindow
		 */
		closeWindow: function() {
			var url = 'excel.htm?m=close&excelId=' + window.SPREADSHEET_AUTHENTIC_KEY;
			if (cache.TempProp.isFrozen === true) {
				url += '&startX=' + cache.UserView.colAlias + '&startY=' + cache.UserView.colAlias;
			} else {
				url += '&startX=1&startY=1';
			}
			send.PackAjax({
				url: url
			});
		},
		/**
		 * 粘贴监听事件
		 * @method pasteData
		 */
		pasteData: function(event) {
			event.preventDefault();
			var pasteText;
			if (window.clipboardData && window.clipboardData.getData) { // IE
				pasteText = window.clipboardData.getData('Text');
			} else {
				pasteText = event.originalEvent.clipboardData.getData('Text'); //e.clipboardData.getData('text/plain');
			}
			Backbone.trigger('event:pasteData', pasteText);
		},
		/**
		 * 用于其他视图，绑定该视图
		 * @method screenContainer
		 * @param  {Function} receiveFunc 回调函数
		 */
		screenContainer: function(receiveFunc) {
			receiveFunc(this);
		},
		/**
		 * 盒子模型属性渲染
		 * @method attributesRender
		 */
		attributesRender: function() {
			this.bodyContainer.calculation();
			Backbone.trigger('event:bodyContainer:executiveFrozen');
		},
		/**
		 * 绑定其它视图
		 * @method callView
		 */
		callView: function(name) {
			var object = this;
			return function(callBack) {
				object[name] = callBack;
			};
		},
		/**
		 * 释放所有windows的事件
		 * @method realseDrag
		 * @param  {EventFacade} e [windows的事件]
		 */
		realseDrag: function(e) {

			this.triggerCallback();
			Backbone.trigger('event:cellsContainer:unBindDrag');
			//release events of cols
			Backbone.trigger('event:colsHeadContainer:relaseSpaceEffect');
			//release events of rows
			Backbone.trigger('event:rowsHeadContainer:relaseSpaceEffect');
			this.$el.off('mousemove', this.viewColsHeadContainer.moveEvent);
			Backbone.trigger('event:colsSpaceLineContainer:destroy');
			this.$el.off('mousemove', this.viewRowsHeadContainer.moveEvent);
			Backbone.trigger('event:rowsSpaceLineContainer:destroy');
			listener.excute('mouseup', e);
		},
		/**
		 * 行列标题区域，鼠标移动事件绑定
		 * @method mouseMoveHeadContainer
		 * @param  {event} e        鼠标事件
		 * @param  {Array} args     参数列表
		 * @param  {[type]} moveEvent 移动事件
		 */
		mouseMoveHeadContainer: function(e, args, moveEvent) {
			this.$el.on('mousemove', args, moveEvent);
		}
	});
	return Screen;
});
