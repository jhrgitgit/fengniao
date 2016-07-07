define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		getTextBox = require('basic/tools/gettextbox'),
		util = require('basic/util/clone'),
		config = require('spreadsheet/config'),
		binary = require('basic/util/binary'),
		send = require('basic/tools/send'),
		Cell = require('models/cell'),
		siderLineRows = require('collections/siderLineRow'),
		siderLineCols = require('collections/siderLineCol'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		setTextType = require('entrance/tool/settexttype'),
		clipSelectOperate = require('entrance/tool/clipselectoperate'),
		clipPasteOperate = require('entrance/tool/clippasteoperate'),
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
			'keydown': 'keypressHandle',
			'blur': 'hide',
			'copy': 'copyData',
			'paste': 'pasteData',
			'cut': 'cutData'
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
		 * @param  {Boolean} dblclick 是否为双击进入输入框
		 */
		show: function(dblclick) {
			var mainContainer,
				modelJSON,
				rowAlias,
				colAlias,
				colIndex,
				rowIndex,
				scrollTop,
				scrollLeft,
				offsetTop,
				offsetLeft,
				select,
				clip,
				left,
				top,
				width,
				height,
				cell;

			clip = selectRegions.getModelByType('clip')[0];
			if (clip !== undefined) {
				cache.clipState = 'null';
				clip.destroy();
			}
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
			cell = cells.getRegionCells(colIndex, rowIndex)[0];
			if (cell === null) {
				cell = this.createCell(rowIndex, colIndex);
			}
			this.model = cell;
			this.showState = true;
			left = this.getAbsoluteLeft();
			top = this.getAbsoluteTop();
			this.adjustZIndex();
			this.adjustWidth();
			this.adjustHeight();
			if (dblclick === false) {
				this.model.set('content.texts', '');
			}
			modelJSON = this.model.toJSON();
			if (modelJSON.content.bd === true) {
				this.$el.css({
					'font-weight': 'bold'
				});
			} else {
				this.$el.css({
					'font-weight': 'normal'
				});
			}
			if (modelJSON.content.italic === true) {
				this.$el.css({
					'font-style': 'italic'
				});
			} else {
				this.$el.css({
					'font-style': 'normal'
				});
			}
			this.$el.css({
				'width': modelJSON.physicsBox.width,
				'height': modelJSON.physicsBox.height - 2,
				'color': modelJSON.content.color,
				'font-size': modelJSON.content.size + 'pt',
				'font-family': modelJSON.content.family,
				'left': left,
				'top': top,
			})
			if (dblclick !== false) {
				this.$el.val(modelJSON.content.texts);
			}
			this.adjustWidth();
			this.adjustHeight();
		},
		/**
		 * 粘贴监听事件
		 * @method pasteData
		 */
		pasteData: function(event) {
			if (this.showState === false) {
				event.preventDefault();
				var pasteText;
				if (window.clipboardData && window.clipboardData.getData) { // IE
					pasteText = window.clipboardData.getData('Text');
				} else {
					pasteText = event.originalEvent.clipboardData.getData('Text'); //e.clipboardData.getData('text/plain');
				}
				clipPasteOperate(pasteText);
			}
		},
		copyData: function(event) {
			if (this.showState === false) {
				clipSelectOperate("copy", event);
			}
		},
		cutData: function(event) {
			if (this.showState === false) {
				clipSelectOperate("cut", event);
			}
		},
		/**
		 * 创建单元格
		 * @method createCell
		 * @param  {num} indexRow 行索引
		 * @param  {num} indexCol 列索引
		 * @return {Cell} cell 单元格对象
		 */
		createCell: function(indexRow, indexCol) {
			var cacheCell,
				aliasCol,
				aliasRow,
				gridLineColList,
				gridLineRowList;

			gridLineColList = headItemCols.models;
			gridLineRowList = headItemRows.models;
			aliasCol = gridLineColList[indexCol].get('alias');
			aliasRow = gridLineRowList[indexRow].get('alias');
			var top, left, width, height;
			top = gridLineRowList[indexRow].get('top');
			left = gridLineColList[indexCol].get('left');
			width = gridLineColList[indexCol].get('width');
			height = gridLineRowList[indexRow].get('height');
			cacheCell = new Cell();
			cacheCell.set('occupy', {
				x: [aliasCol],
				y: [aliasRow]
			});
			cacheCell.set('physicsBox', {
				top: top,
				left: left,
				width: width,
				height: height
			});
			cache.cachePosition(aliasRow, aliasCol, cells.length);
			cells.add(cacheCell);
			return cacheCell;
		},
		/**
		 * 隐藏输入框
		 */
		hide: function(event) {
			if (this.showState === true) {
				this.$el.css({
					'left': -1000,
					'top': -1000,
					'width': 0,
					'height': 0,
					'z-index': -100
				});
				this.model.set('content.texts', this.$el.val());
				this.sendData();
			}
			this.$el.val('');
			if (event === undefined) {
				this.$el.focus();
			}
			if (this.model !== undefined) {
				setTextType.textTypeRecognize(this.model);
			}
			this.showState = false;
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
		 * 输入内容时，输入框位于显示区域外，自动滚动回显示区
		 */
		autoScrollLeft: function() {
			var scrollBarWidth,
				right,
				limitRight,
				scrollLeft,
				differ;
			scrollBarWidth = this.mainContainer.$el[0].offsetWidth - this.mainContainer.$el[0].clientWidth;
			right = this.$el.position().left + this.$el.width();
			limitRight = this.$el.parent()[0].clientWidth - scrollBarWidth;
			differ = limitRight - right;
			if (differ < 0) {
				scrollLeft = this.mainContainer.$el.scrollLeft();
				this.mainContainer.$el.scrollLeft(scrollLeft - differ);
			}
		},
		/**
		 * 输入内容时，输入框位于显示区域外，自动滚动回显示区
		 */
		autoScrollTop: function() {
			var scrollBarHeight,
				bottom,
				limitBottom,
				scrollTop,
				differ;
			scrollBarHeight = this.mainContainer.$el[0].offsetHeight - this.mainContainer.$el[0].clientHeight;
			bottom = this.$el.position().top + this.$el.height();
			limitBottom = this.$el.parent()[0].clientHeight - scrollBarHeight;
			differ = limitBottom - bottom;
			if (differ < 0) {
				scrollTop = this.mainContainer.$el.scrollTop() - differ;
				this.mainContainer.$el.scrollTop(scrollTop);
			}
		},
		/**
		 * 获取输入框left坐标
		 * @param  {object} mainContainer mainContainer
		 * @param  {number} colIndex 选中区域列索引
		 */
		getAbsoluteLeft: function() {
			var outLeft,
				scrollLeft,
				userViewLeft,
				userViewIndex,
				frozenColIndex,
				headItemLeft,
				mainContainer,
				colIndex,
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
		adjustZIndex: function() {
			var colIndex,
				rowIndex,
				frozenColIndex,
				frozenRowIndex;

			colIndex = this.colIndex;
			rowIndex = this.rowIndex;

			if (cache.TempProp.colFrozen && cache.TempProp.rowFrozen) { //冻结情况
				frozenColIndex = headItemCols.getIndexByAlias(cache.TempProp.colAlias);
				frozenRowIndex = headItemRows.getIndexByAlias(cache.TempProp.rowAlias);
				if (frozenColIndex > colIndex && frozenRowIndex > rowIndex) {
					this.$el.css({
						'z-index': '15'
					});
				} else if (frozenColIndex > colIndex || frozenRowIndex > rowIndex) {
					this.$el.css({
						'z-index': '12'
					});
				} else {
					this.$el.css({
						'z-index': '9'
					});
				}
			} else if (cache.TempProp.colFrozen) {
				frozenColIndex = headItemCols.getIndexByAlias(cache.TempProp.colAlias);
				if (frozenColIndex > colIndex) {
					this.$el.css({
						'z-index': '12'
					});
				} else {
					this.$el.css({
						'z-index': '9'
					});
				}
			} else if (cache.TempProp.rowFrozen) {
				frozenRowIndex = headItemRows.getIndexByAlias(cache.TempProp.rowAlias);
				if (frozenRowIndex > rowIndex) {
					this.$el.css({
						'z-index': '12'
					});
				} else {
					this.$el.css({
						'z-index': '9'
					});
				}
			} else { //非冻结情况
				this.$el.css({
					'z-index': '9'
				});
			}
		},
		/**
		 * 视图显示函数
		 * @method render
		 */
		render: function() {
			this.hide();
			return this;
		},
		/**
		 * 自适应输入框的大小
		 */
		adapt: function() {
			if (this.showState === true) {
				this.adjustWidth();
				this.adjustHeight();
			} else {
				if (this.keyHandle() === false) {
					return;
				}
				this.showState === true;
				this.show(false);
			}
			//未显示输入框时,输入字符处理
			// if (this.showState === undefined || this.showState === false) {

			// }
		},
		/**
		 * 调整输入框高度
		 */
		adjustHeight: function() {
			var height,
				scrollBarHeight,
				limitHeight,
				cellHeight,
				fontSize,
				width,
				text;

			scrollBarHeight = this.mainContainer.$el[0].offsetHeight - this.mainContainer.$el[0].clientHeight;
			limitHeight = this.$el.parent().height() - this.$el.position().top - scrollBarHeight;

			text = this.$el.val();
			fontSize = this.model.get("content").size;
			width = this.$el.width();

			height = getTextBox.getTextHeight(text, this.model.get("wordWrap"), fontSize, width);
			cellHeight = this.model.get("physicsBox").height;
			if (height < cellHeight || height > limitHeight) {
				return cellHeight;
			} else {
				this.$el.css("height", height);
				return height;
			}
		},
		/**
		 * 调整输入框宽度
		 * @method adjustWidth
		 * @param e {event} propertychange函数
		 */
		adjustWidth: function() {
			var text = '',
				texts,
				inputText,
				tempDiv,
				currentWidth,
				scrollBarWidth,
				fontSize,
				tempDivWidth,
				limitWidth,
				len, i;
			//不能超出当前显示区域
			scrollBarWidth = this.mainContainer.$el[0].offsetWidth - this.mainContainer.$el[0].clientWidth;
			limitWidth = this.$el.parent().width() - this.$el.position().left - scrollBarWidth;


			if (this.model.get("wordWrap") === true) return;
			inputText = this.$el.val();
			texts = inputText.split('\n');
			len = texts.length;
			for (i = 0; i < len; i++) {
				text += texts[i];
				if (i !== len - 1) {
					text += '<br>';
				}
			}

			/**
			 * 宽度计算
			 * @type {[type]}
			 */
			tempDiv = $('<div/>').html(text);
			fontSize = this.model.get("content").size;
			tempDiv.css({
				"display": "none",
				"font-size": fontSize
			});
			$('body').append(tempDiv);
			currentWidth = parseInt(this.$el.width(), 0);
			tempDivWidth = tempDiv.width();
			if (currentWidth < tempDivWidth &&
				this.model.get('physicsBox').width < tempDivWidth &&
				tempDivWidth + 10 < limitWidth) {
				this.$el.width(tempDivWidth + 10);
			}
			tempDiv.remove();
		},
		/**
		 * 输入框移除输入焦点，视图销毁
		 * @method close
		 * @param e {event}  输入焦点移除
		 */
		sendData: function() {
			var text,
				colAlias,
				rowAlias;


			text = this.$el.val();
			colAlias = this.model.get('occupy').x[0];
			rowAlias = this.model.get('occupy').y[0];


			send.PackAjax({
				url: 'text.htm?m=data',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					coordinate: {
						startX: colAlias,
						startY: rowAlias
					},
					content: encodeURIComponent(text)
				})
			});

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
							startX: colAlias,
							startY: rowAlias,
						},
						wordWrap: true
					})
				});
			}
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
		keypressHandle: function(e) {
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

			//处理用户输入回车键
			if (isShortKey) {
				if (config.shortcuts.enter &&
					e.altKey === false &&
					e.keyCode === keyboard.enter) {
					Backbone.trigger('event:mainContainer:nextCellPosition', 'DOWN');
					Backbone.trigger('event:cellsContainer:selectRegionChange', 'DOWN');
					if (this.showState === true) {
						this.hide();
					}
					e.preventDefault();
					return;
				};
			}
			if (this.showState === true) {
				//内部换行处理
				if (isShortKey) {
					if (config.shortcuts.altEnter && e.altKey) {
						insertAtCursor('\n');
						this.adjustHeight();
						return;
					};
				}
				this.autoScrollLeft();
				this.autoScrollTop();
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
		 * 判断未显示输入框时，点击按键是否填出输入框
		 * @param  {[type]} e 键盘点击事件
		 */
		keyHandle: function() {
			var flag = true,
				charcode,
				inputChar,
				regular;
			// if (e.ctrlKey === true || e.altKey === true) {
			// 	return false;
			// }
			// console.log(this.$el);
			// charcode = typeof e.charCode == 'number' ? e.charCode : e.keyCode;
			// charcode = e.keyCode;
			// console.log(e);
			// console.log(String.fromCharCode(e.which));
			// inputChar = String.fromCharCode(e.keyCode);
			// 
			// console.log(inputChar);
			regular = /[a-zA-Z0-9]/;
			inputChar = this.$el.val();
			if (regular.test(inputChar)) {
				return true;
			} else {
				this.$el.val('');
				return false;
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