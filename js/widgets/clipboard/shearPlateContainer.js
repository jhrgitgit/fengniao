	define(function(require) {
		'use strict';
		var $ = require('lib/jquery'),
			_ = require('lib/underscore'),
			Backbone = require('lib/backbone'),
			Cell = require('models/cell'),
			headItemCols = require('collections/headItemCol'),
			headItemRows = require('collections/headItemRow'),
			selectRegions = require('collections/selectRegion'),
			cells = require('collections/cells'),
			cache = require('basic/tools/cache'),
			send = require('basic/tools/send'),
			copy = require('entrance/tool/copy'),
			ShearPlateContainer;

		/**
		 * 剪切板视图类
		 * @author ray wu
		 * @since 0.1.0
		 * @class ShearPlateContainer  
		 * @module views
		 * @extends Backbone.View
		 * @constructor
		 */
		ShearPlateContainer = Backbone.View.extend({
			/**
			 * 绑定视图
			 * @property el
			 * @type {String}
			 */
			el: "#shearPlateContainer",
			/**
			 * 类初始化方法
			 * @method initialize
			 */
			initialize: function() {
				_.bindAll(this, 'pasteData');
				Backbone.on('event:pasteData', this.pasteData);
			},
			events: {
				'mousedown div': 'pasteAction'
			},
			pasteAction: function(e) {
				var action;
				action = $(e.currentTarget).data('toolbar');
				switch (action) {
					case 'paste':
						this.pasteData();
						break;
					case 'copy':
						this.copyData();
						break;
					case 'cut':
						this.cutData();
						break;
					default:
						break;
				}
			},
			/**
			 * 复制数据
			 * @method pasteData
			 * @param  {string} pasteText 数据 
			 */
			pasteData: function(pasteText) {
				if (cache.clipState === "copy") {
					this.excelDataPaste();
				} else {
					this.clipBoardDataPaste(pasteText);
				}

			},
			/**
			 * 剪切数据
			 * @method pasteData
			 * @param  {string} pasteText 数据 
			 */
			cutData: function() {},
			/**
			 * 复制数据
			 * @method pasteData
			 * @param  {string} pasteText 数据 
			 */
			copyData: function() {
				copy();
			},
			/**
			 * 现在粘贴数据
			 * @method pasteData
			 * @param  {string} pasteText 数据 
			 */
			excelDataPaste: function() {
				var clipRegion,
					selectRegion,
					startColIndex,
					startRowIndex,
					endColIndex,
					endRowIndex,
					clipColAlias,
					clipRowAlias,
					selectColAlias,
					selectRowAlias,
					relativeColIndex,
					relativeRowIndex,
					tempCopyCellModel,
					tempCellModel,
					CellModel,
					sendData = [],
					text = "",
					i,
					j;

				clipRegion = selectRegions.getModelByType("clip")[0];
				selectRegion = selectRegions.getModelByType("operation")[0];

				startColIndex = clipRegion.get("wholePosi").startX;
				startRowIndex = clipRegion.get("wholePosi").startY;
				endColIndex = clipRegion.get("wholePosi").endX;
				endRowIndex = clipRegion.get("wholePosi").endY;

				relativeColIndex = startColIndex - selectRegion.get("wholePosi").startX;
				relativeRowIndex = startRowIndex - selectRegion.get("wholePosi").startY;

				if (this.isAblePaste(endRowIndex - startRowIndex + 1, endColIndex - startColIndex + 1) === false) return;

				for (i = startRowIndex; i < endRowIndex + 1; i++) {
					for (j = startColIndex; j < endColIndex + 1; j++) {
						clipColAlias = headItemCols.models[j].get('alias');
						clipRowAlias = headItemRows.models[i].get('alias');
						selectColAlias = headItemCols.models[j - relativeColIndex].get('alias');
						selectRowAlias = headItemRows.models[i - relativeRowIndex].get('alias');
						tempCellModel = cells.getCellByAlias(selectColAlias, selectRowAlias);
						if (tempCellModel !== null) {
							tempCellModel.set('isDestroy', true);
							this.deletePosi(selectColAlias, selectRowAlias);
						}
						CellModel = cells.getCellByAlias(clipColAlias, clipRowAlias);
						if (CellModel !== null) {
							tempCopyCellModel = CellModel.clone();
							this.adaptCell(tempCopyCellModel, relativeColIndex, relativeRowIndex);
							cells.add(tempCopyCellModel);
						}
					}
				}
				//增加消息发送
				cache.clipState = "null";
				clipRegion.destroy();
			},
			adaptCell: function(cell, relativeColIndex, relativeRowIndex) {
				var arrayOriginalColAlias,
					arrayOriginalRowAlias,
					arrayColAlias = [],
					arrayRowAlias = [],
					colIndex,
					rowIndex,
					left, top,
					width = 0,
					height = 0,
					rowLen, colLen, i;

				arrayOriginalColAlias = cell.get("occupy").x;
				arrayOriginalRowAlias = cell.get("occupy").y;
				rowLen = arrayOriginalRowAlias.length;
				colLen = arrayOriginalColAlias.length;
				//增加超过加载区域处理
				for (i = 0; i < rowLen; i++) {
					rowIndex = headItemRows.getIndexByAlias(arrayOriginalRowAlias[i]) - relativeRowIndex;
					arrayRowAlias.push(headItemRows.models[rowIndex].get("alias"));
					height += headItemRows.models[rowIndex].get("height") + 1;
					if (i === 0) top = headItemRows.models[rowIndex].get("top");
				}
				for (i = 0; i < colLen; i++) {
					colIndex = headItemCols.getIndexByAlias(arrayOriginalColAlias[i]) - relativeColIndex;
					arrayColAlias.push(headItemCols.models[colIndex].get("alias"));
					width += headItemCols.models[colIndex].get("width") + 1;
					if (i === 0) left = headItemCols.models[colIndex].get("left");
				}

				cell.set("occupy", {
					x: arrayColAlias,
					y: arrayRowAlias
				});
				cell.set("physicsBox", {
					top: top,
					left: left,
					width: width - 1,
					height: height - 1
				});
			},
			deletePosi: function(aliasCol, aliasRow) {
				var currentCellPosition = cache.CellsPosition,
					currentStrandX = currentCellPosition.strandX,
					currentStrandY = currentCellPosition.strandY;
				if (currentStrandX[aliasCol] !== undefined && currentStrandX[aliasCol][aliasRow] !== undefined) {
					delete currentStrandX[aliasCol][aliasRow];
					if (!Object.getOwnPropertyNames(currentStrandX[aliasCol]).length) {
						delete currentStrandX[aliasCol];
					}
				}
				if (currentStrandY[aliasRow] !== undefined && currentStrandY[aliasRow][aliasCol] !== undefined) {
					delete currentStrandY[aliasRow][aliasCol];
					if (!Object.getOwnPropertyNames(currentStrandY[aliasRow]).length) {
						delete currentStrandY[aliasRow];
					}
				}
			},
			/**
			 * 剪切板数据源数据解析
			 * @method shearPlateDataPaste
			 * @param  {String} pasteText 复制数据内容
			 */
			clipBoardDataPaste: function(pasteText) {
				var encodeText,
					rowData = [],
					tempCellData = [],
					decodeText,
					sendData = [],
					clipRegion;

				encodeText = encodeURI(pasteText);
				rowData = encodeText.split('%0D%0A');
				if (this.isAblePaste(rowData.length - 1, rowData[0].split('%09').length) === false) return;

				for (var i = 0; i < rowData.length; i++) {
					tempCellData = rowData[i].split('%09');
					for (var j = 0; j < tempCellData.length; j++) {
						if (tempCellData[j] !== '') {
							sendData.push(this.textToCell(i, j, decodeURI(analysisText(tempCellData[j]))));
						}
					}
				}

				clipRegion = selectRegions.getModelByType("clip")[0];
				if (clipRegion !== null && clipRegion !== undefined) {
					clipRegion.destory();
				}
				cache.clipState = "null";
				send.PackAjax({
					url: 'plate.htm?m=paste',
					data: JSON.stringify({
						excelId: window.SPREADSHEET_AUTHENTIC_KEY,
						sheetId: '1',
						pasteData: sendData
					})
				});

				function analysisText(text) {
					var head = '',
						tail = '';
					if (text.indexOf("%0A") === -1) {
						return text;
					}
					text = text.substring(3, text.length - 3);
					while (true) {
						if (text.indexOf("%22%22") === 0) {
							text = text.substring(6);
							head += "%22";
						} else {
							break;
						}
					}
					while (true) {
						if (text.lastIndexOf("%22%22") === text.length - 6 && text.length > 6) {
							text = text.substring(0, text.length - 6);
							tail += "%22";
						} else {
							break;
						}
					}
					text = head + text + tail;
					return text;
				}

			},
			isAblePaste: function(rowlen, collen) {
				var rowStartIndex,
					colStartIndex,
					rowEndIndex,
					colEndIndex,
					cellModelArray,
					i = 0;

				colStartIndex = selectRegions.models[0].get('wholePosi').startX;
				rowStartIndex = selectRegions.models[0].get('wholePosi').startY;
				rowEndIndex = rowStartIndex + rowlen - 1;
				colEndIndex = colStartIndex + collen - 1;
				cellModelArray = cells.getRegionCells(colStartIndex, rowStartIndex, colEndIndex, rowEndIndex);
				for (; i < cellModelArray.length; i++) {
					if (cellModelArray[i] === null) continue;
					if (cellModelArray[i].get('occupy').x.length > 1 || cellModelArray[i].get('occupy').y.length > 1) {
						return false;
					}
				}
				return true;
			},
			/**
			 * 将文本复制到单元格对象上面
			 * @method textToCell
			 * @param  {num} relativeRowIndex 相对行索引
			 * @param  {num} relativeColIndex 相对列索引
			 * @param  {String} text             文本
			 */
			textToCell: function(relativeRowIndex, relativeColIndex, text) {
				var cacheCell,
					tempCell,
					indexCol,
					indexRow,
					aliasCol,
					aliasRow,
					gridLineColList,
					gridLineRowList,
					result;

				if (text === '') return;
				gridLineColList = headItemCols.models;
				gridLineRowList = headItemRows.models;
				indexCol = selectRegions.models[0].get('wholePosi').startX + relativeColIndex;
				indexRow = selectRegions.models[0].get('wholePosi').startY + relativeRowIndex;

				tempCell = cells.getCellByX(indexCol, indexRow)[0];

				if (tempCell !== undefined && tempCell.get(isDestroy) === false) {
					tempCell = null;
					tempCell.set("isDestroy", true);
				}

				var top, left, width, height;
				top = gridLineRowList[indexRow].get('top');
				left = gridLineColList[indexCol].get('left');
				width = gridLineColList[indexCol].get('width');
				height = gridLineRowList[indexRow].get('height');
				cacheCell = new Cell();
				//判断是否已经存在单元格
				aliasCol = gridLineColList[indexCol].get('alias');
				aliasRow = gridLineRowList[indexRow].get('alias');
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
				cacheCell.set("content.texts", text);
				cache.cachePosition(aliasRow, aliasCol, cells.length);
				cells.add(cacheCell);
				result = {
					aliasCol: aliasCol,
					aliasRow: aliasRow,
					text: text
				};
				return result;
			}
		});
		return ShearPlateContainer;
	});