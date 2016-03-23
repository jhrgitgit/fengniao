define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		CellModel = require('models/cell'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion');
	/**
	 *cell集合类，管理cell对象
	 *@class Cells 
	 *@extends Backbone.Collection
	 *@constructor
	 *@author ray wu
	 *@module collections
	 *@since 0.1.0
	 */
	var Cells = Backbone.Collection.extend({
		/**
		 * 集合成员类型
		 * @property model 
		 * @type Cell
		 */
		model: CellModel,
		url: '/cell.htm',
		createCellModel: function(startColIndex, startRowIndex, endColIndex, endRowIndex) {
			var headItemColList,
				headItemRowList,
				rowLen,
				colLen,
				i = 0,
				j = 0,
				occupyCol = [],
				occupyRow = [],
				width = 0,
				height = 0,
				top,
				left;
			if (endColIndex === undefined) {
				endColIndex = startColIndex;
			}
			if (endRowIndex === undefined) {
				endRowIndex = startRowIndex;
			}
			headItemColList = headItemCols.models;
			headItemRowList = headItemRows.models;

			left = headItemColList[startColIndex].get('left');
			top = headItemRowList[startRowIndex].get('top');

			rowLen = endRowIndex - startRowIndex + 1;
			colLen = endColIndex - startColIndex + 1;

			//获取occupy信息
			for (i = 0; i < colLen; i++) {
				occupyCol.push(headItemColList[startColIndex + i].get('alias'));
				width += headItemColList[startColIndex + i].get('width') + 1;
			}
			for (i = 0; i < rowLen; i++) {
				occupyRow.push(headItemRowList[startRowIndex + i].get('alias'));
				height += headItemRowList[startRowIndex + i].get('height') + 1;
			}
			for (i = 0; i < rowLen; i++) {
				for (j = 0; j < colLen; j++) {
					cache.cachePosition(headItemRowList[startRowIndex + i].get('alias'), headItemColList[startColIndex + j].get('alias'), this.length);
				}
			}
			this.add({
				occupy: {
					x: occupyCol,
					y: occupyRow
				},
				physicsBox: {
					top: top,
					left: left,
					width: width - 1,
					height: height - 1
				}
			});
			return this.models[this.length - 1];
		},
		/**
		 * 通过cache.CellsPosition.strandX变量，获取区域内，包含所有cell对象
		 * @method getCellByX 
		 * @param  startIndexX {int} 区域左上顶点X轴索引
		 * @param  startIndexY {int} 区域左上顶点Y轴索引
		 * @param  endIndexX {[int]} 区域右下顶点X轴索引
		 * @param  endIndexY {[int]} 区域右下顶点Y轴索引
		 * @return {array} Cell数组
		 */
		getCellByX: function(startIndexX, startIndexY, endIndexX, endIndexY) {
			if (endIndexY === undefined) {
				endIndexY = startIndexY;
			}
			if (endIndexX === undefined) {
				endIndexX = startIndexX;
			}
			var cells = [],
				i, j;
			for (i = 0; i < endIndexX - startIndexX + 1; i++) {
				for (j = 0; j < endIndexY - startIndexY + 1; j++) {
					var indexX, indexY;
					indexX = headItemCols.models[startIndexX + i].get('alias');
					indexY = headItemRows.models[startIndexY + j].get('alias');

					if (cache.CellsPosition.strandX[indexX] !== undefined && cache.CellsPosition.strandX[indexX][indexY] !== undefined) {
						//cells去掉重复
						if (cells.indexOf(this.at(cache.CellsPosition.strandX[indexX][indexY])) == -1) {
							cells.push(this.at(cache.CellsPosition.strandX[indexX][indexY]));
						}
					}

				}
			}
			return cells;
		},
		/**
		 * 查询区域内包含所有cell对象
		 * @method getCellByX 
		 * @param  startIndexX {int} 区域左上顶点X轴索引
		 * @param  startIndexY {int} 区域左上顶点Y轴索引
		 * @param  endIndexX {[int]} 区域右下顶点X轴索引
		 * @param  endIndexY {[int]} 区域右下顶点Y轴索引
		 * @return {array} Cell数组
		 */
		getCellByRow: function(startIndexRow, startIndexCol, endIndexRow, endIndexCol) {
			if (endIndexRow === undefined) {
				endIndexRow = startIndexRow;
			}
			if (endIndexCol === undefined) {
				endIndexCol = startIndexCol;
			}
			var cells = [],
				i, j,
				rowAlias,
				colAlias;
			for (i = 0; i < endIndexRow - startIndexRow + 1; i++) {
				for (j = 0; j < endIndexCol - startIndexCol + 1; j++) {
					rowAlias = headItemRows.models[startIndexRow + i].get('alias');
					colAlias = headItemCols.models[startIndexCol + j].get('alias');

					if (cache.CellsPosition.strandY[rowAlias] !== undefined && cache.CellsPosition.strandY[rowAlias][colAlias] !== undefined) {
						//cells去掉重复
						if (cells.indexOf(this.at(cache.CellsPosition.strandY[rowAlias][colAlias])) == -1) {
							cells.push(this.at(cache.CellsPosition.strandY[rowAlias][colAlias]));
						}
					}

				}
			}
			return cells;

		},
		/**
		 * 获取区域内包含所有cell对象
		 * @method getSelectRegionCells 
		 * @param  startIndexCol {int} 区域左上顶点X轴索引
		 * @param  startIndexRow {int} 区域左上顶点Y轴索引
		 * @param  endIndexCol {[int]} 区域右下顶点X轴索引
		 * @param  endIndexRow {[int]} 区域右下顶点Y轴索引
		 * @return  {array} Cell数组
		 */
		getRegionCells: function(startIndexCol, startIndexRow, endIndexCol, endIndexRow) {
			if (endIndexCol === undefined) {
				endIndexCol = startIndexCol;
			}
			if (endIndexRow === undefined) {
				endIndexRow = startIndexRow;
			}
			var cellList = [],
				i = 0,
				j = 0,
				aliasCol,
				aliasRow,
				betweenRow = endIndexRow - startIndexRow + 1,
				betweenCol = endIndexCol - startIndexCol + 1,
				gridModelListRow = headItemRows.models,
				gridModelListCol = headItemCols.models,
				cellsPositionX = cache.CellsPosition.strandX;

			for (; i < betweenRow; i++) {
				for (j = 0; j < betweenCol; j++) {
					aliasRow = gridModelListRow[startIndexRow + i].get('alias');
					aliasCol = gridModelListCol[startIndexCol + j].get('alias');
					if (cellsPositionX[aliasCol] !== undefined && cellsPositionX[aliasCol][aliasRow] !== undefined) {
						cellList.push(this.models[cellsPositionX[aliasCol][aliasRow]]);
					} else {
						cellList.push(null);
					}
				}

			}
			return cellList;
		},
		/**
		 * 获取选中区域内包含所有cell对象
		 * @method getCellsByWholeSelectRegion 
		 * @return  {array} Cell数组
		 */
		getCellsByWholeSelectRegion: function() {
			var cellList = [],
				i,
				j,
				modelSelectRegion = selectRegions.models[0],
				betweenRow = modelSelectRegion.get('wholePosi').endY - modelSelectRegion.get('wholePosi').startY + 1,
				betweenCol = modelSelectRegion.get('wholePosi').endX - modelSelectRegion.get('wholePosi').startX + 1,
				headModelListRow = headItemRows.models,
				headModelListCol = headItemCols.models,
				cellsPositionX = cache.CellsPosition.strandX,
				aliasRow,
				aliasCol;
			for (i = 0; i < betweenRow; i++) {
				for (j = 0; j < betweenCol; j++) {
					aliasRow = headModelListRow[modelSelectRegion.get('wholePosi').startY + i].get('alias');
					aliasCol = headModelListCol[modelSelectRegion.get('wholePosi').startX + j].get('alias');
					if (cellsPositionX[aliasCol] !== undefined && cellsPositionX[aliasCol][aliasRow] !== undefined) {
						cellList.push(this.models[cellsPositionX[aliasCol][aliasRow]]);
					} else {
						cellList.push(null);
					}
				}
			}
			return cellList;
		},
		/**
		 * 根据选择域的边线位置查找cell对象集合
		 * @method  getCellsBySiderSelectRegion 
		 * @return {object} cell模型列表
		 */
		getCellsBySiderSelectRegion: function() {
			var verticalModelList,
				transverModelList,
				cellModelList = {};
			verticalModelList = this.getCellsByVerticalSiderSelectRegion();
			transverModelList = this.getCellsByTransverSiderSelectRegion();

			cellModelList.vertical = verticalModelList;
			cellModelList.transver = transverModelList;
			return cellModelList;
		},
		/**
		 * 根据列选中位置查找cell对象集合
		 * @method  getCellsByVerticalSiderSelectRegion
		 * @return {object} cell模型列表
		 */
		getCellsByVerticalSiderSelectRegion: function() {
			var modelList = {
					left: [],
					right: []
				},
				aliasCol,
				aliasRow,
				headLineColModelList,
				headLineRowModelList,
				colLen,
				rowLen,
				i, j,
				cellsPositionX;
			cellsPositionX = cache.CellsPosition.strandX;
			headLineColModelList = headItemCols.getModelListByWholeSelectRegion();
			headLineRowModelList = headItemRows.getModelListByWholeSelectRegion();
			colLen = headLineColModelList.length;
			rowLen = headLineRowModelList.length;
			for (i = 0; i < rowLen; i++) {
				for (j = 0; j < colLen; j++) {
					if (j === 0) {
						aliasRow = headLineRowModelList[i].get('alias');
						aliasCol = headLineColModelList[j].get('alias');
						if (cellsPositionX[aliasCol] !== undefined && cellsPositionX[aliasCol][aliasRow] !== undefined) {
							modelList.left.push(this.models[cellsPositionX[aliasCol][aliasRow]]);
						} else {
							modelList.left.push(null);
						}
					}
					if (j === colLen - 1) {
						aliasRow = headLineRowModelList[i].get('alias');
						aliasCol = headLineColModelList[j].get('alias');
						if (cellsPositionX[aliasCol] !== undefined && cellsPositionX[aliasCol][aliasRow] !== undefined) {
							modelList.right.push(this.models[cellsPositionX[aliasCol][aliasRow]]);
						} else {
							modelList.right.push(null);
						}
					}
				}
			}
			return modelList;
		},
		/**
		 * 根据行选中位置查找cell对象集合
		 * @method  getCellsByTransverSiderSelectRegion
		 * @return {object} cell模型列表
		 */
		getCellsByTransverSiderSelectRegion: function() {
			var modelList = {
					top: [],
					bottom: []
				},
				aliasCol,
				aliasRow,
				headLineColModelList,
				headLineRowModelList,
				colLen,
				rowLen,
				i, j,
				cellsPositionX;

			cellsPositionX = cache.CellsPosition.strandX;
			headLineColModelList = headItemCols.getModelListByWholeSelectRegion();
			headLineRowModelList = headItemRows.getModelListByWholeSelectRegion();
			colLen = headLineColModelList.length;
			rowLen = headLineRowModelList.length;
			for (i = 0; i < colLen; i++) {
				for (j = 0; j < rowLen; j++) {
					if (j === 0) {
						aliasRow = headLineRowModelList[j].get('alias');
						aliasCol = headLineColModelList[i].get('alias');
						if (cellsPositionX[aliasCol] !== undefined && cellsPositionX[aliasCol][aliasRow] !== undefined) {
							modelList.top.push(this.models[cellsPositionX[aliasCol][aliasRow]]);
						} else {
							modelList.top.push(null);
						}
					}
					if (j === rowLen - 1) {
						aliasRow = headLineRowModelList[j].get('alias');
						aliasCol = headLineColModelList[i].get('alias');
						if (cellsPositionX[aliasCol] !== undefined && cellsPositionX[aliasCol][aliasRow] !== undefined) {
							modelList.bottom.push(this.models[cellsPositionX[aliasCol][aliasRow]]);
						} else {
							modelList.bottom.push(null);
						}
					}
				}
			}
			return modelList;
		},
		/**
		 * 获取选中区域内，所有单元格坐标
		 * @method  getHeadModelByWholeSelectRegion
		 * @return {array} 单元格坐标数组
		 */
		getHeadModelByWholeSelectRegion: function() {
			var partModelList = [],
				partModel,
				headLineColModelList,
				headLineRowModelList,
				colLen,
				rowLen,
				i, j;

			headLineColModelList = headItemCols.getModelListByWholeSelectRegion();
			headLineRowModelList = headItemRows.getModelListByWholeSelectRegion();
			colLen = headLineColModelList.length;
			rowLen = headLineRowModelList.length;
			for (i = 0; i < rowLen; i++) {
				for (j = 0; j < colLen; j++) {
					partModel = {
						wholePosi: {
							startX: selectRegions.models[0].get('wholePosi').startX + j,
							startY: selectRegions.models[0].get('wholePosi').startY + i
						},
						occupy: {
							x: headLineColModelList[j].get('alias'),
							y: headLineRowModelList[i].get('alias')
						},
						physicsBox: {
							top: headLineRowModelList[i].get('top'),
							left: headLineColModelList[j].get('left'),
							width: headLineColModelList[j].get('width'),
							height: headLineRowModelList[i].get('height'),
						}
					};
					partModelList.push(partModel);
				}
			}
			return partModelList;
		},
		/** 获取选中区域内边框单元格
		 * @method getHeadModelBySiderSelectRegion
		 * @return {array} cell模型结合
		 */
		getHeadModelBySiderSelectRegion: function() {
			var verticalModelList,
				transverModelList,
				siderModelList = {};
			verticalModelList = this.getHeadModelByVerticalSiderSelectRegion();
			transverModelList = this.getHeadModelByTransverSiderSelectRegion();
			siderModelList.vertical = verticalModelList;
			siderModelList.transverse = transverModelList;
			return siderModelList;
		},
		/**
		 * 选中区域内，获取垂直方向，最左方与最右方单元格
		 * @method getHeadModelByVerticalSiderSelectRegion
		 * @return {array} cell模型结合
		 */
		getHeadModelByVerticalSiderSelectRegion: function() {
			var partModelList = {
					left: [],
					right: []
				},
				partModel,
				headLineColModelList,
				headLineRowModelList,
				colLen,
				rowLen,
				i, j;

			headLineColModelList = headItemCols.getModelListByWholeSelectRegion();
			headLineRowModelList = headItemRows.getModelListByWholeSelectRegion();
			colLen = headLineColModelList.length;
			rowLen = headLineRowModelList.length;
			for (i = 0; i < rowLen; i++) {
				for (j = 0; j < colLen; j++) {
					if (j === 0) {
						partModel = {
							wholePosi: {
								startX: selectRegions.models[0].get('wholePosi').startX + j,
								startY: selectRegions.models[0].get('wholePosi').startY + i
							},
							occupy: {
								x: headLineColModelList[j].get('alias'),
								y: headLineRowModelList[i].get('alias')
							},
							physicsBox: {
								top: headLineRowModelList[i].get('top'),
								left: headLineColModelList[j].get('left'),
								width: headLineColModelList[j].get('width'),
								height: headLineRowModelList[i].get('height'),
							}
						};
						partModelList.left.push(partModel);
					}
					if (j === colLen - 1) {
						partModel = {
							wholePosi: {
								startX: selectRegions.models[0].get('wholePosi').startX + j,
								startY: selectRegions.models[0].get('wholePosi').startY + i
							},
							occupy: {
								x: headLineColModelList[j].get('alias'),
								y: headLineRowModelList[i].get('alias')
							},
							physicsBox: {
								top: headLineRowModelList[i].get('top'),
								left: headLineColModelList[j].get('left'),
								width: headLineColModelList[j].get('width'),
								height: headLineRowModelList[i].get('height'),
							}
						};
						partModelList.right.push(partModel);
					}
				}
			}
			return partModelList;
		},
		/**
		 * 选中区域内，获取水平方向，最上方与最下方单元格
		 * @method getHeadModelByTransverSiderSelectRegion
		 * @return {array} cell模型结合
		 */
		getHeadModelByTransverSiderSelectRegion: function() {
			var partModelList = {
					top: [],
					bottom: []
				},
				partModel,
				headLineColModelList,
				headLineRowModelList,
				colLen,
				rowLen,
				i, j;

			headLineColModelList = headItemCols.getModelListByWholeSelectRegion();
			headLineRowModelList = headItemRows.getModelListByWholeSelectRegion();
			colLen = headLineColModelList.length;
			rowLen = headLineRowModelList.length;
			for (i = 0; i < colLen; i++) {
				for (j = 0; j < rowLen; j++) {
					if (j === 0) {
						partModel = {
							wholePosi: {
								startX: selectRegions.models[0].get('wholePosi').startX + i,
								startY: selectRegions.models[0].get('wholePosi').startY + j
							},
							occupy: {
								x: headLineColModelList[i].get('alias'),
								y: headLineRowModelList[j].get('alias')
							},
							physicsBox: {
								top: headLineRowModelList[j].get('top'),
								left: headLineColModelList[i].get('left'),
								width: headLineColModelList[i].get('width'),
								height: headLineRowModelList[j].get('height'),
							}
						};
						partModelList.top.push(partModel);
					}
					if (j === rowLen - 1) {
						partModel = {
							wholePosi: {
								startX: selectRegions.models[0].get('wholePosi').startX + i,
								startY: selectRegions.models[0].get('wholePosi').startY + j
							},
							occupy: {
								x: headLineColModelList[i].get('alias'),
								y: headLineRowModelList[j].get('alias')
							},
							physicsBox: {
								top: headLineRowModelList[j].get('top'),
								left: headLineColModelList[i].get('left'),
								width: headLineColModelList[i].get('width'),
								height: headLineRowModelList[j].get('height'),
							}
						};
						partModelList.bottom.push(partModel);
					}
				}
			}
			return partModelList;
		},
		/**
		 * 区域内，最左端单元格数组
		 * @method getLeftHeadModelByIndex
		 * @return {array} cell模型结合
		 */
		getLeftHeadModelByIndex: function(startColIndex, startRowIndex, endColIndex, endRowIndex) {
			var result = [],
				partModel,
				headLineColModelList,
				headLineRowModelList,
				cellsPositionCol,
				cellsPositionX,
				tempCell,
				colLen,
				rowLen,
				aliasCol,
				aliasRow,
				i, j;

			if (endColIndex === undefined) endColIndex = startColIndex;
			if (endRowIndex === undefined) endRowIndex = startRowIndex;
			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;

			colLen = endColIndex - startColIndex + 1;
			rowLen = endRowIndex - startRowIndex + 1;

			cellsPositionX = cache.CellsPosition.strandX;
			aliasCol = headLineColModelList[startColIndex].get('alias');
			for (i = 0; i < rowLen; i++) {
				aliasRow = headLineRowModelList[startRowIndex + i].get('alias');
				if (cellsPositionX[aliasCol] !== undefined &&
					cellsPositionX[aliasCol][aliasRow] !== undefined) {
					tempCell = this.models[cellsPositionX[aliasCol][aliasRow]];
				} else {
					tempCell = this.createCellModel(startColIndex, startRowIndex + i);
				}
				result.push(tempCell);
			}
			return result;
		},
		/**
		 * 区域内，最右端单元格数组
		 * @method getLeftHeadModelByIndex
		 * @return {array} cell模型结合
		 */
		getRightHeadModelByIndex: function(startColIndex, startRowIndex, endColIndex, endRowIndex) {
			var result = [],
				partModel,
				headLineColModelList,
				headLineRowModelList,
				cellsPositionCol,
				cellsPositionX,
				tempCell,
				colLen,
				rowLen,
				aliasCol,
				aliasRow,
				i, j;
			if (endColIndex === undefined) endColIndex = startColIndex;
			if (endRowIndex === undefined) endRowIndex = startRowIndex;
			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;

			colLen = endColIndex - startColIndex + 1;
			rowLen = endRowIndex - startRowIndex + 1;

			cellsPositionX = cache.CellsPosition.strandX;
			aliasCol = headLineColModelList[endColIndex].get('alias');
			for (i = 0; i < rowLen; i++) {
				aliasRow = headLineRowModelList[startRowIndex + i].get('alias');
				if (cellsPositionX[aliasCol] !== undefined &&
					cellsPositionX[aliasCol][aliasRow] !== undefined) {
					tempCell = this.models[cellsPositionX[aliasCol][aliasRow]];
				} else {
					tempCell = this.createCellModel(endColIndex, startRowIndex + i);
				}
				result.push(tempCell);
			}
			return result;
		},
		/**
		 * 区域内，最上端单元格数组
		 * @method getTopHeadModelByIndex
		 * @return {array} cell模型结合
		 */
		getTopHeadModelByIndex: function(startColIndex, startRowIndex, endColIndex, endRowIndex) {
			var result = [],
				partModel,
				headLineColModelList,
				headLineRowModelList,
				cellsPositionCol,
				cellsPositionX,
				tempCell,
				colLen,
				rowLen,
				aliasCol,
				aliasRow,
				i, j;
			if (endColIndex === undefined) endColIndex = startColIndex;
			if (endRowIndex === undefined) endRowIndex = startRowIndex;
			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;

			colLen = endColIndex - startColIndex + 1;
			rowLen = endRowIndex - startRowIndex + 1;

			cellsPositionX = cache.CellsPosition.strandX;
			aliasRow = headLineRowModelList[startRowIndex].get('alias');
			for (i = 0; i < colLen; i++) {
				aliasCol = headLineColModelList[startColIndex + i].get('alias');
				if (cellsPositionX[aliasCol] !== undefined &&
					cellsPositionX[aliasCol][aliasRow] !== undefined) {
					tempCell = this.models[cellsPositionX[aliasCol][aliasRow]];
				} else {
					tempCell = this.createCellModel(startColIndex + i, startRowIndex);
				}
				result.push(tempCell);
			}
			return result;
		},
		/**
		 * 区域内，最下端单元格数组
		 * @method getLeftHeadModelByIndex
		 * @return {array} cell模型结合
		 */
		getBottomHeadModelByIndex: function(startColIndex, startRowIndex, endColIndex, endRowIndex) {
			var result = [],
				partModel,
				headLineColModelList,
				headLineRowModelList,
				cellsPositionCol,
				cellsPositionX,
				tempCell,
				colLen,
				rowLen,
				aliasCol,
				aliasRow,
				i, j;
			if (endColIndex === undefined) endColIndex = startColIndex;
			if (endRowIndex === undefined) endRowIndex = startRowIndex;
			headLineRowModelList = headItemRows.models;
			headLineColModelList = headItemCols.models;

			colLen = endColIndex - startColIndex + 1;
			rowLen = endRowIndex - startRowIndex + 1;

			cellsPositionX = cache.CellsPosition.strandX;
			aliasRow = headLineColModelList[endRowIndex].get('alias');
			for (i = 0; i < colLen; i++) {
				aliasCol = headLineRowModelList[startColIndex + i].get('alias');
				if (cellsPositionX[aliasCol] !== undefined &&
					cellsPositionX[aliasCol][aliasRow] !== undefined) {
					tempCell = this.models[cellsPositionX[aliasCol][aliasRow]];
				} else {
					tempCell = this.createCellModel(startColIndex + i, endRowIndex);
				}
				result.push(tempCell);
			}
			return result;
		},
		// getAliasByWholeSelectRegion: function() {
		// 	var aliasList = [],
		// 		i,
		// 		j,
		// 		modelSelectRegion = selectRegions.models[0],
		// 		betweenRow = modelSelectRegion.get('wholePosi').endY - modelSelectRegion.get('wholePosi').startY + 1,
		// 		betweenCol = modelSelectRegion.get('wholePosi').endX - modelSelectRegion.get('wholePosi').startX + 1,
		// 		headModelListRow = headItemRows.models,
		// 		headModelListCol = headItemCols.models,
		// 		aliasRow,
		// 		aliasCol,
		// 		modelAlias;
		// 	for (i = 0; i < betweenRow; i++) {
		// 		for (j = 0; j < betweenCol; j++) {
		// 			modelAlias.aliasRow = headModelListRow[modelSelectRegion.get('wholePosi').startY + i].get('alias');
		// 			modelAlias.aliasCol = headModelListCol[modelSelectRegion.get('wholePosi').startX + j].get('alias');
		// 			aliasList.push(modelAlias);
		// 		}
		// 	}
		// 	return aliasList;
		// },

		/**
		 * 获取单元格相邻单元格
		 * @method  getAdjacent
		 * @param {object} currentModel cell对象
		 * @param {string} direction 相邻方向
		 * @return {array} cell模型列表
		 */
		getAdjacent: function(currentModel, direction) {
			var gridLineRowModelList,
				gridLineColModelList,
				modelIndexRow,
				modelIndexCol,
				modelCelllList,
				modelJSON = currentModel.toJSON();

			gridLineColModelList = headItemCols.models;
			gridLineRowModelList = headItemRows.models;

			//currentModel, direction models or null object

			modelIndexRow = app.basic.modelBinary(modelJSON.physicsBox.top, gridLineRowModelList, 'top', 'height', 0, gridLineRowModelList.length - 1);
			modelIndexCol = app.basic.modelBinary(modelJSON.physicsBox.left, gridLineColModelList, 'left', 'width', 0, gridLineColModelList.length - 1);
			switch (direction) {
				case 'LEFT':
					modelCelllList = cells.getSelectRegionCells(modelIndexCol - 1, modelIndexRow);
					break;
				case 'RIGHT':
					modelCelllList = cells.getSelectRegionCells(modelIndexCol + 1, modelIndexRow);
					break;
				case 'UP':
					modelCelllList = cells.getSelectRegionCells(modelIndexCol, modelIndexRow - 1);
					break;
				case 'DOWN':
					modelCelllList = cells.getSelectRegionCells(modelIndexCol, modelIndexRow + 1);
					break;
			}
			return modelCelllList[0];
		},
		/**
		 * 获取选中区域初始化单元格对象
		 * @method getInitCellBySelectRegion 
		 * @return  {Cell} 单元格对象
		 */
		getInitCellBySelectRegion: function() {
			var headLineColModelList,
				headLineRowModelList,
				modelSelectRegion,
				modelJSON,
				aliasRow,
				aliasCol,
				initCellIndex,
				cellsPositionX,
				collections = app.collections;

			modelSelectRegion = collections.selectRegion.models[0];
			modelJSON = modelSelectRegion.toJSON();

			headLineColModelList = collections.headLineCol.models;
			headLineRowModelList = collections.headLineRow.models;

			aliasRow = headLineRowModelList[modelJSON.initPosi.startY].get('alias');
			aliasCol = headLineColModelList[modelJSON.initPosi.startX].get('alias');

			cellsPositionX = cache.CellsPosition.strandX;
			if (cellsPositionX[aliasCol] === undefined || cellsPositionX[aliasCol][aliasRow] === undefined) {
				initCellIndex = -1;
			} else {
				initCellIndex = cellsPositionX[aliasCol][aliasRow];
			}
			if (initCellIndex !== -1) {
				return collections.cell.models[initCellIndex];
			}
			return null;
		},
		/**
		 * 按照行索引，获取两行之间的所有包含所有cell对象
		 * @method getCellsByRowIndex 
		 * @param  startPosi {int} 行开始索引
		 * @param  endPosi {int} 行结束索引
		 * @return {array} Cell数组
		 */
		getCellsByRowIndex: function(startIndex, endIndex) {
			var tempObj,
				tempAttr,
				cacheCellArray,
				cachePosition,
				cellModelList,
				alias,
				i, j;

			cacheCellArray = [];
			cellModelList = this.models;
			cachePosition = cache.CellsPosition.strandY;
			//遍历cache.CellsPosition中符合索引，生成cells[]集合
			for (i = startIndex; i < endIndex + 1; i++) {
				if (headItemRows.models[i] !== undefined) {
					alias = headItemRows.models[i].get('alias');
					if (cachePosition[alias] !== undefined) {
						tempObj = cachePosition[alias];
						for (tempAttr in tempObj) {
							if (cacheCellArray.indexOf(cellModelList[tempObj[tempAttr]]) === -1) {
								cacheCellArray.push(cellModelList[tempObj[tempAttr]]);
							}
						}
					}
				}
			}
			return cacheCellArray;
		},
		/**
		 * 通过列索引查询，区域内包含单元格
		 * @method  getCellsByColIndex
		 * @return {array} cell模型列表
		 */
		getCellsByColIndex: function(startIndex, endIndex) {
			var tempObj,
				tempAttr,
				cacheCellArray,
				cachePosition,
				cellModelList,
				alias,
				i, j;

			cacheCellArray = [];
			cellModelList = this.models;
			cachePosition = cache.CellsPosition.strandX;
			//遍历cache.CellsPosition中符合索引，生成cells[]集合
			for (i = startIndex; i < endIndex + 1; i++) {
				if (headItemCols.models[i] !== undefined) {
					alias = headItemCols.models[i].get('alias');
					if (cachePosition[alias] !== undefined) {
						tempObj = cachePosition[alias];
						for (tempAttr in tempObj) {
							if (cacheCellArray.indexOf(cellModelList[tempObj[tempAttr]]) === -1) {
								cacheCellArray.push(cellModelList[tempObj[tempAttr]]);
							}
						}
					}
				}
			}
			return cacheCellArray;
		},
		/**
		 * 按照行列索引，获取两列之间的所有包含所有cell对象
		 * @method getCellsByColIndex 
		 * @param  startPosi {int} 列开始索引
		 * @param  endPosi {int} 列结束索引
		 * @return {array} Cell数组
		 */
		getCellsByColPosition: function(startPosi, endPosi) {
			var tempColObj,
				tempAttr,
				cacheCellArray,
				cachePosition,
				cellModelList,
				aliasCol,
				i = 0,
				j;

			cacheCellArray = [];
			cellModelList = this.models;
			cachePosition = cache.CellsPosition.strandX;

			//遍历cache.CellsPosition中符合索引，生成cells[]集合
			for (; i < endPosi - startPosi + 1; i++) {
				if (headItemCols.models[startPosi + i] !== undefined) {
					aliasCol = headItemCols.models[startPosi + i].get('alias');
					if (cachePosition[aliasCol] !== undefined) {
						tempColObj = cachePosition[aliasCol];
						for (tempAttr in tempColObj) {
							if (cacheCellArray.indexOf(cellModelList[tempColObj[tempAttr]]) === -1) {
								cacheCellArray.push(cellModelList[tempColObj[tempAttr]]);
							}
						}
					}
				}
			}
			return cacheCellArray;
		},
		/**
		 * 根据alias获取单元格对象
		 * @method getCellByAlias 
		 * @param  aliasCol {string} 行别名
		 * @param  aliasRow {string} 行列别名
		 * @return {Cell} 单元格对象
		 */
		getCellByAlias: function(aliasCol, aliasRow) {
			var tempCellIndex;
			if (cache.CellsPosition.strandY[aliasRow] === undefined || cache.CellsPosition.strandY[aliasRow][aliasCol] === undefined) {
				return null;
			}
			tempCellIndex = cache.CellsPosition.strandY[aliasRow][aliasCol];
			return this.models[tempCellIndex];
		},
		/**
		 * 按照行列索引，获取两列之间开始区域不超过开始行的cell对象
		 * @method getCellsInStartRowRegion 
		 * @param  startRowIndex {int} 行开始索引
		 * @param  endRowIndex {int} 行结束索引
		 * @return {array} Cell数组
		 */
		getCellsInStartRowRegion: function(startRowIndex, endRowIndex) {
			var tempRowObj,
				tempAttr,
				cacheCellArray,
				cachePosition,
				cellModelList,
				aliasRow,
				tempCell,
				cellStartRowIndex,
				i = 0,
				j;

			cacheCellArray = [];
			cellModelList = this.models;
			cachePosition = cache.CellsPosition.strandY;

			//遍历cache.CellsPosition中符合索引，生成cells[]集合
			for (i = startRowIndex; i < endRowIndex + 1; i++) {

				if (headItemRows.models[i] !== undefined) {
					aliasRow = headItemRows.models[i].get('alias');
					if (cachePosition[aliasRow] !== undefined) {
						tempRowObj = cachePosition[aliasRow];
						for (tempAttr in tempRowObj) {
							//判断cell是否超出区域
							tempCell = cellModelList[tempRowObj[tempAttr]];
							cellStartRowIndex = headItemRows.getIndexByAlias(tempCell.get('occupy').y[0]);
							if (cellStartRowIndex >= startRowIndex && cacheCellArray.indexOf(tempCell) == -1) {
								cacheCellArray.push(tempCell);
							}

						}
					}
				}
			}
			return cacheCellArray;
		},
		/**
		 * 按照行列索引，获取两列之间开始区域不超过开始列的cell对象
		 * @method getCellsInStartColRegion 
		 * @param  startColIndex {int} 列开始索引
		 * @param  endColIndex {int} 列结束索引
		 * @return {array} Cell数组
		 */
		getCellsInStartColRegion: function(startColIndex, endColIndex) {
			var tempColObj,
				tempAttr,
				cacheCellArray,
				cachePosition,
				cellModelList,
				aliasCol,
				tempCell,
				cellStartColIndex,
				i = 0,
				j;

			cacheCellArray = [];
			cellModelList = this.models;
			cachePosition = cache.CellsPosition.strandX;

			//遍历cache.CellsPosition中符合索引，生成cells[]集合
			for (; i < endColIndex - startColIndex + 1; i++) {

				if (headItemCols.models[startColIndex + i] !== undefined) {

					aliasCol = headItemCols.models[startColIndex + i].get('alias');
					if (cachePosition[aliasCol] !== undefined) {
						tempColObj = cachePosition[aliasCol];
						for (tempAttr in tempColObj) {
							//判断cell是否超出区域
							tempCell = cellModelList[tempColObj[tempAttr]];
							cellStartColIndex = headItemCols.getIndexByAlias(tempCell.get('occupy').x[0]);
							if (cellStartColIndex >= startColIndex && cacheCellArray.indexOf(tempCell) == -1) {
								cacheCellArray.push(tempCell);
							}

						}
					}
				}
			}
			return cacheCellArray;
		},
		/**
		 * 获取区域内的cell集合对象,用于页面初始化
		 * @method getCellsByRegion
		 * @param  {int} startRowIndex 行开始索引
		 * @param  {int} endRowIndex   列开始索引
		 * @param  {int} startColIndex 行结束索引
		 * @param  {int} endColIndex   列结束索引
		 * @return {object} cell集合
		 */
		getCellsByRegion: function(startRowIndex, endRowIndex, startColIndex, endColIndex) {
			var gridLineRowList,
				gridLineColList,
				cellModelList,
				cacheCellModelList = [],
				rowAliasArray,
				colAliasArray,
				cellRowStartIndex,
				cellRowEndIndex,
				cellColStartIndex,
				cellColEndIndex,
				flag,
				i, j, k;

			gridLineRowList = app.collections.gridLineRow;
			gridLineColList = app.collections.gridLineRow;
			cellModelList = cellss;

			if (startRowIndex === undefined && startColIndex === undefined && endRowIndex === undefined && endColIndex === undefined) {
				return cellModelList;
			}

			if (startRowIndex === undefined) startRowIndex = 0;
			if (startColIndex === undefined) startColIndex = 0;
			if (endRowIndex === undefined) endRowIndex = gridLineRowList.length - 1;
			if (endColIndex === undefined) endColIndex = gridLineColList.length - 1;

			for (i = 0; i < cellModelList.length; i++) {
				rowAliasArray = cellModelList[i].get('occupy').y;
				colAliasArray = cellModelList[i].get('occupy').x;
				for (j = 0; j < rowAliasArray.length; j++) {
					cellRowStartIndex = gridLineRowList.getIndexByAlias(rowAliasArray[j]);
					if (cellRowStartIndex !== -1) {
						break;
					}
				}
				for (j = rowAliasArray.length - 1; j > -1; j--) {
					cellRowEndIndex = gridLineRowList.getIndexByAlias(rowAliasArray[j]);
					if (cellRowEndIndex !== -1) {
						break;
					}
				}
				for (k = 0; k < colAliasArray.length; k++) {
					cellColStartIndex = gridLineColList.getIndexByAlias(colAliasArray[k]);
					if (cellColStartIndex !== -1) {
						break;
					}
				}
				for (k = colAliasArray.length - 1; k > -1; k--) {
					cellColEndIndex = gridLineColList.getIndexByAlias(colAliasArray[j]);
					if (cellColEndIndex !== -1) {
						break;
					}
				}
				if (!(cellRowStartIndex > endRowIndex || cellRowEndIndex < startRowIndex) && !(cellColStartIndex > endColIndex || cellColEndIndex < startColIndex)) {
					cacheCellModelList = cellModelList[i];
				}
			}
			return cacheCellModelList;
		}
	});
	return new Cells();
});