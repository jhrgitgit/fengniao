define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		getTextBox = require('basic/tools/gettextbox'),
		util = require('basic/util/clone'),
		config = require('spreadsheet/config'),
		binary = require('basic/util/binary'),
		send = require('basic/tools/send'),
		siderLineRows = require('collections/siderLineRow'),
		siderLineCols = require('collections/siderLineCol'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		selectRegions = require('collections/selectRegion'),
		InputContainer;


	/**
	 * InputContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class InputContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	InputContainer = Backbone.View.extend({
		/**
		 * 设置标签类型
		 * @property tagName
		 * @type {String}
		 */
		tagName: 'textarea',
		/**
		 * 设置标签class属性
		 * @method className
		 * @type {String}
		 */
		className: 'edit-frame',
		/**
		 * 绑定鼠标事件
		 * @method events
		 * @type {Object}
		 */
		events: {
			'blur': 'close',
			'input': 'adapt',
			'propertychange': 'adapt',
			'keydown': 'keyHandle'
		},
		/**
		 * 类初始化函数
		 * @method initialize
		 */
		initialize: function(options) {
			var modelRowList = headItemRows,
				modelColList = headItemCols;
			this.currentRule = options.currentRule;
			this.offsetLeft = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetLeft || 0) : 0;
			this.offsetTop = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetTop || 0) : 0;
			this.userViewTop = cache.TempProp.isFrozen ? modelRowList.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? modelColList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
		},
		/**
		 * 视图显示函数
		 * @method render
		 */
		render: function() {
			var modelJSON = this.model.toJSON();
			if (modelJSON.content.italic === true) this.$el.css({
				'font-weight': 'bold'
			});
			if (modelJSON.content.bd === true) this.$el.css({
				'font-style': 'italic'
			});
			this.$el.css({
				'width': modelJSON.physicsBox.width,
				'height': modelJSON.physicsBox.height - 2,
				'left': modelJSON.physicsBox.left - this.offsetLeft - this.userViewLeft + 1,
				'top': modelJSON.physicsBox.top - this.offsetTop - this.userViewTop + 1,
				'color': modelJSON.content.color,
				'font-size': modelJSON.content.size,
				'font-family': modelJSON.content.family,
			}).val(modelJSON.content.texts);
			this.adjustWidth();
			return this;
		},
		/**
		 * 自适应输入框的大小
		 */
		adapt: function() {
			this.adjustWidth();
			this.adjustHight();
		},
		/**
		 * 调整输入框高度
		 */
		adjustHight: function() {
			var height,
				fontSize,
				width,
				text;
			text = this.$el.val();
			fontSize = this.model.get("content").size;
			width = this.model.get("physicsBox").width;
			height = getTextBox.getTextHeight(text, this.model.get("wordWrap"), fontSize, width);
			this.$el.css("height", height);
			return height;
		},
		/**
		 * 调整输入框宽度
		 * @method adjustWidth
		 * @param e {event} propertychange函数
		 */
		adjustWidth: function(e) {
			var text,
				texts,
				inputText,
				tempDiv,
				currentWidth,
				fontSize,
				tempDivWidth,
				len, i;
			if (this.model.get("wordWrap") === true) return;
			inputText = this.$el.val();
			texts = inputText.split('\n');
			len = texts.length;
			for (i = 0; i < len; i++) {
				text += texts[i] + '<br>';
			}

			tempDiv = $('<div/>').html(text);
			fontSize = this.model.get("content").size;
			tempDiv.css({
				"display": "none",
				"font-size": fontSize
			});
			$('body').append(tempDiv);
			currentWidth = parseInt(this.el.offsetWidth, 0);
			tempDivWidth = tempDiv.width();
			if (currentWidth - 10 < tempDivWidth && this.model.get('physicsBox').width < tempDivWidth) {
				this.$el.width(tempDivWidth + 30);
			}
			tempDiv.remove();
		},
		/**
		 * 输入框移除输入焦点，视图销毁
		 * @method close
		 * @param e {event}  输入焦点移除
		 */
		close: function(e) {
			var currentTexts, headLineRowModelList, headLineColModelList, modelIndexCol, modelIndexRow;
			currentTexts = this.$el.val();
			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;
			modelIndexCol = binary.modelBinary(this.model.get('physicsBox').left,
				headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
			modelIndexRow = binary.modelBinary(this.model.get('physicsBox').top,
				headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);

			send.PackAjax({
				url: 'text.htm?m=data',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					coordinate: {
						startX: modelIndexCol,
						startY: modelIndexRow,
						startAliasCol: modelIndexCol,
						startAliasRow: modelIndexRow,
					},
					content: encodeURIComponent(currentTexts)
				})
			});
			this.model.set('content.texts', currentTexts);
			if (currentTexts.indexOf("\n") > 0 && (this.model.get('wordWrap') === false)) {
				this.model.set({
					'wordWrap': true
				});
				send.PackAjax({
					url: 'text.htm?m=wordWrap',
					data: JSON.stringify({
						excelId: window.SPREADSHEET_AUTHENTIC_KEY,
						sheetId: '1',
						coordinate: {
							startX: headItemCols.models[modelIndexCol].get("alias"),
							startY: headItemRows.models[modelIndexRow].get("alias"),
							endX: headItemCols.models[modelIndexCol].get("alias"),
							endY: headItemRows.models[modelIndexRow].get("alias")
						},
						wordWrap: true
					})
				});
			}
			this.destroy();
		},
		isShortKey: function(needle) {
			var prop,
				keyboard = config.keyboard;
			for (prop in keyboard) {
				if (keyboard[prop] === needle) {
					return true;
				}
			}
			return false;
		},
		keyHandle: function(e) {
			var aliasRow,
				aliasCol,
				endIndexRow,
				startIndexCol,
				selectRegion,
				headItemColList,
				headItemRowList,
				width,
				height,
				currentTexts,
				self = this,
				len, i, isShortKey, keyboard;
			keyboard = config.keyboard;
			isShortKey = this.isShortKey(e.keyCode);
			if (isShortKey) {
				switch (e.keyCode) {
					case keyboard.enter:
						if (e.altKey) {
							insertAtCursor('\n');
							this.adjustHight();
							return;
						} else {
							this.close();
							Backbone.trigger('event:mainContainer:nextCellPosition', 'DOWN');
							Backbone.trigger('event:cellsContainer:selectRegionChange', 'DOWN');
						}
						break;
				}
			}

			function insertAtCursor(myValue) {
				var $t = self.$el[0];
				if (document.selection) {
					self.$el.focus();
					sel = document.selection.createRange();
					sel.text = myValue;
					self.$el.focus();
				} else if ($t.selectionStart || $t.selectionStart == '0') {
					var startPos = $t.selectionStart;
					var endPos = $t.selectionEnd;
					var scrollTop = $t.scrollTop;
					$t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
					self.$el.focus();
					$t.selectionStart = startPos + myValue.length;
					$t.selectionEnd = startPos + myValue.length;
					$t.scrollTop = scrollTop;
				} else {
					self.value += myValue;
					self.$el.focus();
				}
			}

		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			this.undelegateEvents();
			this.remove();
		}
	});
	return InputContainer;
});