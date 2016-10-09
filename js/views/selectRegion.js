define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		Handlebars = require('lib/handlebars'),
		util = require('basic/util/clone'),
		binary = require('basic/util/binary'),
		cache = require('basic/tools/cache'),
		send = require('basic/tools/send'),
		Cell = require('models/cell'),
		siderLineRows = require('collections/siderLineRow'),
		siderLineCols = require('collections/siderLineCol'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		cells = require('collections/cells'),
		SelectRegion;

	/**
	 * 选中区域视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class SelectRegion  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */

	SelectRegion = Backbone.View.extend({
		/**
		 * 设置class属性
		 * @property className
		 * @type {String}
		 */
		className: 'selected-container',
		/**
		 * 绑定鼠标事件
		 * @property events 
		 * @type {Object}
		 */
		events: {
			'dblclick': 'editState',
			'mousemove': 'showComment',
			'mouseout': 'hideComment'
		},
		/**
		 * 视图初始化函数
		 * @method initialize
		 */
		initialize: function(options) {
			this.viewCellsContainer = options.parentView;
			if (this.model.get("selectType") === "operation") {
				Backbone.on('event:selectRegion:patchOprCell', this.patchOprCell, this);
				Backbone.on('event:selectRegionContainer:adapt', this.adapt, this);
			}
			//添加视图
			this.listenTo(this.model, 'change', this.changePosition);
			this.listenTo(this.model, 'destroy', this.destroy);
			if (options.currentRule !== undefined) {
				this.currentRule = options.currentRule;
			} else {
				this.currentRule = util.clone(cache.CurrentRule);
			}
			this.userViewTop = cache.TempProp.isFrozen ? headItemRows.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? headItemCols.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			this.offsetLeft = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetLeft || 0) : 0;
			this.offsetTop = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetTop || 0) : 0;
		},
		/**
		 * 页面渲染方法
		 * @method render
		 */
		render: function() {
			this.changePosition();
			this.template = Handlebars.compile($('#tempSelectContainer').html());
			this.$el.html(this.template());
			return this;
		},
		/**
		 * 整行整列选中后，滚动自适应宽高
		 */
		adapt: function() {
			var modelJSON = this.model.toJSON(),
				headItemRowList = headItemRows.models,
				headItemColList = headItemCols.models,
				startIndex,
				endIndex,
				width,
				height, i;


			if (modelJSON.wholePosi.endX === 'MAX') {
				width = headItemCols.getMaxDistanceWidth();
				if (width > modelJSON.physicsBox.width) {
					startIndex = binary.newModelBinary(modelJSON.physicsBox.width, headItemColList, 'left', 'width');
					endIndex = binary.newModelBinary(width, headItemColList, 'left', 'width');
					this.model.set('physicsBox.width', width);
					siderLineCols.models[0].set('width', width);
					for (i = startIndex; i < endIndex + 1; i++) {
						headItemColList[i].set('activeState', true);
					}
				}
			}
			if (modelJSON.wholePosi.endY === 'MAX') {
				height = headItemRows.getMaxDistanceHeight();
				if (height > modelJSON.physicsBox.height) {
					startIndex = binary.newModelBinary(modelJSON.physicsBox.height, headItemRowList, 'top', 'height');
					endIndex = binary.newModelBinary(height, headItemRowList, 'top', 'height');
					this.model.set('physicsBox.height', height);
					siderLineRows.models[0].set('height', height);
					for (i = startIndex; i < endIndex + 1; i++) {
						headItemRowList[i].set('activeState', true);
					}
				}
			}
		},
		showComment: function(event) {
			var model,
				self = this;

			if (cache.commentState) {
				return;
			}
			model = this.viewCellsContainer.getCoordinateByMouseEvent(event).model;
			if (this.MouseModel !== model) {
				clearTimeout(this.overEvent);
				this.overEvent = setTimeout(function() {
					if (model !== undefined &&
						model.get('customProp').comment !== null &&
						model.get('customProp').comment !== undefined
					) {
						model.set('commentShowState', true);
					}
				}, 1000);
				if (this.MouseModel !== null && this.MouseModel !== undefined) {
					this.MouseModel.set('commentShowState', false);
				}
			}
			this.MouseModel = model;
		},
		hideComment: function() {
			clearTimeout(this.overEvent);
			if (cache.commentState) {
				return;
			}
			if (this.MouseModel !== null &&
				this.MouseModel !== undefined &&
				this.MouseModel.get('commentShowState')) {
				this.MouseModel.set('commentShowState', false)
			}
			this.MouseModel = null;
		},
		/**
		 * 更新显示视图大小，坐标
		 * @method changePosition
		 */
		changePosition: function() {
			var modelJSON = this.model.toJSON(),
				height = modelJSON.physicsBox.height,
				width = modelJSON.physicsBox.width,
				left = modelJSON.physicsPosi.left,
				top = modelJSON.physicsPosi.top;
			if (left === 0) {
				left = left - 1;
				width = width - 1;
			} else {
				width = width - 2;
			}
			if (top === 0) {
				top = top - 1;
				height = height - 1;
			} else {
				height = height - 2;
			}
			this.$el.css({
				width: width,
				height: height,
				left: left - this.offsetLeft - this.userViewLeft,
				top: top - this.offsetTop - this.userViewTop
			});
		},
		callView: function(name) {
			var object = this;
			return function(callback) {
				object[name] = callback;
			};
		},
		/**
		 * 选中区域内，对每一个单元格区域调用cycleCallback函数操作，如果不存在单元格，则创建后，进行操作
		 * @method patchOprCell
		 * @param  {Function} cycleCallback 回调函数，对单元格对象进行操作
		 * @param  {Object} appointList   操作对象数组
		 */
		patchOprCell: function(cycleCallback, appointList) {
			var currentCell,
				currentCellList,
				partModelList,
				i = 0,
				len,
				partModel,
				modelCellList;
			appointList = appointList === undefined || appointList === null ? {
				cellModel: undefined,
				headModel: undefined
			} : appointList;
			getLastStatus();
			cycleCallback = cycleCallback === undefined || cycleCallback === null ? function() {} : cycleCallback;
			partModelList = appointList.headModel === undefined ? cells.getHeadModelByWholeSelectRegion() : appointList.headModel;

			len = currentCellList.length;
			var start = new Date();
			for (; i < len; i++) {
				currentCell = getLastStatus()[i];
				partModel = partModelList[i];
				if (currentCell === null) {
					cells.add({
						'occupy': {
							'x': [partModel.occupy.x],
							'y': [partModel.occupy.y]
						},
						'physicsBox': {
							'top': partModel.physicsBox.top,
							'left': partModel.physicsBox.left,
							'width': partModel.physicsBox.width,
							'height': partModel.physicsBox.height
						}
					});
					cache.cachePosition(partModel.occupy.y, partModel.occupy.x, cells.length - 1);
					modelCellList = cells.models;
					currentCell = modelCellList[modelCellList.length - 1];
				}
				cycleCallback(currentCell);
			}

			function getLastStatus() {
				currentCellList = appointList.cellModel === undefined ? cells.getCellsByWholeSelectRegion() : appointList.cellModel;
				return currentCellList;
			}
		},
		/**
		 * 转换为编辑状态，显示输入框，并获取输入焦点
		 * @method editState
		 */
		editState: function() {
			Backbone.trigger('event:InputContainer:show');
		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			if (this.model.get("selectType") === "operation") {
				Backbone.off('event:selectRegion:patchOprCell');
			}
			this.remove();
		}
	});
	return SelectRegion;
});