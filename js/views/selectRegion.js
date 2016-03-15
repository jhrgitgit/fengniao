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
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		cells = require('collections/cells'),
		InputContainer = require('views/inputContainer'),
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
			'dblclick': 'editState'
		},
		/**
		 * 视图初始化函数
		 * @method initialize
		 */
		initialize: function(options) {
			Backbone.on('event:selectRegion:patchOprCell', this.patchOprCell, this);
			Backbone.on('event:selectRegion:createInputContainer', this.addInputContainer, this);
			this.listenTo(this.model, 'change', this.changePosition);
			this.listenTo(this.model, 'destroy', this.destroy);
			this.currentRule = util.clone(cache.CurrentRule);
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
			this.triggerCallback();
			return this;
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
		/**
		 * 绑定其他视图
		 * @method triggerCallback
		 */
		triggerCallback: function() {
			Backbone.trigger('call:cellsContainer', this.callView('viewCellsContainer'));
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
			var gridLineRowModelList,
				gridLineColModelList,
				modelIndexRow,
				modelIndexCol,
				cellModel,
				cellModelList,
				modelJSON = this.model.toJSON(),
				modelRow,
				modelCol,
				aliasRow,
				aliasCol;

			gridLineColModelList = headItemCols.models;
			gridLineRowModelList = headItemRows.models;

			modelIndexRow = binary.modelBinary(modelJSON.physicsPosi.top, gridLineRowModelList, 'top', 'height', 0, gridLineRowModelList.length - 1);
			modelIndexCol = binary.modelBinary(modelJSON.physicsPosi.left, gridLineColModelList, 'left', 'width', 0, gridLineColModelList.length - 1);

			modelRow = gridLineRowModelList[modelIndexRow];
			modelCol = gridLineColModelList[modelIndexCol];

			cellModelList = cells.getRegionCells(modelIndexCol, modelIndexRow);
			//doesn't exist cell
			if (cellModelList[0] === null) {
				aliasRow = modelRow.get('alias');
				aliasCol = modelCol.get('alias');

				//send data to back
				send.PackAjax({
					url: 'cells.htm?m=create',
					data: JSON.stringify({
						excelId: window.SPREADSHEET_AUTHENTIC_KEY,
						sheetId: '1',
						coordinate: {
							startX: modelIndexCol,
							startY: modelIndexRow
						}
					})
				});

				//end
				cellModel = this.createCell(modelIndexRow, modelIndexCol);
				cells.add(cellModel);
				cache.cachePosition(aliasRow, aliasCol, cells.length - 1);
			} else {
				cellModel = cellModelList[0];
			}
			this.addInput(cellModel);
		},
		/**
		 * 输入框渲染
		 * @method addInput
		 * @param {Cell} cell 单元格对象
		 */
		addInput: function(cell) {
			var inputContainer = new InputContainer({
				model: cell,
				currentRule: this.currentRule
			});
			this.viewCellsContainer.$el.append(inputContainer.render().el);
			inputContainer.$el.focus();
		},
		addInputContainer: function(text) {
			var gridLineRowModelList,
				gridLineColModelList,
				modelIndexRow,
				modelIndexCol,
				cellModel,
				cellModelList,
				modelJSON = this.model.toJSON(),
				modelRow,
				modelCol,
				aliasRow,
				aliasCol;

			gridLineColModelList = headItemCols.models;
			gridLineRowModelList = headItemRows.models;

			modelIndexRow = binary.modelBinary(modelJSON.physicsPosi.top, gridLineRowModelList, 'top', 'height', 0, gridLineRowModelList.length - 1);
			modelIndexCol = binary.modelBinary(modelJSON.physicsPosi.left, gridLineColModelList, 'left', 'width', 0, gridLineColModelList.length - 1);

			modelRow = gridLineRowModelList[modelIndexRow];
			modelCol = gridLineColModelList[modelIndexCol];

			cellModelList = cells.getRegionCells(modelIndexCol, modelIndexRow);
			//doesn't exist cell
			if (cellModelList[0] === null) {
				aliasRow = modelRow.get('alias');
				aliasCol = modelCol.get('alias');
				cellModel = this.createCell(modelIndexRow, modelIndexCol);
				cells.add(cellModel);
				cache.cachePosition(aliasRow, aliasCol, cells.length - 1);
			} else {
				cellModel = cellModelList[0];
			}
			cellModel.set('content.texts','');

			var inputContainer = new InputContainer({
				model: cellModel,
				currentRule: this.currentRule
			});
			this.viewCellsContainer.$el.append(inputContainer.render().el);
			inputContainer.$el.focus();
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
			return cacheCell;
		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			Backbone.off('event:selectRegion:patchOprCell');
			this.remove();
			if (this.model.get('selectType') === 'drag') {
				this.viewCellsContainer.dragView = null;
			}
		}
	});
	return SelectRegion;
});