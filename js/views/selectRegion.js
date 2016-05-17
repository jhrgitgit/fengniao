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
		commentContainer = require('views/commentcontainer'),
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
				Backbone.on('event:selectRegion:createInputContainer', this.addInputContainer, this);
				Backbone.on('event:selectRegion:createCommentContainer', this.createCommentContainer, this);
			}
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
		showComment: function(event) {
			var model;
			model = this.viewCellsContainer.getCoordinateByMouseEvent(event).model;
			if (cache.commentState) return;
			if (model === undefined || model.get('customProp').comment === null) {
				if (this.commentView !== undefined && this.commentView !== null) {
					this.commentView.close();
					this.commentView = null;
				}
			} else {
				if (this.MouseModel !== model) {
					this.createCommentContainer(model);
				}
			}
			this.MouseModel = model;
		},
		/**
		 * 创建备注视图
		 * @param  {object} model 单元格模型
		 * @param  {string} type  'eidt':编辑状态, 'show':显示状态 ,'add':添加
		 */
		createCommentContainer: function(model, state) {
			var rowAlias,
				colAlias,
				rowIndex,
				colIndex,
				occupy,
				comment = '',
				options,
				commentView;
			if (model !== undefined) {
				occupy = model.get('occupy');
				comment = model.get('customProp').comment;
				rowAlias = occupy.y[0];
				colAlias = occupy.x[occupy.x.length - 1];
				rowIndex = headItemRows.getIndexByAlias(rowAlias);
				colIndex = headItemCols.getIndexByAlias(colAlias);
			} else { //选中区域编辑单元格
				rowIndex = this.model.get('wholePosi').startY;
				colIndex = this.model.get('wholePosi').endX;
				if (rowIndex === this.model.get('wholePosi').endY &&
					colIndex === this.model.get('wholePosi').startX &&
					state === 'edit') {
					model = cells.getCellByX(colIndex, rowIndex);
					if (model.length > 0) {
						comment = model[0].get('customProp').comment || '';
					}
				}
			}

			options = {
				colIndex: colIndex,
				rowIndex: rowIndex,
				startLeft: this.offsetLeft + this.userViewLeft,
				startTop: this.offsetTop + this.userViewTop,
				comment: comment,
				state: state
			};
			if (this.commentView !== undefined && this.commentView !== null) {
				this.commentView.close();
				this.commentView = null;
			}
			//判断在冻结状态是否超出范围
			if (cache.TempProp.isFrozen === true) {
				if ((rowIndex < this.currentRule.displayPosition.startRowIndex || colIndex < this.currentRule.displayPosition.startColIndex)) {
					return;
				}
				if (this.currentRule.displayPosition.endColIndex !== undefined && colIndex > (this.currentRule.displayPosition.endColIndex - 1)) {
					return;
				}
				if (this.currentRule.displayPosition.endRowIndex !== undefined && rowIndex > (this.currentRule.displayPosition.endRowIndex - 1)) {
					return;
				}
			}
			commentView = new commentContainer(options);
			$(this.el.parentNode).append(commentView.render().el);
			if (state !== 'show') {
				commentView.$el.focus();
			}
			this.commentView = commentView;
		},
		hideComment: function() {
			if (this.commentView !== undefined && this.commentView !== null) {
				this.commentView.close();
				this.commentView = null;
			}
			this.MouseModel = null;
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

			if (cache.TempProp.isFrozen === true) {
				if ((modelIndexRow < this.currentRule.displayPosition.startRowIndex || modelIndexCol < this.currentRule.displayPosition.startColIndex)) {
					return;
				}
				if (this.currentRule.displayPosition.endColIndex !== undefined && modelIndexCol > (this.currentRule.displayPosition.endColIndex - 1)) {
					return;
				}
				if (this.currentRule.displayPosition.endRowIndex !== undefined && modelIndexRow > (this.currentRule.displayPosition.endRowIndex - 1)) {
					return;
				}
			}

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
			cellModel.set('content.texts', '');

			var inputContainer = new InputContainer({
				model: cellModel,
				currentRule: this.currentRule
			});
			this.viewCellsContainer.$el.append(inputContainer.render().el);
			inputContainer.$el.focus();
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
			if (this.model.get("selectType") === "operation") {
				Backbone.off('event:selectRegion:patchOprCell', this.patchOprCell, this);
				Backbone.off('event:selectRegion:createInputContainer', this.addInputContainer, this);
			}
			if (this.model.get('selectType') === 'drag') {
				this.viewCellsContainer.dragView = null;
			}
			if (this.model.get('selectType') === 'dataSource') {
				this.viewCellsContainer.dataSoureRegionView = null;
			}
			this.remove();
		}
	});
	return SelectRegion;
});