define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
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
		textTypeHandler = require('entrance/tool/settexttype'),
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
			'input': 'adapt',
			'propertychange': 'adapt',
			'keydown': 'keyHandle'
		},
		/**
		 * 类初始化函数
		 * @method initialize
		 */
		initialize: function(options) {
			Backbone.on('event:InputContainer:show', this.show, this);
			Backbone.on('event:InputContainer:hide', this.hide, this);
		},
		/**
		 * 显示输入框
		 */
		show: function() {
			var mainContainer,
				rowAlias,
				colAlias,
				colIndex,
				rowIndex,
				scrollTop,
				scrollLeft,
				offsetTop,
				offsetLeft,
				select,
				left,
				top,
				cell;

			select = selectRegions.getModelByType('operation')[0];
			colAlias = select.get('wholePosi').startX;
			colIndex = headItemCols.getIndexByAlias(colAlias);
			rowAlias = select.get('wholePosi').startY;
			rowIndex = headItemRows.getIndexByAlias(rowAlias);
			Backbone.trigger('call:mainContainer', function(container) {
				mainContainer = container;
			});
			this.rowIndex = rowIndex;
			this.colIndex = colIndex;
			this.mainContainer = mainContainer;
			this.showState = true;

			left = this.getAbsoluteLeft();
			top = this.getAbsoluteTop();
			this.$el.css({
				'left': left,
				'top': top
			});
			this.$el.focus();
		},
		/**
		 * 隐藏输入框
		 */
		hide: function() {
			this.showState = false;
			this.$el.css({
				'left': 0,
				'top': 0,
				'width': 0,
				'height': 0
			});
			this.$el.focus();
		},
		/**
		 * 横向移动输入框
		 */
		transverseScroll: function() {
			var left;
			if (this.showState === true) {
				left = this.getAbsoluteLeft();
				this.$el.css({
					'left': left
				});
			}
		},
		/**
		 * 纵向移动输入框
		 */
		verticalScroll: function() {
			var top;
			if (this.showState === true) {
				top = this.getAbsoluteTop();
				this.$el.css({
					'top': top
				});
			}
		},
		/**
		 * 获取输入框left坐标
		 * @param  {object} mainContainer mainContainer
		 * @param  {number} colIndex 选中区域列索引
		 */
		getAbsoluteLeft: function(mainContainer, colIndex) {
			var outLeft,
				scrollLeft,
				userViewLeft,
				userViewIndex,
				frozenColIndex,
				headItemLeft,
				result;

			colIndex = this.colIndex;
			mainContainer = this.mainContainer;

			outLeft = config.System.outerLeft;
			scrollLeft = mainContainer.$el.scrollLeft();
			headItemLeft = headItemCols.models[colIndex].get('left');

			if (cache.TempProp.colFrozen) { //冻结情况
				frozenColIndex = headItemCols.getIndexByAlias(cache.TempProp.colAlias);
				if (frozenColIndex > colIndex) {
					scrollLeft = 0;
				}
				userViewIndex = headItemCols.getIndexByAlias(cache.UserView.colAlias);
				userViewLeft = headItemCols.models[userViewIndex].get('left');
				result = headItemLeft - userViewLeft + outLeft - scrollLeft + 1;
				return result;
			} else { //非冻结情况
				result = headItemLeft + outLeft - scrollLeft + 1;
				return result;
			}
		},
		getAbsoluteTop: function() {
			var outTop,
				scrollTop,
				userViewTop,
				userViewIndex,
				frozenRowIndex,
				mainContainer,
				rowIndex,
				headItemTop,
				result;

			rowIndex = this.rowIndex;
			mainContainer = this.mainContainer;

			outTop = config.System.outerTop;
			scrollTop = mainContainer.$el.scrollTop();
			headItemTop = headItemRows.models[rowIndex].get('top');

			if (cache.TempProp.colFrozen) { //冻结情况
				frozenRowIndex = headItemRows.getIndexByAlias(cache.TempProp.rowAlias);
				if (frozenRowIndex > rowIndex) {
					scrollTop = 0;
				}
				userViewIndex = headItemRows.getIndexByAlias(cache.UserView.rowAlias);
				userViewTop = headItemRows.models[userViewIndex].get('top');
				result = headItemTop - userViewTop + outTop - scrollTop + 1;
				return result;
			} else { //非冻结情况
				result = headItemTop + outTop - scrollTop + 1;
				return result;
			}
		},
		/**
		 * 视图显示函数
		 * @method render
		 */
		render: function() {
			this.$el.css({
				'width': 20,
				'height': 18,
				'left': 0,
				'top': 0,
				'z-index': 10000,
				'background-color': 'grey'
			});
			return this;
		},
		/**
		 * 自适应输入框的大小
		 */
		adapt: function() {
			// this.adjustWidth();
			// this.adjustHight();
		},
		/**
		 * 调整输入框高度
		 */
		adjustHight: function() {
			var height,
				cellHeight,
				fontSize,
				width,
				text;
			text = this.$el.val();
			fontSize = this.model.get("content").size;
			width = this.model.get("physicsBox").width;
			height = getTextBox.getTextHeight(text, this.model.get("wordWrap"), fontSize, width);
			cellHeight = this.model.get("physicsBox").height;
			height = height > cellHeight ? height : cellHeight;
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
			var text, currentTexts,
				headLineRowModelList,
				headLineColModelList,
				modelIndexCol,
				modelIndexRow,
				startAliasCol,
				startAliasRow;
			text = this.$el.val();
			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;
			modelIndexCol = binary.modelBinary(this.model.get('physicsBox').left,
				headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
			modelIndexRow = binary.modelBinary(this.model.get('physicsBox').top,
				headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);

			startAliasCol = headLineColModelList[modelIndexCol].get('alias');
			startAliasRow = headLineRowModelList[modelIndexRow].get('alias');
			this.model.set('content.texts', text);
			text = textTypeHandler.textTypeRecognize(this.model);

			send.PackAjax({
				url: 'text.htm?m=data',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					coordinate: {
						startX: startAliasCol,
						startY: startAliasRow
					},
					content: encodeURIComponent(text)
				})
			});

			//ps：增加设置显示内容
			if (text.indexOf("\n") > 0 && (this.model.get('wordWrap') === false)) {
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

			if (this.showState === undefined || this.showState === false) {
				this.showState === true;
				this.show();
			}

			keyboard = config.keyboard;
			isShortKey = this.isShortKey(e.keyCode);
			if (isShortKey) {
				if (e.keyCode === keyboard.enter) {
					if (config.shortcuts.enter && e.altKey === false) {
						Backbone.trigger('event:mainContainer:nextCellPosition', 'DOWN');
						Backbone.trigger('event:cellsContainer:selectRegionChange', 'DOWN');
						this.close();
					} else if (config.shortcuts.altEnter && e.altKey) {
						insertAtCursor('\n');
						// this.adjustHight();
						return;
					}
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
			Backbone.off('event:InputContainer:show');
			Backbone.off('event:InputContainer:hide');
			this.remove();
		}
	});
	return InputContainer;
});