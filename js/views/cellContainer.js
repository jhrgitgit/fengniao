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
		cache = require('basic/tools/cache'),
		config = require('spreadsheet/config'),
		getTextBox = require('basic/tools/gettextbox'),
		setCellHeight = require('entrance/cell/setcellheight'),
		textTypeHandler = require('entrance/tool/settexttype'),
		CellContainer;

	/**
	 * 单元格视图类，用于显示单元格对象
	 * @author ray wu
	 * @since 0.1.0
	 * @class CellContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	CellContainer = Backbone.View.extend({
		/**
		 * 单元格标签class属性
		 * @property className  
		 * @type {string}
		 */
		className: 'item',
		events: {
			'mouseenter': 'overCellView',
			'mouseleave': 'outCellView'
		},
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

			this.listenTo(this.model, 'change:commentShowState', this.commentViewHandler);

			this.currentRule = options.currentRule;
			if (cache.TempProp.isFrozen !== true ||
				this.currentRule.displayPosition.endRowIndex === undefined) {
				this.listenTo(this.model, 'change:showState', this.changeShowState);
			}
			this.currentRule = options.currentRule;
			this.offsetLeft = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetLeft || 0) : 0;
			this.offsetTop = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetTop || 0) : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? modelColList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			this.userViewTop = cache.TempProp.isFrozen ? modelRowList.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			_.bindAll(this, 'showComment', 'hideComment');
		},
		overCellView: function() {
			var self = this;
			this.overEvent = setTimeout(function() {
				if ($('.comment').length === 0) {
					if (self.model.get('customProp').comment !== null &&
						self.model.get('customProp').comment !== undefined) {
						self.showComment();
					}
				}
			}, 1000);
		},
		outCellView: function() {
			this.hideComment();
			clearTimeout(this.overEvent);
		},
		commentViewHandler: function() {
			if (this.model.get('commentShowState') === true) {
				this.showComment();
			} else {
				this.hideComment();
			}
		},
		/**
		 * 显示备注视图
		 */
		showComment: function() {
			this.newCommentView();
		},

		newCommentView: function() {
			//ps:修改
			var rowAlias,
				colAlias,
				rowIndex,
				colIndex,
				occupy = this.model.get('occupy'),
				comment = this.model.get('customProp').comment,
				options;
			if (cache.commentState) {
				return;
			}

			rowAlias = occupy.y[0];
			colAlias = occupy.x[occupy.x.length - 1];
			rowIndex = headItemRows.getIndexByAlias(rowAlias);
			colIndex = headItemCols.getIndexByAlias(colAlias);
			//冻结问题
			options = {
				colIndex: colIndex,
				rowIndex: rowIndex,
				comment: comment,
				state: 'show'
			};
			Backbone.trigger('event:commentContainer:show', options);
		},
		hideComment: function() {
			clearTimeout(this.overEvent);
			if (cache.commentState) {
				return;
			}
			Backbone.trigger('event:commentContainer:remove');
		},
		/**
		 * 渲染单元格
		 * @method render 
		 */
		render: function() {
			var modelJSON = this.model.toJSON();

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
			this.getFormatText(modelJSON);
			this.changeTexts(modelJSON);
			this.showCommentSign(modelJSON);
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
		/**
		 * 显示备注标记
		 * @param  {object} modelJSON showCommentSign
		 */
		showCommentSign: function(modelJSON) {
			if (modelJSON.customProp.comment !== null &&
				modelJSON.customProp.comment !== undefined) {
				this.$el.prepend('<div class="comment-ico"><div class="triangle"></div></div>');
			}
		},

		/**
		 * 根据不同单元格类型，生成不同displaytext
		 * @return {[type]} [description]
		 */
		getFormatText: function(modelJSON) {
			var text = modelJSON.content.texts,
				format = modelJSON.customProp.format,
				decimal = modelJSON.customProp.decimal,
				thousands = modelJSON.customProp.thousands || false,
				dateFormat = modelJSON.customProp.dateFormat,
				currencySign = modelJSON.customProp.currencySign,
				isValid = modelJSON.customProp.isValid,
				displayTexts;
			
			switch (format) {
				case 'normal':
					if (textTypeHandler.isNum(text)) {
						decimal = textTypeHandler.getNoZeroDecimal(text);
						decimal = decimal < 6 ? decimal : 6;
						this.model.set("content.displayTexts", textTypeHandler.getFormatNumber(text, thousands, decimal));
					} else {
						this.model.set("content.displayTexts", text);
					}
					break;
				case 'text':
					this.model.set("content.displayTexts", text);
					break;
				case 'date':
					if (isValid) {
						this.model.set("content.displayTexts", textTypeHandler.getFormatDate(text, dateFormat));
					} else {
						this.model.set("content.displayTexts", text);
					}
					break;
				case 'number':
					if (isValid) {
						this.model.set("content.displayTexts", textTypeHandler.getFormatNumber(text, thousands, decimal));
					} else {
						this.model.set("content.displayTexts", text);
					}
					break;
				case 'currency':
					if (isValid) {
						this.model.set("content.displayTexts", textTypeHandler.getFormatCoin(text, decimal, currencySign));
					} else {
						this.model.set("content.displayTexts", text);
					}
					break;
				case 'percent':
					if (isValid) {
						this.model.set("content.displayTexts", textTypeHandler.getFormatPercent(text, decimal));
					} else {
						this.model.set("content.displayTexts", text);
					}
					break;
				default:
					break;
			}
		},
		getDisplayText: function(modelJSON) {
			var fontsize = modelJSON.content.size,
				occupyX = modelJSON.occupy.x,
				occupyY = modelJSON.occupy.y,
				headModelCol,
				headModelRow,
				inputText,
				texts,
				text,
				temp,
				i = 0,
				height;
			text = modelJSON.content.displayTexts;
			temp = text;
			texts = text.split('\n');
			text = '';
			if (this.model.get('wordWrap') === false) {
				for (i = 0; i < texts.length; i++) {
					text += texts[i];
				}
			} else {
				for (i = 0; i < texts.length; i++) {
					text += texts[i] + '<br>';
				}
			}

			if (occupyX.length > 1 || occupyY.length > 1) return text;

			//冻结情况，不进行自动宽高调整
			//备注：需要代码调整
			if (this.model.get("wordWrap") === true) {
				headModelCol = headItemCols.getModelByAlias(occupyX[0]);
				headModelRow = headItemRows.getModelByAlias(occupyY[0]);
				height = getTextBox.getTextHeight(temp, true, fontsize, headModelCol.get('width'));
				if (height > 17 && headModelRow.get('height') < height) {

					setCellHeight('sheetId', headModelRow.get('displayName'), height);
					if (cache.TempProp.isFrozen) {
						Backbone.trigger('event:bodyContainer:executiveFrozen');
					};
				}
			} else {
				//处理设置字体问题
				headModelCol = headItemCols.getModelByAlias(occupyX[0]);
				headModelRow = headItemRows.getModelByAlias(occupyY[0]);
				height = getTextBox.getTextHeight('', false, fontsize);
				if (height > 17 && headModelRow.get('height') < height) {

					setCellHeight('sheetId', headModelRow.get('displayName'), height);
					if (cache.TempProp.isFrozen) {
						Backbone.trigger('event:bodyContainer:executiveFrozen');
					};
				}
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
				this.$contentBody.css({
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
				this.$contentBody.css({
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
				this.$contentBody.css({
					"font-size": modelJSON.content.size + 'pt'
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
				this.$contentBody.css({
					'font-style': 'italic'
				});
			} else {
				this.$contentBody.css({
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
				this.$contentBody.css({
					'font-weight': 'bold'
				});
			} else {
				this.$contentBody.css({
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
			var format = modelJSON.customProp.format,
				text = modelJSON.content.texts,
				isValid = modelJSON.customProp.isValid,
				alignRowPosi = modelJSON.content.alignRow;

			if (alignRowPosi === 'center' || alignRowPosi === 'right' || alignRowPosi === 'left') {
				this.$contentBody.css({
					'text-align': alignRowPosi
				});
				return;
			}
			if (format !== 'text' && format !== 'normal' && isValid === true) {
				this.$contentBody.css({
					'text-align': 'right'
				});
				return;
			}
			if (format === 'normal' && textTypeHandler.isNum(text)) {
				this.$contentBody.css({
					'text-align': 'right'
				});
				return;
			}
			this.$contentBody.css({
				'text-align': 'left'
			});
		},
		/**
		 * 设置单元格内容垂直对齐方式
		 * @method setVerticalAlign 
		 * @param modelJSON {modelJSON} 对象属性集合
		 */
		setVerticalAlign: function(modelJSON) {
			if (modelJSON.content.alignCol === 'middle') {
				this.$contentBody.css({
					"vertical-align": "middle",
				});
			} else if (modelJSON.content.alignCol === 'bottom') {
				this.$contentBody.css({
					"vertical-align": "bottom"
				});
			} else {
				this.$contentBody.css({
					"vertical-align": "top"
				});
			}
		},
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
			if (modelJSON.wordWrap === true) {
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
			this.$contentBody.html(this.getDisplayText(modelJSON));
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