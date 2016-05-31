define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		binary = require('basic/util/binary'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		mergeCell = require('entrance/tool/mergecell'),
		splitCell = require('entrance/tool/splitcell');

	/**
	 * 合并，拆分单元格视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class MergeCellContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var MergeCellContainer = Backbone.View.extend({
		/**
		 * 绑定视图
		 * @property el
		 * @type {String}
		 */
		el: '#mergeCellContainer',
		/**
		 * 绑定鼠标事件
		 * @property events
		 * @type {Object}
		 */
		events: {
			'click div[data-toolbar]': 'transAction'
				// 'click #merge': 'mergeCell',
				// 'click #split': 'splitCell'
		},
		/**
		 * 初始化函数
		 * @method initialize
		 */
		initialize: function() {
			_.bindAll(this, 'splitCell');
		},
		/**
		 * 监听合并操作
		 * @method transAction
		 */
		transAction: function(e) {
			var borderPositon = $(e.currentTarget).data('toolbar');
			switch (borderPositon) {
				case 'merge':
					this.mergeCell(e);
					break;
				case 'split':
					this.splitCell(e);
					break;
			}
		},
		/**
		 * 合并单元格
		 * @method mergeCell
		 */
		mergeCell: function() {
			mergeCell('1');
		},
		/**
		 * 拆分单元格
		 * @method splitCell
		 */
		splitCell: function() {
			splitCell('1');
		},
		/**
		 * 拆分单元格时，每个合并区域，重新创建单元格
		 * @method splitCreateCell
		 * @param {Cell} cacheCell 合并区域单元格
		 */
		splitCreateCell: function(cacheCell) {

		},
		/**
		 * 维护cache.CellsPosition，删除原有单元格记录
		 * @method deletePosi
		 * @param  {num} indexCol 列索引
		 * @param  {num} indexRow 行索引
		 */
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
		 * 维护cache.CellsPosition，存储单元格记录
		 * @method setPosi
		 * @param  {num} indexCol 列索引
		 * @param  {num} indexRow 行索引
		 * @param {num} index 记录索引
		 */
		setPosi: function(indexX, indexY, index) {
			var temp = {};
			if (cache.CellsPosition.strandX[indexX] === undefined) {
				temp = {};
				temp[indexY] = index;
				cache.CellsPosition.strandX[indexX] = temp;
			} else {
				//更新对象
				cache.CellsPosition.strandX[indexX][indexY] = index;
			}
			if (cache.CellsPosition.strandY[indexY] === undefined) {
				temp = {};
				temp[indexX] = index;
				cache.CellsPosition.strandY[indexY] = temp;
			} else {
				//更新对象
				cache.CellsPosition.strandY[indexY][indexX] = index;
			}
		}
	});
	return MergeCellContainer;
});