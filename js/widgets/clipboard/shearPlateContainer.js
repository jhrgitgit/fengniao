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
		cache = require('basic/tools/cache');

	/**
	 * 剪切板视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class ShearPlateContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var ShearPlateContainer = Backbone.View.extend({
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
		// events:{
		// 	'mousedown div':'pasteAction'
		// },
		// pasteAction:function(e){
		// 	var action;
		// 	action=$(e.currentTarget).data('toolbar');
		// 	switch (action){
		// 		case 'paste':this.pasteData();
		// 			break;
		// 		case 'copy':this.copyData();
		// 			break;
		// 		case 'cut' :this.cutData();
		// 			break;
		// 		default: 
		// 			break;
		// 	}
		// },
		/**
		 * 复制数据
		 * @method pasteData
		 * @param  {string} pasteText 数据 
		 */
		pasteData: function(pasteText) {
			//剪切板数据源数据复制
			this.shearPlateDataPaste(pasteText);
			//在线excel数据源复制

		},
		/**
		 * 剪切数据
		 * @method pasteData
		 * @param  {string} pasteText 数据 
		 */
		cutData: function() {
			this.cacheCells();
		},
		/**
		 * 复制数据
		 * @method pasteData
		 * @param  {string} pasteText 数据 
		 */
		copyData: function() {
			this.cacheCells();
		},
		/**
		 * 现在粘贴数据
		 * @method pasteData
		 * @param  {string} pasteText 数据 
		 */
		onlinePaste: function() {

		},
		/**
		 * 缓存在线复制数据
		 * @method cacheCells
		 */
		cacheCells: function() {
			var cacheCell,
				relativeRowIndex,
				relativeColIndex,
				selectRegionRowIndex,
				selectRegionColIndex;
			selectRegionColIndex = selectRegions.models[0].get('wholePosi').startX;
			selectRegionRowIndex = selectRegions.models[0].get('wholePosi').startY;

			cahcheCells.reset(null);
			Backbone.trigger('event:selectRegion:patchOprCell', function(cell) {
				cacheCell = cell.clone();
				cacheCell.set();
				cahcheCells.add(cacheCell);
			});
		},
		/**
		 * 写入剪切板数据
		 * @method inputshearPlate
		 */
		inputshearPlate: function() {

		},
		/**
		 * 剪切板数据源数据解析
		 * @method shearPlateDataPaste
		 * @param  {String} pasteText 复制数据内容
		 */
		shearPlateDataPaste: function(pasteText) {
			var tempString,
				tempStringArr = [],
				tempRowTextArr = [],
				i,
				j,
				relativeRowIndex = 0,
				relativeColIndex = 0;

			//以回车符+换行符，进行分割
			tempRowTextArr = pasteText.split("\r\n");
			for (i = 0; i < tempRowTextArr.length - 1; i++) {
				//以制表符进行列分割
				tempStringArr = tempRowTextArr[i].split("\t");
				for (j = 0; j < tempStringArr.length; j++) {
					tempString = analysis(tempStringArr[j]);
					this.textToCell(relativeRowIndex, relativeColIndex, tempString);
					relativeColIndex++;
				}
				relativeColIndex = 0;
				relativeRowIndex++;
			}

			function analysis(text) {
				if (text.indexOf("\n") === -1) {
					return text;
				}

				text = text.substring(1, text.length - 1);
				var textArr = [],
					tempText = '',
					i;
				textArr = text.split('""');
				for (i = 0; i < textArr.length; i++) {
					if (i === 0) {
						tempText += textArr[i];
					} else {
						tempText += '"' + textArr[i];
					}
				}
				return tempText;
			}
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
				gridLineRowList;

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
			cacheCell.set('occupy', {
				x: aliasCol,
				y: aliasRow
			});
			cacheCell.set('physicsBox', {
				top: top,
				left: left,
				width: width,
				height: height
			});
			cacheCell.set("content.texts", text);
			//判断是否已经存在单元格
			aliasCol = gridLineColList[indexCol].get('alias');
			aliasRow = gridLineRowList[indexRow].get('alias');
			cache.cachePosition(aliasRow, aliasCol, cells.length);
			cells.add(cacheCell);
		}
	});
	return ShearPlateContainer;
});