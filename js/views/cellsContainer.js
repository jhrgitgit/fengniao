define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		binary = require('basic/util/binary'),
		cache = require('basic/tools/cache'),
		config = require('spreadsheet/config'),
		util = require('basic/util/clone'),
		listener = require('basic/util/listener'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion'),
		siderLineRows = require('collections/siderLineRow'),
		siderLineCols = require('collections/siderLineCol'),
		cells = require('collections/cells'),
		GridLineContainer = require('views/gridLineContainer'),
		ContentCellsContainer = require('views/contentCellsContainer'),
		SelectRegionView = require('views/selectRegion');


	/**
	 * cells容器实体类
	 * @author ray wu
	 * @since 0.1.0
	 * @class CellsContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var CellsContainer = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property el
		 * @type {String}
		 */
		//el: '.cellsContainer',
		className: 'cells-container',
		/**
		 * 绑定鼠标事件
		 * @property events
		 * @type {Object}
		 */
		events: {
			'mousedown': 'located',
			'dragover': 'onDragOver',
			'dragleave': 'onDragLeave',
			'drop': 'onDrop'
		},
		/**
		 * 类初始化调用方法，绑定集合监听
		 * @method initialize
		 * @param  allAttributes 容器属性
		 */
		initialize: function(options) {
			Backbone.on('call:cellsContainer', this.callCellsContainer, this);
			Backbone.on('event:cellsContainer:createDataSourceRegion', this.createDataSourceRegion, this);
			Backbone.on('event:cellsContainer:adjustSelectRegion', this.adjustSelectRegion, this);
			Backbone.on('event:cellsContainer:getPosi', this.getPosi, this);
			Backbone.on('event:cellsContainer:destroy', this.destroy, this);
			Backbone.on('event:cellsContainer:unBindDrag', this.unBindDrag, this);
			Backbone.on('event:cellsContainer:bindDrag', this.bindDrag, this);
			Backbone.on('event:cellsContainer:changePosi', this.changePosi, this);
			Backbone.on('event:cellsContainer:selectRegionChange', this.selectRegionChange, this);
			Backbone.on('event:cellsContainer:addClipRegionView', this.addClipRegionView, this);
			Backbone.on('call:cellsContainer:getCoordinate', this.getCoordinate, this);
			_.bindAll(this, 'callView', 'drag');
			this.currentRule = util.clone(cache.CurrentRule);
			// this.listenTo(selectRegions, 'add', this.addSelectRegion);
			this.boxAttributes = options.boxAttributes;
			this.parentView = options.parentView;
			// this.posiX = this.posiY = 0;
		},
		/**
		 * 渲染方法
		 * @method render 
		 */
		render: function() {
			var modelList = selectRegions.models,
				len,
				i;
			this.attributesRender(this.boxAttributes);

			this.gridLineContainer = new GridLineContainer();
			this.$el.append(this.gridLineContainer.render().el);

			this.contentCellsContainer = new ContentCellsContainer();
			this.$el.append(this.contentCellsContainer.render().el);

			len = modelList.length;
			for (i = 0; i < len; i++) {
				this.addSelectRegion(modelList[i]);
			}
			this.triggerCallback();
			return this;
		},
		onDragOver: function(event) {
			event.preventDefault();
			var coordinate,
				aliasGridRow,
				aliasGridCol;
			coordinate = this.getCoordinateByMouseEvent(event);
			this.adjustDragRegion(coordinate);
		},
		onDrop: function(event) {
			var headItemRowList = headItemRows.models,
				headItemColList = headItemCols.models,
				dragRegions,
				coordinate,
				aliasGridCol,
				aliasGridRow,
				point,
				data,
				cellsPositionX,
				modelCell,
				i, e = {};
			dragRegions = selectRegions.getModelByType('drag');
			for (i = 0; i < dragRegions.length; i++) {
				dragRegions[i].destroy();
			}
			coordinate = this.getCoordinateByMouseEvent(event);

			point = {
				Col: [headItemColList[coordinate.startColIndex].get('displayName')],
				Row: [headItemRowList[coordinate.startRowIndex].get('displayName')],
			};
			e.point = point;



			if (event.isDefaultPrevented() === false) {
				data = event.originalEvent.dataTransfer.getData("text");
				e.text = data;
				event.originalEvent.dataTransfer.clearData();
				if (data === "") return;

				if (modelCell === undefined) {
					modelCell = cells.createCellModel(coordinate.startColIndex, coordinate.startRowIndex, coordinate.endColIndex, coordinate.endRowIndex);
				}
				modelCell.set("content.texts", data);
			}

			listener.excute('dataDrag', e);
		},
		onDragLeave: function(event) {
			var width = this.viewMainContainer.el.clientWidth,
				height = this.viewMainContainer.el.clientHeight,
				clientX = event.originalEvent.clientX - config.System.outerLeft - $('#spreadSheet').offset().left,
				clientY = event.originalEvent.clientY - config.System.outerTop - $('#spreadSheet').offset().top;

			if (clientX < 0 || clientY < 0 || clientX > width || clientY > height) {
				var dragRegions, i;
				dragRegions = selectRegions.getModelByType('drag');
				for (i = 0; i < dragRegions.length; i++) {
					dragRegions[i].destroy();
				}
			}
		},
		getCoordinate: function(callback, mouseColPosi, mouseRowPosi) {
			var currentRowModel = headItemRows.getModelByAlias(cache.TempProp.rowAlias),
				currentColModel = headItemCols.getModelByAlias(cache.TempProp.colAlias),
				headLineRowModelList = headItemRows.models,
				headLineColModelList = headItemCols.models,
				reduceLeftValue,
				reduceTopValue,
				clientX,
				clientY,
				mainMousePosiX,
				mainMousePosiY,
				modelIndexCol,
				modelIndexRow,
				coordinate = {};

			this.userViewTop = cache.TempProp.isFrozen ? headItemRows.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? headItemCols.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			//if this offset value equal 0 ,that position isn't consider frozen point
			if (this.currentRule.displayPosition.offsetLeft === 0) {
				reduceLeftValue = this.userViewLeft;
			} else {
				reduceLeftValue = currentColModel.get('left');
			}
			if (this.currentRule.displayPosition.offsetTop === 0) {
				reduceTopValue = this.userViewTop;
			} else {
				reduceTopValue = currentRowModel.get('top');
			}
			//ps:增加过滤
			clientX = mouseColPosi - config.System.outerLeft - $('#spreadSheet').offset().left;
			clientY = mouseRowPosi - config.System.outerTop - $('#spreadSheet').offset().top;
			if (clientX < 0 || clientY < 0) return;

			//position of mouse in mainContainer
			mainMousePosiX = clientX + this.parentView.el.scrollLeft - this.currentRule.displayPosition.offsetLeft + reduceLeftValue;
			mainMousePosiY = clientY + this.parentView.el.scrollTop - this.currentRule.displayPosition.offsetTop + reduceTopValue;
			if (mainMousePosiX < 0 || mainMousePosiY < 0 || mouseColPosi > this.$el.width() || mouseRowPosi > this.$el.height()) return;


			//this model index of gridline
			modelIndexCol = binary.modelBinary(mainMousePosiX, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
			modelIndexRow = binary.modelBinary(mainMousePosiY, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
			coordinate.col = headLineColModelList[modelIndexCol].get('displayName');
			coordinate.row = headLineRowModelList[modelIndexRow].get('displayName');
			callback(coordinate);

		},
		getCoordinateByMouseEvent: function(event) {
			var currentRowModel = headItemRows.getModelByAlias(cache.TempProp.rowAlias),
				currentColModel = headItemCols.getModelByAlias(cache.TempProp.colAlias),
				headLineRowModelList = headItemRows.models,
				headLineColModelList = headItemCols.models,
				reduceLeftValue,
				reduceTopValue,
				mainMousePosiX,
				mainMousePosiY,
				modelIndexCol,
				modelIndexRow,
				aliasGridRow,
				aliasGridCol,
				cellsPositionX,
				modelCell,
				startPosiX, startPosiY, endPosiX, endPosiY,
				left, width, top, height;

			this.userViewTop = cache.TempProp.isFrozen ? headItemRows.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? headItemCols.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			//if this offset value equal 0 ,that position isn't consider frozen point
			if (this.currentRule.displayPosition.offsetLeft === 0) {
				reduceLeftValue = this.userViewLeft;
			} else {
				reduceLeftValue = currentColModel.get('left');
			}
			if (this.currentRule.displayPosition.offsetTop === 0) {
				reduceTopValue = this.userViewTop;
			} else {
				reduceTopValue = currentRowModel.get('top');
			}
			if (event.clientX === undefined || event.clientY === undefined) {
				event.clientX = event.originalEvent.clientX;
				event.clientY = event.originalEvent.clientY;
			}

			//position of mouse in mainContainer
			mainMousePosiX = event.clientX - config.System.outerLeft - $('#spreadSheet').offset().left + this.parentView.el.scrollLeft - this.currentRule.displayPosition.offsetLeft + reduceLeftValue;
			mainMousePosiY = event.clientY - config.System.outerTop - $('#spreadSheet').offset().top + this.parentView.el.scrollTop - this.currentRule.displayPosition.offsetTop + reduceTopValue;


			//this model index of gridline
			modelIndexCol = binary.modelBinary(mainMousePosiX, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
			modelIndexRow = binary.modelBinary(mainMousePosiY, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
			// isExist cell in cells position array
			// if exist , callback this object 
			// if not exist , callback null
			aliasGridCol = headLineColModelList[modelIndexCol].get('alias');
			aliasGridRow = headLineRowModelList[modelIndexRow].get('alias');

			cellsPositionX = cache.CellsPosition.strandX;
			if (cellsPositionX[aliasGridCol] !== undefined &&
				cellsPositionX[aliasGridCol][aliasGridRow] !== undefined) {
				modelCell = cells.models[cellsPositionX[aliasGridCol][aliasGridRow]];
			}

			//if model is exist , cell information reset
			//if model is not exist , cell information default
			if (modelCell) {
				left = modelCell.get('physicsBox').left;
				top = modelCell.get('physicsBox').top;
				width = modelCell.get('physicsBox').width;
				height = modelCell.get('physicsBox').height;
				startPosiX = binary.modelBinary(left, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
				startPosiY = binary.modelBinary(top, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
				endPosiX = binary.modelBinary(left + width, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
				endPosiY = binary.modelBinary(top + height, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
				// text = modelCell.get('content').texts;
			} else {
				startPosiX = endPosiX = modelIndexCol;
				startPosiY = endPosiY = modelIndexRow;
			}
			return {
				startColIndex: startPosiX,
				startRowIndex: startPosiY,
				endColIndex: endPosiX,
				endRowIndex: endPosiY
			};
		},
		selectRegionChange: function(direction) {
			switch (direction) {
				case 'LEFT':
					break;
				case 'RIGHT':
					break;
				case 'UP':
					break;
				case 'DOWN':
					this.downSelectRegion();
					break;
				default:
					break;
			}
		},
		downSelectRegion: function() {
			var endRowIndex,
				startColIndex,
				aliasRow,
				aliasCol,
				modelCell,
				startPosiX,
				startPosiY,
				endPosiX,
				endPosiY,
				cellsPositionX,
				aliasGridRow,
				aliasGridCol,
				options;

			this.userViewTop = cache.TempProp.isFrozen ? modelRowList.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? modelColList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;

			endRowIndex = selectRegions.models[0].get('wholePosi').endY;
			startColIndex = selectRegions.models[0].get('wholePosi').startX;

			aliasGridRow = headItemRows.models[endRowIndex + 1].get('alias');
			aliasGridCol = headItemRows.models[startColIndex].get('alias');

			cellsPositionX = cache.CellsPosition.strandX;

			if (cellsPositionX[aliasGridCol] !== undefined &&
				cellsPositionX[aliasGridCol][aliasGridRow] !== undefined) {
				modelCell = cells.models[cellsPositionX[aliasGridCol][aliasGridRow]];
			}

			if (modelCell) {
				// left = modelCell.get('physicsBox').left;
				// top = modelCell.get('physicsBox').top;
				// width = modelCell.get('physicsBox').width;
				// height = modelCell.get('physicsBox').height;
				startPosiX = binary.modelBinary(left, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
				startPosiY = binary.modelBinary(top, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
				endPosiX = binary.modelBinary(left + width, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
				endPosiY = binary.modelBinary(top + height, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
				text = modelCell.get('content').texts;
			} else {
				startPosiX = endPosiX = startColIndex;
				startPosiY = endPosiY = endRowIndex + 1;
			}
			options = {
				startColIndex: startPosiX,
				startRowIndex: startPosiY,
				initColIndex: startPosiX,
				initRowIndex: startPosiY,
				mouseColIndex: startPosiX,
				mouseRowIndex: startPosiY,
				endColIndex: endPosiX,
				endRowIndex: endPosiY
			};
			this.adjustOperationRegion(options);

			// var result = {};
			// for (i = startPosiX; i < endPosiX + 1; i++) {
			// 	colDisplayNames.push(headLineColModelList[i].get('displayName'));
			// }
			// for (i = startPosiY; i < endPosiY + 1; i++) {
			// 	rowDisplayNames.push(headLineRowModelList[i].get('displayName'));
			// }
			// result.point = {
			// 	col: colDisplayNames,
			// 	row: rowDisplayNames
			// };

			// result.text = text;
			// result.property = {
			// 	size: modelCell ? modelCell.get('content').size : '11pt',
			// 	family: modelCell ? modelCell.get('content').family : "SimSun",
			// 	bd: modelCell ? modelCell.get('content').bd : false,
			// 	italic: modelCell ? modelCell.get('content').italic : false,
			// 	color: modelCell ? modelCell.get('content').color : "#000",
			// 	alignRow: modelCell ? modelCell.get('content').alignRow : 'left',
			// 	alignCol: modelCell ? modelCell.get('content').alignCol : 'middle',
			// 	background: modelCell ? modelCell.get('customProp').background : "#fff",
			// 	format: modelCell ? modelCell.get('customProp').format : 'text',
			// 	wordWrap: modelCell ? modelCell.get('content').wordWrap : false
			// };
			// result.border = {
			// 	top: modelCell ? modelCell.get('border').top : false,
			// 	right: modelCell ? modelCell.get('border').right : false,
			// 	bottom: modelCell ? modelCell.get('border').bottom : false,
			// 	left: modelCell ? modelCell.get('border').left : false
			// };
		},
		/**
		 * 移除鼠标移动监听事件
		 * @method destoryDelegate
		 */
		destoryDelegate: function() {
			this.$el.off('mousemove', self.drag);
		},
		/**
		 * 触发回调幻术，绑定其他View类
		 * @method triggerCallback 
		 */
		triggerCallback: function() {
			Backbone.trigger('call:mainContainer', this.callView('viewMainContainer'));
		},
		/**
		 * 绑定View，供其他View类调用
		 * @method callCellsContainer
		 */
		callCellsContainer: function(receiveFunc) {
			receiveFunc(this);
		},
		/**
		 * 修改容器宽高
		 * @method attributesRender
		 */
		attributesRender: function(newAttributes) {
			this.$el.css({
				'width': newAttributes.width,
				'height': newAttributes.height
			});
		},
		/**
		 * 增加复制(剪切)选中框
		 */
		addClipRegionView: function() {
			var clipModel,
				clipView,
				selectModel;

			clipModel = selectRegions.getModelByType('clip')[0];
			clipView = new SelectRegionView({
				model: clipModel,
				className: 'clip-container',
				currentRule: this.currentRule
			});
			this.clipView = clipView;
			this.$el.append(clipView.render().el);
		},
		/**
		 * 添加选中区域
		 * @method addSelectRegion
		 */
		addSelectRegion: function(modelSelectRegion) {
			var className;
			if (modelSelectRegion.get("selectType") === "operation") {
				className = "selected-container";
			} else {
				className = "datasource-container";
			}
			this.selectRegion = new SelectRegionView({
				model: modelSelectRegion,
				className: className,
				currentRule: this.currentRule
			});
			this.$el.append(this.selectRegion.render().el);
		},
		/**
		 * 添加选中区域
		 * @method newSelectRegion
		 */
		newSelectRegion: function() {
			var headItemColModelList,
				headItemRowModelList,
				aliasGridRow,
				aliasGridCol,
				cellsPositionX,
				initCell;

			headItemColModelList = headItemCols.models;
			headItemRowModelList = headItemRows.models;

			aliasGridRow = headItemColModelList[0].get('alias');
			aliasGridCol = headItemRowModelList[0].get('alias');

			cellsPositionX = cache.CellsPosition.strandX;

			if (cellsPositionX[aliasGridCol] !== undefined &&
				cellsPositionX[aliasGridCol][aliasGridRow] !== undefined) {
				initCell = cells.models[cellsPositionX[aliasGridCol][aliasGridRow]];
			}
			if (initCell === undefined) {
				return {
					physicsPosi: {
						top: 0,
						left: 0
					},
					physicsBox: {
						width: headItemColModelList[0].get('width'),
						height: headItemRowModelList[0].get('height')
					}
				};
			} else {
				this.changeSelectHeadLine(initCell);
				return {
					physicsPosi: {
						top: 0,
						left: 0
					},
					physicsBox: {
						width: initCell.get("physicsBox").width,
						height: initCell.get("physicsBox").height
					}
				};
			}
		},
		/**
		 * 更新选中列标集合
		 * @method changeSelectHeadLine
		 * @param initCell {Cell} 单元格
		 */
		changeSelectHeadLine: function(initCell) {
			var headLineRowModelList,
				headLineColModelList,
				startX,
				startY,
				endX,
				endY,
				width,
				height;

			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;

			// startY = binary.modelBinary(initCell.get("physicsBox").top, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
			// startX = binary.modelBinary(initCell.get("physicsBox").left, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
			startX = 0;
			startY = 0;
			endX = binary.modelBinary(initCell.get("physicsBox").left + initCell.get("physicsBox").width, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
			endY = binary.modelBinary(initCell.get("physicsBox").top + initCell.get("physicsBox").height, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);

			siderLineRows.models[0].set({
				top: initCell.get("physicsBox").top,
				height: initCell.get("physicsBox").height
			});

			siderLineCols.models[0].set({
				left: initCell.get("physicsBox").left,
				width: initCell.get("physicsBox").width
			});
			var len = headLineRowModelList.length,
				i;

			for (i = 0; i < len; i++) {
				headLineRowModelList[i].set({
					activeState: false
				});
			}
			len = headLineColModelList.length;
			for (i = 0; i < len; i++) {
				headLineColModelList[i].set({
					activeState: false
				});
			}
			for (i = 0; i < endX - startX + 1; i++) {
				headLineColModelList[startX + i].set({
					activeState: true
				});
			}
			for (i = 0; i < endY - startY + 1; i++) {
				headLineRowModelList[startY + i].set({
					activeState: true
				});
			}
		},
		/**
		 * 调用mainContainer视图
		 * @method callViewMainContainer
		 * @param  callback {function} 回调函数
		 */
		callView: function(name) {
			var object = this;
			return function(callback) {
				object[name] = callback;
			};
		},
		located: function(e) {
			var targetPosi = {
				clientX: e.clientX,
				clientY: e.clientY
			};
			// this is question , need deprecated
			// 
			// when input data time avoid trigger this effect.
			if ($(e.target).attr('class') === 'edit-frame') {
				return;
			}
			this.changePosi(targetPosi);
			Backbone.trigger('event:cellsContainer:bindDrag');
		},
		/**
		 * 单元格区域单击事件处理
		 * @method changePosi
		 * @param  e {event} 单击事件
		 */
		changePosi: function(cfg) {
			var mainMousePosiX,
				mainMousePosiY,
				headLineRowModelList,
				headLineColModelList,
				modelIndexCol,
				modelIndexRow,
				gridModelCol,
				gridModelRow,
				modelCell,
				cellsPositionX,
				aliasGridRow,
				aliasGridCol,
				colDisplayNames = [],
				rowDisplayNames = [],
				point,
				text = '',
				options,
				modelRowList = headItemRows,
				modelColList = headItemCols,
				currentRowModel = modelRowList.getModelByAlias(cache.TempProp.rowAlias),
				currentColModel = modelColList.getModelByAlias(cache.TempProp.colAlias),
				reduceLeftValue, reduceTopValue,
				left, top, width, height, i, len, startPosiX, startPosiY, endPosiX, endPosiY,
				arg = {};
			arg = {
				clientX: cfg.clientX || 0,
				clientY: cfg.clientY || 0
			};

			this.userViewTop = cache.TempProp.isFrozen ? modelRowList.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? modelColList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			//if this offset value equal 0 ,that position isn't consider frozen point
			if (this.currentRule.displayPosition.offsetLeft === 0) {
				reduceLeftValue = this.userViewLeft;
			} else {
				reduceLeftValue = currentColModel.get('left');
			}
			if (this.currentRule.displayPosition.offsetTop === 0) {
				reduceTopValue = this.userViewTop;
			} else {
				reduceTopValue = currentRowModel.get('top');
			}
			//position of mouse in mainContainer
			mainMousePosiX = arg.clientX - config.System.outerLeft - $('#spreadSheet').offset().left + this.parentView.el.scrollLeft - this.currentRule.displayPosition.offsetLeft + reduceLeftValue;
			mainMousePosiY = arg.clientY - config.System.outerTop - $('#spreadSheet').offset().top + this.parentView.el.scrollTop - this.currentRule.displayPosition.offsetTop + reduceTopValue;
			//headColModels,headRowModels list
			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;

			//this model index of gridline
			modelIndexCol = binary.modelBinary(mainMousePosiX, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
			modelIndexRow = binary.modelBinary(mainMousePosiY, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
			//grid model information
			gridModelCol = headLineColModelList[modelIndexCol];
			gridModelRow = headLineRowModelList[modelIndexRow];


			// isExist cell in cells position array
			// if exist , callback this object 
			// if not exist , callback null
			aliasGridRow = gridModelRow.get('alias');
			aliasGridCol = gridModelCol.get('alias');


			cellsPositionX = cache.CellsPosition.strandX;

			//ps：修改
			if (cellsPositionX[aliasGridCol] !== undefined &&
				cellsPositionX[aliasGridCol][aliasGridRow] !== undefined) {
				modelCell = cells.models[cellsPositionX[aliasGridCol][aliasGridRow]];
			}

			//if model is exist , cell information reset
			//if model is not exist , cell information default
			if (modelCell) {
				left = modelCell.get('physicsBox').left;
				top = modelCell.get('physicsBox').top;
				width = modelCell.get('physicsBox').width;
				height = modelCell.get('physicsBox').height;
				startPosiX = binary.modelBinary(left, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
				startPosiY = binary.modelBinary(top, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
				endPosiX = binary.modelBinary(left + width, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
				endPosiY = binary.modelBinary(top + height, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
				text = modelCell.get('content').texts;
			} else {
				startPosiX = endPosiX = modelIndexCol;
				startPosiY = endPosiY = modelIndexRow;
			}

			//此处待修正，回调函数是否执行，按什么规则执行
			if (true) {
				options = {
					startColIndex: startPosiX,
					startRowIndex: startPosiY,
					initColIndex: startPosiX,
					initRowIndex: startPosiY,
					mouseColIndex: startPosiX,
					mouseRowIndex: startPosiY,
					endColIndex: endPosiX,
					endRowIndex: endPosiY
				};
				this.adjustOperationRegion(options, e);
			}

			var e = {};
			for (i = startPosiX; i < endPosiX + 1; i++) {
				colDisplayNames.push(headLineColModelList[i].get('displayName'));
			}
			for (i = startPosiY; i < endPosiY + 1; i++) {
				rowDisplayNames.push(headLineRowModelList[i].get('displayName'));
			}
			e.point = {
				col: colDisplayNames,
				row: rowDisplayNames
			};

			e.text = text;
			e.property = {
				size: modelCell ? modelCell.get('content').size : '11pt',
				family: modelCell ? modelCell.get('content').family : "SimSun",
				bd: modelCell ? modelCell.get('content').bd : false,
				italic: modelCell ? modelCell.get('content').italic : false,
				color: modelCell ? modelCell.get('content').color : "#000",
				alignRow: modelCell ? modelCell.get('content').alignRow : 'left',
				alignCol: modelCell ? modelCell.get('content').alignCol : 'middle',
				background: modelCell ? modelCell.get('customProp').background : "#fff",
				format: modelCell ? modelCell.get('customProp').format : 'text',
				wordWrap: modelCell ? modelCell.get('content').wordWrap : false
			};
			e.border = {
				top: modelCell ? modelCell.get('border').top : false,
				right: modelCell ? modelCell.get('border').right : false,
				bottom: modelCell ? modelCell.get('border').bottom : false,
				left: modelCell ? modelCell.get('border').left : false
			};

			listener.excute('mousedown', e);
		},
		/**
		 * 绑定鼠标拖拽事件
		 * @method bindDrag
		 */
		bindDrag: function() {
			this.$el.on('mousemove', this.drag);
		},
		/**
		 * 移除鼠标拖拽事件
		 * @method unBindDrag 
		 */
		unBindDrag: function() {
			this.$el.off('mousemove', this.drag);
		},
		/**
		 * 处理鼠标拖拽事件
		 * @method drag 
		 * @param  e {event} 鼠标移动事件
		 */
		drag: function(e) {
			var mainMousePosiX,
				mainMousePosiY,
				modelIndexCol,
				modelIndexRow,
				headLineRowModelList,
				headLineColModelList,
				initIndexCol,
				initIndexRow,
				colDisplayNames = [],
				rowDisplayNames = [],
				startX,
				startY,
				endX,
				endY,
				lastMouseCol,
				lastMouseRow,
				len,
				options, regionModel, point;

			var modelRowList = headItemRows,
				modelColList = headItemCols,
				currentRowModel = modelRowList.getModelByAlias(cache.TempProp.rowAlias),
				currentColModel = modelColList.getModelByAlias(cache.TempProp.colAlias),
				reduceLeftValue,
				reduceTopValue;

			this.userViewTop = cache.TempProp.isFrozen ? modelRowList.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? modelColList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			//if this offset value equal 0 ,that position isn't consider frozen point
			if (this.currentRule.displayPosition.offsetLeft === 0) {
				reduceLeftValue = this.userViewLeft;
			} else {
				reduceLeftValue = currentColModel.get('left');
			}
			if (this.currentRule.displayPosition.offsetTop === 0) {
				reduceTopValue = this.userViewTop;
			} else {
				reduceTopValue = currentRowModel.get('top');
			}
			//position of mouse in mainContainer
			mainMousePosiX = e.clientX - config.System.outerLeft - $('#spreadSheet').offset().left + this.parentView.el.scrollLeft - this.currentRule.displayPosition.offsetLeft + reduceLeftValue;
			mainMousePosiY = e.clientY - config.System.outerTop - $('#spreadSheet').offset().top + this.parentView.el.scrollTop - this.currentRule.displayPosition.offsetTop + reduceTopValue;

			//headColModels,headRowModels list
			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;

			modelIndexCol = binary.modelBinary(mainMousePosiX, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
			modelIndexRow = binary.modelBinary(mainMousePosiY, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);


			if (cache.setDataSource === true) {
				regionModel = selectRegions.getModelByType("dataSource")[0];
			} else {
				regionModel = selectRegions.getModelByType("operation")[0];
			}

			//鼠标开始移动索引
			initIndexCol = regionModel.get('initPosi').startX;
			initIndexRow = regionModel.get('initPosi').startY;

			//上次移动鼠标坐标
			lastMouseCol = regionModel.get('mousePosi').mouseX;
			lastMouseRow = regionModel.get('mousePosi').mouseY;

			//判断是否需要渲染
			if (lastMouseCol === modelIndexCol && lastMouseRow === modelIndexRow) {
				return;
			}

			//如果拖拽超出控制区域
			if (modelIndexCol === -1 && lastMouseCol > 5) {
				modelIndexCol = headLineColModelList.length - 1;
			} else if (modelIndexCol === -1) {
				modelIndexCol = 0;
			}

			if (modelIndexRow === -1 && lastMouseRow > 5) {
				modelIndexRow = headLineRowModelList.length - 1;
			} else if (modelIndexRow === -1) {
				modelIndexRow = 0;
			}

			regionModel.set('mousePosi', {
				mouseX: modelIndexCol,
				mouseY: modelIndexRow
			});

			//计算选中区域开始索引，结束索引
			startX = initIndexCol < modelIndexCol ? initIndexCol : modelIndexCol;
			startY = initIndexRow < modelIndexRow ? initIndexRow : modelIndexRow;
			endX = initIndexCol > modelIndexCol ? initIndexCol : modelIndexCol;
			endY = initIndexRow > modelIndexRow ? initIndexRow : modelIndexRow;

			var flag = true, //循环变量
				i;
			while (flag) {
				flag = false;
				//获取选中区域内所有cell对象
				var tempCells = cells.getCellByX(startX, startY, endX, endY);
				//存在单元格的区域的开始索引，结束索引
				var cellStartX, cellStartY, cellEndX, cellEndY;
				for (i = 0; i < tempCells.length; i++) {
					cellStartY = binary.modelBinary(tempCells[i].get('physicsBox').top, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
					cellStartX = binary.modelBinary(tempCells[i].get('physicsBox').left, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
					cellEndY = binary.modelBinary(tempCells[i].get('physicsBox').top + tempCells[i].get('physicsBox').height, headLineRowModelList, 'top', 'height', 0, headLineRowModelList.length - 1);
					cellEndX = binary.modelBinary(tempCells[i].get('physicsBox').left + tempCells[i].get('physicsBox').width, headLineColModelList, 'left', 'width', 0, headLineColModelList.length - 1);
					if (cellStartX < startX) {
						startX = cellStartX;
						flag = true;
						break;
					}
					if (cellStartY < startY) {
						startY = cellStartY;
						flag = true;
						break;
					}
					if (cellEndX > endX) {
						endX = cellEndX;
						flag = true;
						break;
					}
					if (cellEndY > endY) {
						endY = cellEndY;
						flag = true;
						break;
					}
				}
			}


			if (e.isDefaultPrevented() === false) {
				options = {
					startColIndex: startX,
					startRowIndex: startY,
					endColIndex: endX,
					endRowIndex: endY,
				};
				this.adjustOperationRegion(options, e);
			}
			e = {};
			for (i = startX; i < endX + 1; i++) {
				colDisplayNames.push(headLineColModelList[i].get('displayName'));
			}
			for (i = startY; i < endY + 1; i++) {
				rowDisplayNames.push(headLineRowModelList[i].get('displayName'));
			}
			e.point = {
				col: colDisplayNames,
				row: rowDisplayNames
			};
		},
		adjustOperationRegion: function(options, e) {
			if (cache.setDataSource === true) {
				this.adjustDataSourceRegion(options, e);
			} else {
				this.adjustSelectRegion(options, e);
			}
		},
		adjustDragRegion: function(options) {
			var startColIndex = options.startColIndex,
				startRowIndex = options.startRowIndex,
				endColIndex = options.endColIndex,
				endRowIndex = options.endRowIndex,
				headItemColList = headItemCols.models,
				headItemRowList = headItemRows.models,
				dragRegions,
				dragRegion,
				width = 0,
				height = 0,
				left = 0,
				top = 0;
			dragRegions = selectRegions.getModelByType('drag');
			if (dragRegions.length === 0) {
				this.createDragRegion(options);
				dragRegions = selectRegions.getModelByType('drag');
			}
			dragRegion = dragRegions[0];

			if (this.dragView === undefined || this.dragView === null) {
				this.dragView = new SelectRegionView({
					model: dragRegion,
					className: 'datasource-container',
					currentRule: this.currentRule
				});
				this.$el.append(this.dragView.render().el);
			}

			left = headItemColList[startColIndex].get('left');
			top = headItemRowList[startRowIndex].get('top');
			width = headItemColList[endColIndex].get('width') + headItemColList[endColIndex].get('left') - headItemColList[startColIndex].get('left');
			height = headItemRowList[endRowIndex].get('height') + headItemRowList[endRowIndex].get('top') - headItemRowList[startRowIndex].get('top');

			dragRegion.set({
				physicsPosi: {
					top: headItemRowList[startRowIndex].get('top'),
					left: headItemColList[startColIndex].get('left')
				},
				physicsBox: {
					width: width - 1,
					height: height - 1
				},
			});
		},
		/**
		 * 改变选择框区域
		 * @param  {[type]} options [description]
		 * @param  {[type]} e       [description]
		 * @return {[type]}         [description]
		 */
		adjustSelectRegion: function(options) {
			var startColIndex = options.startColIndex,
				startRowIndex = options.startRowIndex,
				endColIndex = options.endColIndex,
				endRowIndex = options.endRowIndex,
				headItemColList = headItemCols.models,
				headItemRowList = headItemRows.models,
				colDisplayNames = [],
				rowDisplayNames = [],
				width = 0,
				height = 0,
				len, i;

			var e = {};
			for (i = startColIndex; i < endColIndex + 1; i++) {
				colDisplayNames.push(headItemColList[i].get('displayName'));
			}
			for (i = startRowIndex; i < endRowIndex + 1; i++) {
				rowDisplayNames.push(headItemRowList[i].get('displayName'));
			}
			e.point = {
				col: colDisplayNames,
				row: rowDisplayNames
			};
			listener.excute('regionChange', e);
			listener.excute('selectRegionChange', e);

			width = headItemColList[endColIndex].get('width') + headItemColList[endColIndex].get('left') - headItemColList[startColIndex].get('left');
			height = headItemRowList[endRowIndex].get('height') + headItemRowList[endRowIndex].get('top') - headItemRowList[startRowIndex].get('top');

			if (options.initColIndex !== undefined) {
				selectRegions.models[0].set({
					initPosi: {
						startX: options.initColIndex,
						startY: options.initRowIndex
					}
				});
			}
			selectRegions.models[0].set({
				physicsPosi: {
					top: headItemRowList[startRowIndex].get('top'),
					left: headItemColList[startColIndex].get('left')
				},
				physicsBox: {
					width: width - 1,
					height: height - 1
				},
				wholePosi: {
					startX: startColIndex,
					startY: startRowIndex,
					endX: endColIndex,
					endY: endRowIndex
				}
			});

			siderLineRows.models[0].set({
				top: headItemRowList[startRowIndex].get('top'),
				height: height - 1
			});
			siderLineCols.models[0].set({
				left: headItemColList[startColIndex].get('left'),
				width: width - 1

			});

			len = headItemRowList.length;

			for (i = 0; i < len; i++) {
				headItemRowList[i].set({
					activeState: false
				});
			}

			len = headItemColList.length;
			for (i = 0; i < len; i++) {
				headItemColList[i].set({
					activeState: false
				});
			}
			for (i = 0; i < endColIndex - startColIndex + 1; i++) {
				width += headItemColList[startColIndex + i].set({
					activeState: true
				});
			}
			for (i = 0; i < endRowIndex - startRowIndex + 1; i++) {
				height += headItemRowList[startRowIndex + i].set({
					activeState: true
				});
			}
		},
		/**
		 * 改变数据源选择区域
		 * @param  {[type]} options [description]
		 * @param  {[type]} e       [description]
		 * @return {[type]}         [description]
		 */
		adjustDataSourceRegion: function(options) {

			var startColIndex = options.startColIndex,
				startRowIndex = options.startRowIndex,
				endColIndex = options.endColIndex,
				endRowIndex = options.endRowIndex,
				headItemColList = headItemCols.models,
				headItemRowList = headItemRows.models,
				rowDisplayNames = [],
				colDisplayNames = [],
				dataSourceRegion,
				width, height, i;

			var e = {};
			for (i = startColIndex; i < endColIndex + 1; i++) {
				colDisplayNames.push(headItemColList[i].get('displayName'));
			}
			for (i = startRowIndex; i < endRowIndex + 1; i++) {
				rowDisplayNames.push(headItemRowList[i].get('displayName'));
			}
			e.point = {
				col: colDisplayNames,
				row: rowDisplayNames
			};
			listener.excute('regionChange', e);
			listener.excute('dataSourceRegionChange', e);

			dataSourceRegion = selectRegions.getModelByType("dataSource")[0];

			if (dataSourceRegion === undefined) {
				dataSourceRegion = this.createDataSourceRegion(options);
			}
			if (this.dataSoureRegionView === undefined || this.dataSoureRegionView === null) {
				this.dataSoureRegionView = new SelectRegionView({
					model: dataSourceRegion,
					className: 'datasource-container',
					currentRule: this.currentRule
				});
				this.$el.append(this.dataSoureRegionView.render().el);
			}

			width = headItemColList[endColIndex].get('width') + headItemColList[endColIndex].get('left') - headItemColList[startColIndex].get('left');
			height = headItemRowList[endRowIndex].get('height') + headItemRowList[endRowIndex].get('top') - headItemRowList[startRowIndex].get('top');
			if (options.initColIndex !== undefined) {
				dataSourceRegion.set({
					initPosi: {
						startX: options.initColIndex,
						startY: options.initRowIndex
					}
				});
			}
			dataSourceRegion.set({
				physicsPosi: {
					top: headItemRowList[startRowIndex].get('top'),
					left: headItemColList[startColIndex].get('left')
				},
				physicsBox: {
					width: width - 1,
					height: height - 1
				},
				wholePosi: {
					startX: startColIndex,
					startY: startRowIndex,
					endX: endColIndex,
					endY: endRowIndex
				}
			});
		},
		createDragRegion: function(options) {
			var startColIndex = options.startColIndex || 0,
				startRowIndex = options.startRowIndex || 0,
				endColIndex = options.endColIndex || 0,
				endRowIndex = options.endRowIndex || 0,
				headItemColList = headItemCols.models,
				headItemRowList = headItemRows.models,
				width,
				height;

			width = headItemColList[endColIndex].get('width') + headItemColList[endColIndex].get('left') - headItemColList[startColIndex].get('left');
			height = headItemRowList[endRowIndex].get('height') + headItemRowList[endRowIndex].get('top') - headItemRowList[startRowIndex].get('top');
			selectRegions.add({
				physicsPosi: {
					top: headItemRowList[startRowIndex].get('top'),
					left: headItemColList[startColIndex].get('left')
				},
				physicsBox: {
					width: width - 1,
					height: height - 1
				},
				selectType: 'drag'
			});
		},
		createDataSourceRegion: function(options) {
			var startColIndex = options.startColIndex || 0,
				startRowIndex = options.startRowIndex || 0,
				endColIndex = options.endColIndex || 0,
				endRowIndex = options.endRowIndex || 0,
				headItemColList = headItemCols.models,
				headItemRowList = headItemRows.models,
				width, height;

			width = headItemColList[endColIndex].get('width') + headItemColList[endColIndex].get('left') - headItemColList[startColIndex].get('left');
			height = headItemRowList[endRowIndex].get('height') + headItemRowList[endRowIndex].get('top') - headItemRowList[startRowIndex].get('top');
			selectRegions.add({
				mousePosi: {
					mouseX: startColIndex,
					mouseY: startRowIndex
				},
				initPosi: {
					startX: startColIndex,
					startY: startRowIndex
				},
				physicsPosi: {
					top: headItemRowList[startRowIndex].get('top'),
					left: headItemColList[startColIndex].get('left')
				},
				physicsBox: {
					width: width - 1,
					height: height - 1
				},
				wholePosi: {
					startX: startColIndex,
					startY: startRowIndex,
					endX: endColIndex,
					endY: endRowIndex
				},
				selectType: 'dataSource'
			});
			if (this.dataSoureRegionView === undefined || this.dataSoureRegionView === null) {
				this.dataSoureRegionView = new SelectRegionView({
					model: selectRegions.getModelByType("dataSource")[0],
					className: 'datasource-container',
					currentRule: this.currentRule
				});
				this.$el.append(this.dataSoureRegionView.render().el);
			}
			return selectRegions.getModelByType("dataSource")[0];
		},
		destroyDataSourceRegion: function() {
			dataSourceRegions.models[0].destroy();
		},
		/**
		 * 调整容器宽度
		 * @method changeWidth 
		 */
		changeWidth: function() {

		},
		/**
		 * 调整容器高度
		 * @method changeHeight 
		 */
		changeHeight: function() {

		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			Backbone.off('call:cellsContainer');
			Backbone.off('event:cellsContainer:destroy');
			this.contentCellsContainer.destroy();
			this.selectRegion.destroy();
			if (this.clipView !== undefined && this.clipView !== null) this.clipView.destroy();
			if (this.dragView !== undefined && this.dragView !== null) this.dragView.destroy();
			if (this.dataSoureRegionView !== undefined && this.dataSoureRegionView !== null) this.dataSoureRegionView.destroy();
			this.remove();
		}
	});
	return CellsContainer;
});