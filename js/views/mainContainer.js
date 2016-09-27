/**
 * MainContainer
 * @author ray wu
 * @module view
 * @since 1.0.0
 * @main view
 */
define(function(require) {
	'use strict';
	var _ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		binary = require('basic/util/binary'),
		cache = require('basic/tools/cache'),
		config = require('spreadsheet/config'),
		original = require('basic/tools/original'),
		clone = require('basic/util/clone'),
		send = require('basic/tools/send'),
		loadRecorder = require('basic/tools/loadrecorder'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		rowOperate = require('entrance/row/rowoperation'),
		cells = require('collections/cells'),
		selectRegions = require('collections/selectRegion'),
		CellsContainer = require('views/cellsContainer');

	/**
	 *单元格显示区域视图类
	 *@class MainContainer 
	 *@extends Backbone.View
	 *@constructor
	 */
	var MainContainer = Backbone.View.extend({

		/**
		 * 类初始化调用方法
		 * @method initialize
		 * @param  allAttributes 容器属性,设置容器，宽度，高度
		 */
		initialize: function() {
			var modelsHeadLineRowList,
				modelsHeadLineRowRegionList,
				headItemColRegionList,
				modelLastHeadLineRow,
				headItemColList,
				lastHeadLineCol,
				len, i;

			Backbone.on('event:mainContainer:destroy', this.destroy, this);
			Backbone.on('event:mainContainer:attributesRender', this.attributesRender, this);
			Backbone.on('event:mainContainer:appointPosition', this.appointPosition, this);

			this.currentRule = clone.clone(cache.CurrentRule);

			if (this.currentRule.eventScroll) {
				/**
				 * 绑定滚动事件
				 * @property events
				 * @type {Object}
				 */
				this.delegateEvents({
					'scroll': 'syncScroll'
				});
				Backbone.on('call:mainContainer', this.callMainContainer, this);
				Backbone.on('event:mainContainer:nextCellPosition', this.nextCellPosition, this);
				Backbone.on('event:mainContainer:addBottom', this.addBottom, this);
			}
			this.boxModel = {};

			this.boxAttributes = this.currentRule.boxAttributes;

			// for reduction position , prevent event scroll auto trigger.
			this.isPreventScroll = true;

			this.recordScrollLeft = this.recordScrollTop = 0;

			modelsHeadLineRowRegionList = modelsHeadLineRowList = headItemRows.models;
			headItemColRegionList = headItemColList = headItemCols.models;
			//计算容器高度
			if (cache.TempProp.isFrozen) {
				if (this.currentRule.displayPosition.endRowIndex) {
					modelsHeadLineRowRegionList = modelsHeadLineRowList.slice(this.currentRule.displayPosition.startRowIndex, this.currentRule.displayPosition.endRowIndex);
				} else {
					modelsHeadLineRowRegionList = modelsHeadLineRowList.slice(this.currentRule.displayPosition.startRowIndex);
				}
				if (this.currentRule.displayPosition.endColIndex) {
					headItemColRegionList = headItemColList.slice(this.currentRule.displayPosition.startColIndex, this.currentRule.displayPosition.endColIndex);
				} else {
					headItemColRegionList = headItemColList.slice(this.currentRule.displayPosition.startColIndex);
				}
			}
			len = modelsHeadLineRowRegionList.length;
			modelLastHeadLineRow = modelsHeadLineRowRegionList[len - 1];
			len = headItemColRegionList.length;
			lastHeadLineCol = headItemColRegionList[len - 1];
			//ps:计算问题
			this.boxModel.height = modelLastHeadLineRow.get('top') + modelLastHeadLineRow.get('height') - modelsHeadLineRowRegionList[0].get('top');
			this.boxModel.width = lastHeadLineCol.get('left') + lastHeadLineCol.get('width') - headItemColRegionList[0].get('left');

			//mianContainer内部列视图显示区域
			// this.display.left = headItemColRegionList[0].get(left);
			// this.display.right = headItemColRegionList[0].get(left);

			this.rowsViewBottomPosi = this.boxModel.height;
			config.displayRowHeight = this.rowsViewBottomPosi;
			cache.visibleRegion.top = 0;
			cache.visibleRegion.bottom = this.rowsViewBottomPosi;


			//视图行列视图加载区域
			// cache.gridLineView = {};
			//待修改：应该使用this.boxAttributes+预加载区，判断滚动区域行列对象的可视范围
			//通过遍历计算，获取列视图加载区域
			len = headItemColRegionList.length;
			//放入cache中，重新拉取cell单元格使用
			cache.gridLineView.left = headItemColRegionList[0].get('left');
			for (i = 1; i < len; i++) {
				if (headItemColRegionList[i].get('isView') === false) {
					cache.gridLineView.right = headItemColRegionList[i - 1].get('left') + headItemColRegionList[i - 1].get('width');
					break;
				}
			}
		},
		/**
		 * 生成白色背景，用于遮挡输入框
		 */
		addBackGround: function() {
			if (this.currentRule.displayPosition.endColAlias !== undefined &&
				this.currentRule.displayPosition.endRowAlias !== undefined) {
				//修改为模板this.boxAttributes
				this.$el.append('<div style="position:absolute;width:inherit;height:inherit;background-color:white;top:0;left:0;z-index:13"></div>');
				this.cellsContainer.$el.css({
					'z-index': '14'
				});
			} else if (this.currentRule.displayPosition.endColAlias !== undefined ||
				this.currentRule.displayPosition.endRowAlias !== undefined) {
				this.$el.append('<div style="position:absolute;width:inherit;height:inherit;background-color:white;top:0;left:0;z-index:10"></div>');
				this.cellsContainer.$el.css({
					'z-index': '11'
				});
			}
		},

		// addCellViewPublish: function(cellModel) {
		// 	this.publish(cellModel, 'addCellViewPublish');
		// },

		// addRowHeadItemViewPublish: function(headItemRowModel) {
		// 	this.publish(headItemRowModel, 'addRowHeadItemViewPublish');
		// },
		// addHeadItemView: function(headItemRowModel) {
		// 	var gridLineRowContainer;
		// 	gridLineRowContainer = new GridLineRowContainer({
		// 		model: headItemRowModel,
		// 		frozenTop: this.currentRule.displayPosition.offsetTop
		// 	});
		// 	this.cellsContainer.gridLineContainer.rowsGridContainer.$el.append(gridLineRowContainer.render().el);
		// },
		/**
		 * 页面渲染方法
		 * @method render
		 */
		render: function() {
			this.attributesRender(this.boxAttributes);
			this.cellsContainer = new CellsContainer({
				boxAttributes: {
					height: this.boxModel.height,
					width: this.boxModel.width
				},
				parentView: this
			});
			this.$el.append(this.cellsContainer.render().el);
			this.addBackGround();
			this.triggerCallback();
			return this;
		},

		//for new diff object, subscribe it self object.
		subscribeScroll: function(value, directionObj) {
			this.appointPosition(value, directionObj.direction);
		},
		// appoint position , don't pass preventScroll action .
		appointPosition: function(value, direction) {
			this.isPreventScroll = false;
			if (direction === 'TRANSVERSE') {
				this.$el.scrollLeft(value);
			}
			if (direction === 'VERTICAL') {
				this.$el.scrollTop(value);
			}
		},
		/**
		 * 绑定其他视图
		 * @method triggerCallback
		 */
		triggerCallback: function() {
			_.bindAll(this, 'callView');
			Backbone.trigger('call:bodyContainer', this.callView('viewBodyContainer'));
			// Backbone.trigger('call:colsAllHeadContainer', this.callView('viewColsAllHeadContainer'));
		},
		callView: function(name) {
			var object = this;
			return function(callback) {
				object[name] = callback;
			};
		},
		/**
		 * 用于其他视图绑定
		 * @method callMainContainer
		 * @param  receiveFunc {Function} 回调函数
		 */
		callMainContainer: function(receiveFunc) {
			receiveFunc(this);
		},
		/**
		 * 渲染容器宽度，高度
		 * @method attributesRender
		 * @param  newAttributes {Object} 宽高
		 */
		attributesRender: function(newAttributes) {
			this.$el.css({
				'width': newAttributes.width,
				'height': newAttributes.height
			});
			if (newAttributes.style) {
				this.$el.addClass(newAttributes.style);
			}
		},
		//待修改
		nextCellPosition: function(direction) {
			switch (direction) {
				case 'LEFT':
					break;
				case 'RIGHT':
					break;
				case 'UP':
					break;
				case 'DOWN':
					this.downCellPosition();
					break;
				default:
					break;
			}
		},
		/**
		 * 输入回车，选中区域超出容器显示范围，进行向下滚动
		 */
		downCellPosition: function() {
			var rowAliasArray = [],
				loadStartAlias = [],
				loadEndAlias,
				offsetTop,
				userViewTop,
				recordScrollTop,
				cellModel,
				bottomHeadRowItem,
				top,
				i, len;


			//处理冻结情况,只有主区域能够进行滚动
			if (cache.TempProp.isFrozen &&
				(this.currentRule.displayPosition.endRowIndex ||
					this.currentRule.displayPosition.endColIndex)) {
				return;
			}

			//判断是否存在单元格未全部初始化
			cellModel = cells.getCellsByWholeSelectRegion()[0];
			if (cellModel === null) {
				rowAliasArray.push(selectRegions.models[0].get('wholePosi').startY);
			} else {
				rowAliasArray = cellModel.get('occupy').y;
			}

			len = rowAliasArray.length;
			for (i = 0; i < len; i++) {
				if (headItemRows.getIndexByAlias(rowAliasArray[i]) === -1) {
					loadStartAlias = rowAliasArray[i];
					break;
				}
			}
			if (loadStartAlias !== undefined) {
				loadEndAlias = rowAliasArray[len - 1];
			}
			bottomHeadRowItem = headItemRows.getModelByAlias(rowAliasArray[len - 1]);
			//判断Excel冻结状态，非冻结状态(冻结高度为0，用户可视起点高度为0)
			if (cache.TempProp.isFrozen === true) {
				offsetTop = this.currentRule.displayPosition.offsetTop;
				userViewTop = headItemRows.getModelByAlias(cache.UserView.rowAlias).get('top');
			} else {
				offsetTop = 0;
				userViewTop = 0;
			}
			//重新定位，可视区域底部高度值
			top = bottomHeadRowItem.get('top') + bottomHeadRowItem.get('height') + config.User.cellHeight + 10 - offsetTop - userViewTop;

			if (top < this.el.scrollTop + this.el.offsetHeight) {
				return;
			}
			recordScrollTop = this.el.scrollTop;
			this.el.scrollTop = (top - this.el.offsetHeight);
			this.deleteTop(recordScrollTop);
			this.addBottom(recordScrollTop);
		},
		/**
		 * 处理鼠标滚动事件
		 * @method syncScroll
		 * @param  {event} e 鼠标滚动事件
		 */
		syncScroll: function() {
			var verticalDirection,
				transverseDirection,
				modelRowList,
				modelColList,
				userViewRowModel,
				userViewColModel,
				userViewEndRowModel,
				userViewEndColModel,
				currentDisplayViewTop = this.recordScrollTop,
				currentDisplayViewLeft = this.recordScrollLeft;

			this.preventAutoScroll();
			this.triggerCallback();

			verticalDirection = currentDisplayViewTop - this.el.scrollTop;
			transverseDirection = currentDisplayViewLeft - this.el.scrollLeft;
			//save user view position , alias
			if (!cache.TempProp.isFrozen) {
				modelRowList = headItemRows;
				modelColList = headItemCols;
				userViewRowModel = modelRowList.getModelByPosition(this.recordScrollTop);
				userViewEndRowModel = modelRowList.getModelByPosition(this.recordScrollTop + this.el.offsetHeight);

				cache.UserView.rowAlias = userViewRowModel.get('alias');
				cache.UserView.rowEndAlias = userViewEndRowModel.get('alias');
				userViewColModel = modelColList.getModelByPosition(this.recordScrollLeft);
				userViewEndColModel = modelColList.getModelByPosition(this.recordScrollLeft + this.el.offsetWidth);
				cache.UserView.colAlias = userViewColModel.get('alias');
			}

			//as scrollbar scroll up
			if (verticalDirection > 0) {
				this.addTop(currentDisplayViewTop);
				this.deleteBottom(currentDisplayViewTop);
			}
			//as scrollbar scroll down
			if (verticalDirection < 0) {
				//delete top row
				this.addBottom(currentDisplayViewTop);
				this.deleteTop(currentDisplayViewTop);
			}
			if (transverseDirection < 0) {
				this.addRight();
				this.deleteLeft();
			}
			if (transverseDirection > 0) {
				this.addLeft();
				this.deleteRight();
			}

		},
		/**
		 * 显示行上方超出预加载区域，删除超出视图
		 * @method deleteTop
		 * @param {num} localRecordScrollTop 上下移动，缓存高度
		 */
		deleteTop: function() {
			var currentTop,
				currentLimitTop,
				startIndex,
				endIndex,
				tempCellList,
				offset,
				headItemRowList = headItemRows.models,
				offsetTop = 0,
				userViewTop = 0,
				i;

			//冻结情况，计算视图的偏移量
			if (cache.TempProp.isFrozen === true) {
				offsetTop = this.currentRule.displayPosition.offsetTop;
				userViewTop = headItemRows.getModelByAlias(cache.UserView.rowAlias).get('top');
			}
			offset = offsetTop + userViewTop;
			currentLimitTop = offset + this.el.scrollTop - config.System.prestrainHeight;
			currentLimitTop = currentLimitTop > 0 ? currentLimitTop : 0;
			currentTop = cache.gridLineView.top;
			if (currentTop > currentLimitTop) {
				return;
			}
			startIndex = binary.newModelBinary(currentTop, headItemRowList, 'top', 'height');
			endIndex = binary.newModelBinary(currentLimitTop, headItemRowList, 'top', 'height');
			if (endIndex - startIndex < 1) {
				return;
			}
			for (i = startIndex; i < endIndex; i++) {
				headItemRowList[i].destroyView();
			}
			//删除超过加载区域(视图区+预加载区)cell视图对象
			tempCellList = cells.getCellsByRowIndex(startIndex, endIndex - 1);
			for (i = 0; i < tempCellList.length; i++) {
				//判断cell视图对象最上端区域是否仍在加载区域(视图区+预加载区)
				if (tempCellList[i].get('physicsBox').top + tempCellList[i].get('physicsBox').height < currentLimitTop) {
					tempCellList[i].hide();
				}
			}
			cache.gridLineView.top = headItemRowList[endIndex].get('physicsBox').top;
		},
		/**
		 * 显示行上方到达加载区域，添加视图视图
		 * @method addTop
		 * @param {num} localRecordScrollTop 上下移动，缓存高度
		 */
		addTop: function() {
			var headItemRowList = headItemRows.models,
				offset, //容器内部左边界偏移量
				offsetTop = 0,
				userViewTop = 0,
				isUnload = false,
				fristViewIndex,
				currentTop = cache.gridLineView.top, //当前视图显示上边界
				currentLimitTop,
				currentLimitBottom;
			//用于冻结情况的处理
			if (cache.TempProp.isFrozen === true) {
				offsetTop = this.currentRule.displayPosition.offsetLeft;
				userViewTop = headItemRows.getModelByAlias(cache.UserView.rowAlias).get('top');
			}
			offset = offsetTop + userViewTop;
			currentLimitTop = Math.floor(this.el.scrollTop - config.System.prestrainHeight);
			currentLimitBottom = Math.floor(this.el.scrollTop + this.el.offsetHeight + config.System.prestrainHeight);
			currentTop = currentTop < currentLimitBottom ? currentTop : currentLimitBottom;
			currentLimitTop = currentLimitTop > 0 ? currentLimitTop : 0;
			if (currentTop < currentLimitTop) {
				return;
			}
			isUnload = loadRecorder.isIncludeUnLoadRegion(cache.gridLineView.left,
				cache.gridLineView.right, currentLimitTop, currentTop, cache.gridLineLoadRegion);
			if (isUnload) {
				this.requestRegionData(cache.gridLineView.left,
					cache.gridLineView.right, currentLimitTop, currentTop);
			}
			//从新加载列视图
			Backbone.trigger('event:restoreRowView', {
				start: currentLimitTop,
				end: currentTop
			});
			//从新加载单元格视图
			Backbone.trigger('event:restoreCellView', {
				left: cache.gridLineView.left,
				right: cache.gridLineView.right,
				top: currentLimitTop,
				bottom: currentTop
			});

			fristViewIndex = binary.newModelBinary(currentLimitTop, headItemRowList, 'top', 'height');
			cache.gridLineView.top = headItemRowList[fristViewIndex].get('top');
		},
		/**
		 * 显示行下方到达加载区域，添加视图视图
		 * @method addBottom
		 */
		addBottom: function() {
			var len, i,
				startIndex,
				endIndex,
				headItemRowList = headItemRows.models,
				maxBottom,
				lastHeadItem,
				offset, //容器内部下边界偏移量
				offsetTop = 0,
				userViewTop = 0,
				isUnload = false,
				loadBottom,
				lastViewIndex,
				localMaxBottom = cache.localRowPosi, //服务端列对象最大下边界
				currentBottom = cache.gridLineView.bottom, //当前视图显示下边界
				currentLimitTop,
				currentLimitBottom; //当前视图需要显示右边界
			//用于冻结情况的处理
			if (cache.TempProp.isFrozen === true) {
				offsetTop = this.currentRule.displayPosition.offsetTop;
				userViewTop = headItemRows.getModelByAlias(cache.UserView.colAlias).get('top');
			}
			offset = offsetTop + userViewTop;

			currentLimitBottom = Math.floor(this.el.scrollTop + this.el.offsetHeight + config.System.prestrainHeight);
			currentLimitTop = Math.floor(this.el.scrollTop - config.System.prestrainHeight);
			currentBottom = currentBottom > currentLimitTop ? currentBottom : currentLimitTop;
			//需要添加一个currentBottom的判断，如果currentBottom出现了小于top预加载情况
			if (currentBottom > currentLimitBottom) {
				return;
			}
			if (currentBottom < localMaxBottom) {
				//请求区域数据localMaxRight;
				loadBottom = currentLimitBottom < localMaxBottom ? currentLimitBottom : localMaxBottom;
				isUnload = loadRecorder.isIncludeUnLoadRegion(cache.gridLineView.left,
					cache.gridLineView.right, currentBottom, loadBottom, cache.gridLineLoadRegion);
				if (isUnload) {
					this.requestRegionData(cache.gridLineView.left,
						cache.gridLineView.right, currentBottom, loadBottom);
				}
				//重新加载行视图
				Backbone.trigger('event:restoreRowView', {
					start: currentBottom,
					end: loadBottom
				});
				//重新加载单元格视图
				Backbone.trigger('event:restoreCellView', {
					left: cache.gridLineView.left,
					right: cache.gridLineView.right,
					top: currentBottom,
					bottom: loadBottom
				});
			}
			lastHeadItem = headItemRowList[headItemRowList.length - 1];
			maxBottom = lastHeadItem.get('top') + lastHeadItem.get('height');
			//自增行对象
			if (localMaxBottom < currentLimitBottom && maxBottom < currentLimitBottom) {
				startIndex = headItemRows.length - 1;
				len = Math.ceil((currentLimitBottom - maxBottom) / config.User.cellHeight);
				if ((len + headItemRows.length) > config.User.maxRowNum) {
					len = config.User.maxRowNum - headItemRows.length;
				}
				for (i = 0; i < len; i++) {
					headItemRows.generate();
				}
				endIndex = headItemRows.length - 1;
				//处理含有整行操作
				rowOperate.generateRow(startIndex, endIndex);
				//修改单元格加载区域
				//发送增长列长度 len
				send.PackAjax({
					url: 'sheet.htm?m=addrowline',
					data: JSON.stringify({
						sheetId: '1',
						rowNum: len
					})
				});
			}
			lastViewIndex = binary.newModelBinary(currentLimitBottom, headItemRowList, 'top', 'height');
			cache.gridLineView.bottom = headItemRowList[lastViewIndex].get('left') + headItemRowList[lastViewIndex].get('width');
			//整行选中状态处理(选中视图绑定事件)
			Backbone.trigger('event:cellsContainer:adaptHeight');
			Backbone.trigger('event:colsAllHeadContainer:adaptHeight');
			Backbone.trigger('event:selectRegionContainer:adapt');
		},
		/**
		 * 显示行下方超出预加载区域，删除超出视图
		 * @method deleteBottom
		 */
		deleteBottom: function() {
			var currentBottom = cache.gridLineView.bottom,
				currentLimitBottom,
				startIndex,
				endIndex,
				tempCellList,
				offset,
				headItemRowList = headItemRows.models,
				offsetTop = 0,
				userViewTop = 0,
				i;

			//冻结情况，计算视图的偏移量
			if (cache.TempProp.isFrozen === true) {
				offsetTop = this.currentRule.displayPosition.offsetTop;
				userViewTop = headItemRows.getModelByAlias(cache.UserView.rowAlias).get('top');
			}
			offset = offsetTop + userViewTop;
			currentLimitBottom = offset + this.el.scrollTop + this.el.offsetHeight + config.System.prestrainHeight;
			if (currentBottom <= currentLimitBottom) {
				return;
			}
			startIndex = binary.newModelBinary(currentLimitBottom, headItemRowList, 'top', 'height');
			endIndex = binary.newModelBinary(currentBottom, headItemRowList, 'left', 'width');
			//索引为startIndex的视图，不做隐藏处理
			if (endIndex - startIndex < 1) {
				return;
			}
			for (i = startIndex + 1; i < endIndex; i++) {
				headItemRowList[i].destroyView();
			}
			//删除超过加载区域(视图区+预加载区)cell视图对象
			tempCellList = cells.getCellsByRowIndex(startIndex + 1, endIndex);
			for (i = 0; i < tempCellList.length; i++) {
				//判断cell视图对象最上端区域是否仍在加载区域(视图区+预加载区)
				if (tempCellList[i].get('physicsBox').top > currentLimitBottom) {
					tempCellList[i].hide();
				}
			}
			cache.gridLineView.bottom = headItemRowList[endIndex].get('top') + headItemRowList[endIndex].get('height');
		},
		addRight: function() {
			var len, i,
				startIndex,
				endIndex,
				maxRight,
				headItemColList = headItemCols.models,
				lastHeadItem,
				offset, //容器内部左边界偏移量
				offsetLeft = 0,
				userViewLeft = 0,
				isUnload = false,
				loadRight,
				lastViewIndex,
				localMaxRight = cache.localColPosi, //服务端列对象最大右边界
				currentRight = cache.gridLineView.right, //当前视图显示右边界
				currentLimitLeft, //当前视图需要显示左边界
				currentLimitRight; //当前视图需要显示右边界
			//用于冻结情况的处理
			if (cache.TempProp.isFrozen === true) {
				offsetLeft = this.currentRule.displayPosition.offsetLeft;
				userViewLeft = headItemCols.getModelByAlias(cache.UserView.colAlias).get('left');
			}
			offset = offsetLeft + userViewLeft;
			currentLimitRight = Math.floor(this.el.scrollLeft + this.el.offsetWidth + config.System.prestrainWidth);
			currentLimitLeft = Math.floor(this.el.scrollLeft - config.System.prestrainWidth);
			currentRight = currentRight < currentLimitLeft ? currentRight : currentLimitLeft;
			if (currentRight > currentLimitRight) {
				return;
			}
			if (currentRight < localMaxRight) {
				//请求区域数据localMaxRight;
				loadRight = currentLimitRight < localMaxRight ? currentLimitRight : localMaxRight;
				isUnload = loadRecorder.isIncludeUnLoadRegion(currentRight,
					loadRight, cache.gridLineView.top, cache.gridLineView.bottom, cache.gridLoadRegion);
				if (isUnload) {
					this.requestRegionData(currentRight, loadRight, cache.gridLineView.top, cache.gridLineView.bottom);
				}
				//从新加载列视图
				Backbone.trigger('event:restoreColView', {
					start: currentRight,
					end: loadRight
				});
				//从新加载单元格视图
				Backbone.trigger('event:restoreCellView', {
					left: currentRight,
					right: loadRight,
					top: cache.gridLineView.top,
					bottom: cache.gridLineView.bottom
				});
			}
			//自增加列对象
			lastHeadItem = headItemColList[headItemColList.length - 1];
			maxRight = lastHeadItem.get('left') + lastHeadItem.get('width');
			if (localMaxRight < currentLimitRight && maxRight < currentLimitRight) {
				startIndex = headItemCols.length - 1;
				len = Math.ceil((currentLimitRight - maxRight) / config.User.cellWidth);
				if ((len + headItemCols.length) > config.User.maxColNum) {
					len = config.User.maxColNum - headItemCols.length;
				}
				for (i = 0; i < len; i++) {
					headItemCols.generate();
				}
				endIndex = headItemCols.length - 1;
				//处理含有整行操作
				rowOperate.generateCol(startIndex, endIndex);
				//发送增长列长度 len
				send.PackAjax({
					url: 'sheet.htm?m=addcolline',
					data: JSON.stringify({
						sheetId: '1',
						colNum: len
					})
				});
			}
			lastViewIndex = binary.newModelBinary(currentLimitRight, headItemColList, 'left', 'width');
			cache.gridLineView.right = headItemColList[lastViewIndex].get('left') + headItemColList[lastViewIndex].get('width');
			//整行选中状态处理(选中视图绑定事件)
			Backbone.trigger('event:cellsContainer:adaptWidth');
			Backbone.trigger('event:colsAllHeadContainer:adaptWidth');
			Backbone.trigger('event:selectRegionContainer:adapt');
		},
		addLeft: function() {
			var headItemColList = headItemCols.models,
				offset, //容器内部左边界偏移量
				offsetLeft = 0,
				userViewLeft = 0,
				isUnload = false,
				fristViewIndex,
				currentLeft = cache.gridLineView.left, //当前视图显示右边界
				currentLimitRight,
				currentLimitLeft; //当前视图需要显示右边界
			//用于冻结情况的处理
			if (cache.TempProp.isFrozen === true) {
				offsetLeft = this.currentRule.displayPosition.offsetLeft;
				userViewLeft = headItemCols.getModelByAlias(cache.UserView.colAlias).get('left');
			}
			offset = offsetLeft + userViewLeft;
			currentLimitLeft = Math.floor(this.el.scrollLeft - config.System.prestrainWidth);
			currentLimitRight = Math.floor(this.el.scrollLeft + this.el.offsetWidth + config.System.prestrainWidth);
			currentLeft = currentLeft < currentLimitRight? currentLeft : currentLimitRight;
			currentLimitLeft = currentLimitLeft > 0 ? currentLimitLeft : 0;
			if (currentLeft < currentLimitLeft) {
				return;
			}
			isUnload = loadRecorder.isIncludeUnLoadRegion(currentLimitLeft,
				currentLeft, cache.gridLineView.top, cache.gridLineView.bottom, cache.gridLineLoadRegion);
			if (isUnload) {
				this.requestRegionData(currentLimitLeft, currentLeft, cache.gridLineView.top, cache.gridLineView.bottom);
			}
			//从新加载列视图
			Backbone.trigger('event:restoreColView', {
				start: currentLeft,
				end: currentLimitLeft
			});
			//从新加载单元格视图
			Backbone.trigger('event:restoreCellView', {
				left: currentLeft,
				right: currentLimitLeft,
				top: cache.gridLineView.top,
				bottom: cache.gridLineView.bottom
			});

			fristViewIndex = binary.newModelBinary(currentLimitLeft, headItemColList, 'left', 'width');
			cache.gridLineView.left = headItemColList[fristViewIndex].get('left');
		},

		deleteLeft: function() {
			var currentLeft =cache.gridLineView.left,
				currentLimitLeft,
				startIndex,
				endIndex,
				tempCellList,
				offset,
				headItemColList = headItemCols.models,
				offsetLeft = 0,
				userViewLeft = 0,
				i;

			//冻结情况，计算视图的偏移量
			if (cache.TempProp.isFrozen === true) {
				offsetLeft = this.currentRule.displayPosition.offsetLeft;
				userViewLeft = headItemCols.getModelByAlias(cache.UserView.colAlias).get('left');
			}
			offset = offsetLeft + userViewLeft;
			currentLimitLeft = offset + this.el.scrollLeft - config.System.prestrainWidth;
			currentLimitLeft = currentLimitLeft > 0 ? currentLimitLeft : 0;
			if (currentLeft >= currentLimitLeft) {
				return;
			}
			startIndex = binary.newModelBinary(currentLeft, headItemColList, 'left', 'width');
			endIndex = binary.newModelBinary(currentLimitLeft, headItemColList, 'left', 'width');
			if (endIndex - startIndex < 1) {
				return;
			}
			for (i = startIndex; i < endIndex; i++) {
				headItemColList[i].destroyView();
			}
			//删除超过加载区域(视图区+预加载区)cell视图对象
			tempCellList = cells.getCellsByColIndex(startIndex, endIndex - 1);
			for (i = 0; i < tempCellList.length; i++) {
				//判断cell视图对象最上端区域是否仍在加载区域(视图区+预加载区)
				if (tempCellList[i].get('left') + tempCellList[i].get('width') < currentLimitLeft) {
					tempCellList[i].hide();
				}
			}
			cache.gridLineView.left = headItemColList[endIndex].get('left');
		},
		deleteRight: function() {
			var currentRight =cache.gridLineView.right,
				currentLimitRight,
				startIndex,
				endIndex,
				tempCellList,
				offset,
				headItemColList = headItemCols.models,
				offsetLeft = 0,
				userViewLeft = 0,
				i;

			//冻结情况，计算视图的偏移量
			if (cache.TempProp.isFrozen === true) {
				offsetLeft = this.currentRule.displayPosition.offsetLeft;
				userViewLeft = headItemCols.getModelByAlias(cache.UserView.colAlias).get('left');
			}
			offset = offsetLeft + userViewLeft;
			currentLimitRight = offset + this.el.scrollLeft + this.el.offsetWidth + config.System.prestrainWidth;
			if (currentRight <= currentLimitRight) {
				return;
			}
			startIndex = binary.newModelBinary(currentLimitRight, headItemColList, 'left', 'width');
			endIndex = binary.newModelBinary(currentRight, headItemColList, 'left', 'width');
			//索引为startIndex的视图，不做隐藏处理
			if (endIndex - startIndex < 1) {
				return;
			}
			for (i = startIndex + 1; i < endIndex; i++) {
				headItemColList[i].destroyView();
			}
			//删除超过加载区域(视图区+预加载区)cell视图对象
			tempCellList = cells.getCellsByColIndex(startIndex + 1, endIndex);
			for (i = 0; i < tempCellList.length; i++) {
				//判断cell视图对象最上端区域是否仍在加载区域(视图区+预加载区)
				if (tempCellList[i].get('left') > currentLimitRight) {
					tempCellList[i].hide();
				}
			}
			cache.gridLineView.right = headItemColList[endIndex].get('left') + headItemColList[endIndex].get('width');
		},
		requestRegionData: function(left, right, top, bottom) {
			var temp,
				startRowSort,
				startColSort;
			if (bottom < top) {
				temp = bottom;
				bottom = top;
				top = temp;
			}
			if (right < left) {
				temp = right;
				right = left;
				left = temp;
			}
			send.PackAjax({
				url: 'excel.htm?m=openexcel',
				async: false,
				isPublic: false,
				data: JSON.stringify({
					rowBegin: top,
					rowEnd: bottom,
					colBegin: left,
					colEnd: right
				}),
				success: function(data) {
					if (data === '') {
						return;
					}
					data = data.returndata;
					var cellModels = data.spreadSheet[0].sheet.cells;
					var rows = data.spreadSheet[0].sheet.glY;
					var cols = data.spreadSheet[0].sheet.glX;
					startRowSort = data.dataRowStartIndex;
					startColSort = data.dataColStartIndex;
					original.analysisRowData(rows, startRowSort);
					original.analysisColData(cols, startColSort);
					original.analysisCellData(cellModels);
				}
			});
			loadRecorder.insertLoadRegion(left, right, top, bottom, cache.gridLineLoadRegion);
		},
		/**
		 * 禁止鼠标拖动超出单元格区域，单元格区域移动
		 * @method preventAutoScroll
		 */
		preventAutoScroll: function() {
			var distanceLeft,
				distanceRight,
				distanceTop,
				distanceBottom;
			if (this.isPreventScroll) {
				//for get this offsetleft value , because of this div in table . so this offsetleft equal 0 ,
				//then we get other method get it's offsetleft value
				//code example : this.viewBodyContainer.el.innerWidth - this.el.offsetWidth

				distanceLeft = this.viewBodyContainer.mousePageX - (this.viewBodyContainer.el.offsetWidth - this.el.offsetWidth);
				distanceTop = this.viewBodyContainer.mousePageY - (this.viewBodyContainer.el.offsetHeight - this.el.offsetHeight - config.System.outerBottom);
				distanceBottom = distanceTop - this.el.clientHeight;
				distanceRight = distanceLeft - this.el.clientWidth;

				if (distanceRight >= 0 || distanceLeft <= 0) {
					this.el.scrollLeft = this.recordScrollLeft;
				} else {
					this.recordScrollLeft = this.el.scrollLeft;
					this.publish(this.recordScrollLeft, 'transversePublish');
				}

				if (distanceBottom >= 0 || distanceTop <= 0) {
					this.el.scrollTop = this.recordScrollTop;
				} else {
					this.recordScrollTop = this.el.scrollTop;
					this.publish(this.recordScrollTop, 'verticalPublish');
				}
			}
			//did'nt prevent scoll and ensure it's main area ,
			if (!this.isPreventScroll && this.currentRule.eventScroll) {
				if (this.recordScrollLeft !== this.el.scrollLeft) {
					this.recordScrollLeft = this.el.scrollLeft;
					this.publish(this.recordScrollLeft, 'transversePublish');
				}
				if (this.recordScrollTop !== this.el.scrollTop) {
					this.recordScrollTop = this.el.scrollTop;
					this.publish(this.recordScrollTop, 'verticalPublish');
				}
			}
			this.isPreventScroll = true;
		},
		/**
		 * 加载行对象时，对进行过整列操作的列的所在单元格进行相应的渲染
		 * @param  {int} startIndex 行起始坐标
		 * @param  {int} endIndex   行结束坐标
		 */
		// adjustColPropCell: function(startIndex, endIndex) {
		// 	var headItemColList,
		// 		headItemRowList,
		// 		headItemModel,
		// 		aliasCol,
		// 		aliasRow,
		// 		cellModel,
		// 		occupyCol,
		// 		colProp,
		// 		cellProp,
		// 		len, i = 0,
		// 		j;

		// 	headItemColList = headItemCols.models;
		// 	headItemRowList = headItemRows.models;

		// 	len = headItemColList.length;
		// 	occupyCol = cache.CellsPosition.strandX;
		// 	for (; i < len; i++) {
		// 		headItemModel = headItemColList[i];
		// 		colProp = headItemModel.get('operProp');
		// 		if (!$.isEmptyObject(colProp)) {
		// 			for (j = startIndex; j < endIndex + 1; j++) {
		// 				aliasCol = headItemColList[i].get('alias');
		// 				aliasRow = headItemRowList[j].get('alias');
		// 				if (occupyCol[aliasCol] === undefined || occupyCol[aliasCol][aliasRow] === undefined) {
		// 					cells.createCellModel(i, j, colProp);
		// 				}
		// 			}
		// 		}
		// 	}
		// },
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			Backbone.off('call:mainContainer');
			Backbone.off('event:mainContainer:destroy');
			Backbone.off('event:mainContainer:attributesRender');
			this.cellsContainer.destroy();
			this.remove();
		}
	});
	return MainContainer;
});