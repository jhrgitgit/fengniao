// beacause of we used nested model ,but backbone not support nested lsitenTo .
// so listenTo nested model didn't done.


define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		Handlebars = require('lib/handlebars'),
		Backbone = require('lib/backbone'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		selectRegions = require('collections/selectRegion'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache'),
		send = require('basic/tools/send'),
		getTextBox = require('basic/tools/gettextbox'),
		setCellHeight = require('entrance/cell/setCellHeight');

	/**
	 * 单元格视图类，用于显示单元格对象
	 * @author ray wu
	 * @since 0.1.0
	 * @class CellContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var CellContainer = Backbone.View.extend({
		/**
		 * 单元格标签class属性
		 * @property className  
		 * @type {string}
		 */
		className: 'item',
		/**
		 * 监听model事件
		 * @method initialize 
		 */
		initialize: function(options) {
			var modelRowList = headItemRows,
				modelColList = headItemCols;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'change:isDestroy', this.destroy);
			this.listenTo(this.model, 'destroy', this.modelDestroy);
			// this.listenTo(this.model, 'destroy', this.render);
			this.currentRule = options.currentRule;
			if (cache.TempProp.isFrozen !== true || this.currentRule.displayPosition.endRowIndex === undefined) {
				this.listenTo(this.model, 'change:showState', this.changeShowState);
			}
			this.currentRule = options.currentRule;
			this.offsetLeft = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetLeft || 0) : 0;
			this.offsetTop = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetTop || 0) : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? modelColList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			this.userViewTop = cache.TempProp.isFrozen ? modelRowList.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
		},
		/**
		 * 渲染单元格
		 * @method render 
		 */
		render: function() {
			var modelJSON = this.model.toJSON(),
				clipRegion;
			/**
			 * 设置模板
			 * @property template
			 * @type {html}
			 */
			clipRegion = selectRegions.getModelByType("clip")[0];
			if (clipRegion !== undefined) {
				clipRegion.destroy();
			}
			this.template = Handlebars.compile($('#tempItemCell').html());
			// this.$el.removeAttr('style');
			this.$el.css({
				'width': modelJSON.physicsBox.width,
				'height': modelJSON.physicsBox.height,
				'left': modelJSON.physicsBox.left - this.offsetLeft - this.userViewLeft - 1,
				'top': modelJSON.physicsBox.top - this.offsetTop - this.userViewTop - 1
			}).html(this.template(modelJSON));

			// this is improve poiont , marinottejs itemview function can be replace this bug
			this.$contentBody = $('.bg', this.$el);
			//end

			this.editStatus(modelJSON);
			this.changeTopBorder(modelJSON);
			this.changeLeftBorder(modelJSON);
			this.changeBottomBorder(modelJSON);
			this.changeRightBorder(modelJSON);
			this.changeBackground(modelJSON);
			this.setTransverseAlign(modelJSON);
			this.setVerticalAlign(modelJSON);
			this.setBold(modelJSON);
			this.setItalic(modelJSON);
			this.setFontColor(modelJSON);
			this.setFont(modelJSON);
			this.setFontSize(modelJSON);
			this.wordWrap(modelJSON);
			this.changeTexts(modelJSON);
			return this;
		},
		/**
		 * 更新单元格显示状态
		 * @method changeShowState 
		 */
		changeShowState: function() {
			if (this.model.get('showState') === false) {
				this.remove();
			}
		},
		getDisplayText: function(modelJSON, text) {
			var fontsize = modelJSON.content.size,
				occupyX = modelJSON.occupy.x,
				occupyY = modelJSON.occupy.y,
				headModelCol,
				headModelRow,
				inputText,
				texts,
				i = 0,
				height;
			inputText = text;
			if (text.indexOf("\n") > 0 && (this.model.get('content').wordWrap === false)) {
				this.model.set({
					'content.wordWrap': true
				});
			}
			texts = text.split('\n');
			text = '';
			if (this.model.get('content').wordWrap === false) {
				for (i = 0; i < texts.length; i++) {
					text += texts[i];
				}
			} else {
				for (i = 0; i < texts.length; i++) {
					text += texts[i] + '<br>';
				}
			}


			if (occupyX.length > 1 || occupyY.length > 1) return text;
			if (this.model.get("content").wordWrap === true && occupyX.length === 1 && occupyY.length === 1) {
				headModelCol = headItemCols.getModelByAlias(occupyX[0]);
				headModelRow = headItemRows.getModelByAlias(occupyY[0]);
				height = getTextBox.getTextHeight(inputText, true, fontsize, headModelCol.get('width'));

				if (height > 17 && headModelRow.get('height') < height) setCellHeight('sheetId', headModelRow.get('displayName'), height);
			}
			return text;
		},
		/**
		 * 设置单元格背景颜色
		 * @method setFontColor 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		setFontColor: function(modelJSON) {
			if (modelJSON.content.color !== '') {
				this.$el.css({
					"color": modelJSON.content.color
				});
			}

		},
		/**
		 * 设置单元格内容字体
		 * @method setFont 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		setFont: function(modelJSON) {
			if (modelJSON.content.family !== '') {
				this.$el.css({
					"font-family": modelJSON.content.family
				});
			}
		},
		/**
		 * 设置单元格内容字体大小
		 * @method setFontSize 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		setFontSize: function(modelJSON) {
			if (modelJSON.content.size !== '') {
				this.$el.css({
					"font-size": modelJSON.content.size
				});
			}
		},
		/**
		 * 设置单元格内容斜体
		 * @method setItalic 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		setItalic: function(modelJSON) {
			if (modelJSON.content.italic) {
				this.$el.css({
					'font-style': 'italic'
				});
			} else {
				this.$el.css({
					'font-style': 'normal'
				});
			}
		},
		/**
		 * 设置单元格内容粗体
		 * @method setBold 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		setBold: function(modelJSON) {
			if (modelJSON.content.bd) {
				this.$el.css({
					'font-weight': 'bold'
				});
			} else {
				this.$el.css({
					'font-weight': 'normal'
				});
			}

		},
		/**
		 * 设置单元格内容水平对齐方式
		 * @method setTransverseAlign 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		setTransverseAlign: function(modelJSON) {
			var alignRowPosi = modelJSON.content.alignRow;
			if (alignRowPosi === 'center' || alignRowPosi === 'right') {
				this.$el.css({
					'text-align': alignRowPosi
				});
				return;
			}
			this.$el.css({
				'text-align': 'left'
			});
		},
		/**
		 * 设置单元格内容水平对齐方式
		 * @method setVerticalAlign 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		setVerticalAlign: function(modelJSON) {
			// console.log(modelJSON.content.alignCol);
			// console.log(modelJSON.content.alignRow);
			if (modelJSON.content.alignCol === 'middle') {
				this.$el.children('div').css({
					"vertical-align": "middle",
				});
			} else if (modelJSON.content.alignCol === 'bottom') {
				this.$el.children('div').css({
					"vertical-align": "bottom"
				});
			} else {
				this.$el.children('div').css({
					"vertical-align": "top"
				});
			}
		},
		/**
		 * 设置单元格文本格式
		 * @method getModelDisplayTexts 
		 */
		getFormatTexts: function() {
			//获取当前文本

			var modelJSON = this.model.toJSON(),
				cellContent = modelJSON.content.texts,
				cellFormat = modelJSON.customProp.format,
				displayContent = '',
				texts, i = 0;
			//ps:设置显示文本
			switch (cellFormat) {
				case 'num':
					displayContent = this.contentToDigital();
					break;
				case 'time':
					displayContent = this.contentToDate();
					break;
				default:
					displayContent = this.contentToText();
					break;
			}
			return displayContent;
		},
		/**
		 * 转换单元格内容格式为数字
		 * @method contentToDigital 
		 */
		contentToDigital: function() {
			var modelJSON = this.model.toJSON(),
				cellContent = modelJSON.content.texts,
				cellAlignRow = modelJSON.content.alignRow,
				//校验是否而合法数字
				digitalReg = new RegExp(/^(-?\d+)(\.\d+)?$/),
				tempValue;

			if (digitalReg.test(cellContent) === false) {
				return this.contentToText();
			}

			//去除为0的首字母
			if (/^0\./.test(cellContent) === false) {
				cellContent = cellContent.replace(/\b(0+)/gi, '');
				this.model.set('content.texts', cellContent);
			}

			//数字格式文本右对齐
			if (cellAlignRow === undefined || cellAlignRow === '') {
				this.$el.css({
					'text-align': 'right'
				});
			}
			tempValue = Number(cellContent);
			return tempValue.toFixed(2);
		},
		/**
		 * 转换单元格内容格式为日期
		 * @method contentToDate 
		 * @param cellContent {string} 文本
		 */
		contentToDate: function() {
			var modelJSON = this.model.toJSON(),
				cellContent = modelJSON.content.texts,
				cellAlignRow = modelJSON.content.alignRow;
			var result = cellContent.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);

			if (result === null) {
				return this.contentToText();
			}
			var tempDate = new Date(result[1], result[3] - 1, result[4]);
			if (tempDate.getFullYear() == result[1] && (tempDate.getMonth() + 1) == result[3] && tempDate.getDate() == result[4]) {
				//时间格式文本右对齐
				if (cellAlignRow === undefined || cellAlignRow === '') {
					this.$el.css({
						'text-align': 'right'
					});
				}
				return result[1] + '/' + result[3] + '/' + result[4];
			} else {
				return this.contentToText();
			}
		},
		/**
		 * 转换单元格内容格式为文本
		 * @method contentToDate 
		 */
		contentToText: function() {
			var modelJSON,
				cellContent,
				cellAlignRow;

			modelJSON = this.model.toJSON();
			cellContent = modelJSON.content.texts;
			cellAlignRow = modelJSON.content.alignRow;
			//文本左对齐
			if (cellAlignRow === undefined || cellAlignRow === '') {
				this.$el.css({
					'text-align': 'left'
				});
			}
			return cellContent;
		},
		editStatus: function(modelJSON) {},
		/**
		 * 渲染上边框
		 * @method changeTopBorder 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		changeTopBorder: function(modelJSON) {
			if (modelJSON.border.top) {
				this.$el.css({
					'borderTopColor': '#000'
				});
			} else {
				this.$el.css({
					'borderTopColor': 'transparent'
				});
			}
		},
		/**
		 * 渲染左边框
		 * @method changeLeftBorder 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		changeLeftBorder: function(modelJSON) {
			if (modelJSON.border.left) {
				this.$el.css({
					'borderLeftColor': '#000'
				});
			} else {
				this.$el.css({
					'borderLeftColor': 'transparent'
				});
			}
		},
		/**
		 * 渲染下边框边框
		 * @method changeBottomBorder 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		changeBottomBorder: function(modelJSON) {
			if (modelJSON.border.bottom) {
				this.$el.css({
					'borderBottomColor': '#000'
				});
			} else {
				this.$el.css({
					'borderBottomColor': 'transparent'
				});
			}
		},
		/**
		 * 渲染右边框边框
		 * @method changeRightBorder 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		changeRightBorder: function(modelJSON) {
			if (modelJSON.border.right) {
				this.$el.css({
					'borderRightColor': '#000'
				});
			} else {
				this.$el.css({
					'borderRightColor': 'transparent'
				});
			}
		},
		/**
		 * 渲染单元格背景
		 * @method changeBackground 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		changeBackground: function(modelJSON) {
			if (modelJSON.customProp.background !== '') {
				this.$contentBody.css({
					'backgroundColor': modelJSON.customProp.background
				});
			} else {
				this.$contentBody.css({
					'backgroundColor': '#fff'
				});
			}
		},
		wordWrap: function(modelJSON) {
			if (modelJSON.content.wordWrap === true) {
				this.$contentBody.css({
					'word-break': 'break-all'
				});
			} else {
				this.$contentBody.css({
					'white-space': 'nowrap'
				});
			}
		},
		/**
		 * 更新文本内容
		 * @method changeTexts 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		changeTexts: function(modelJSON) {
			this.$contentBody.html(this.getDisplayText(modelJSON, this.getFormatTexts()));
		},
		/**
		 * 显示输入框，编辑文本内容
		 * @method editting 
		 */
		editting: function() {
			var inputContainer = new app.View.InputContainer({
				model: model
			});
			this.$cellsContainer.append(inputContainer.render().el);

			inputContainer.$el.focus();
		},
		/**
		 * 移除视图
		 * @method destroy 
		 */
		destroy: function() {
			if (this.model.get('isDestroy')) {
				this.remove();
			}
		},
		modelDestroy: function() {
			this.remove();
		}
	});
	return CellContainer;
});