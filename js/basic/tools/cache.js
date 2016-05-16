//attention bug , those cache objects has mix , for use 
define(function() {
	'use strict';
	var config = require('spreadsheet/config');
	/**
	 * 系统缓存对象
	 * @author ray wu
	 * @class cache
	 * @since 0.1.0
	 * @module basic
	 */
	return {
		CurrentRule: {},
		FrozenRules: {
			main: [],
			row: [],
			col: []
		},
		/**
		 * 所有单元格位置信息
		 * @property {object} CellPosition
		 */
		CellsPosition: {
			/**
			 * 所有列上的单元格`alias`
			 * @property {object} strandX
			 */
			strandX: {},
			/**
			 * 所有行上的单元格`alias`
			 * @property {object} strandY
			 */
			strandY: {}
		},
		clipState: 'null', //copy：复制状态，cut:剪切状态，null:未进行剪切板操作
		commentState : false, //true 备注编辑状态,不能进行选中区域的移动
		/**
		 * 用户可视的区域(在Excel未冻结的情况下使用)
		 * @property {object} UserView
		 */
		UserView: {
			/**
			 * 可视区域左上单元格列别名
			 * @property {string} colAlias
			 */
			colAlias: '1',
			/**
			 * 可视区域左上单元格行别名
			 * @property {string} rowAlias
			 */
			rowAlias: '1',
			/**
			 * 可视区域右下单元格列别名
			 * @property {string} colEndAlias
			 */
			colEndAlias: '1',
			/**
			 * 可视区域右下单元格行别名
			 * @property {string} rowEndAlias
			 */
			rowEndAlias: '1'
		},
		highlightDirection: 'null',
		//鼠标操作状态
		mouseOperateState: config.mouseOperateState.select,

		listenerList: {}, //事件监听列表
		/**
		 * cellsContainer 行视图最大高度
		 * @type {Number}
		 */
		displayRowHeight: 0,
		/**
		 * 后台存储excel的总高度
		 * @property {int} localRowPosi
		 */
		localRowPosi: 0,
		/**
		 * 后台存储excel,别名最大
		 */
		localMaxRowAlias: '',
		/**
		 * 临时代替属性，因为sheet还有做，所以sheet的冻结属性暂时由此属性替代。以后需要做成model处理
		 * @property {object} TempProp
		 */
		TempProp: {
			/**
			 * 冻结状态
			 * @property {boolean} isFrozen
			 */
			isFrozen: false,
			/**
			 * 冻结列别名
			 * @property {string} colAlias
			 */
			colAlias: '1',
			/**
			 * 冻结行别名
			 * @property {string} rowAlias
			 */
			rowAlias: '1',
			/**
			 * 行冻结状态
			 * @property {boolean} rowAlias
			 */
			rowFrozen: false,
			/**
			 * 列冻结状态
			 * @property {boolean} rowAlias
			 */
			colFrozen: false
		},
		/**
		 * 保存位置信息
		 * @method cachePosition
		 * @param  {string}      aliasRow 行的别名
		 * @param  {string}      aliasCol 列的别名
		 * @param  {int}      index 插入集合位置
		 */
		cachePosition: function(aliasRow, aliasCol, index) {
			var positionX,
				positionY;
			// cells=require('collections/cells');
			positionX = this.CellsPosition.strandX;
			if (!positionX[aliasCol]) {
				positionX[aliasCol] = {};
			}
			if (!positionX[aliasCol][aliasRow]) {
				positionX[aliasCol][aliasRow] = {};
			}
			positionY = this.CellsPosition.strandY;
			if (!positionY[aliasRow]) {
				positionY[aliasRow] = {};
			}
			if (!positionY[aliasRow][aliasCol]) {
				positionY[aliasRow][aliasCol] = {};
			}
			positionX[aliasCol][aliasRow] = index;
			positionY[aliasRow][aliasCol] = index;
		},
		//动态加载，已加载区域
		rowRegionPosi: [],
		//动态加载，已加载列区域
		colRegionPosi: [],
		//动态加载，已加单元格载区域
		cellRegionPosi: {
			transverse: [],
			vertical: []
		},
		visibleRegion: {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0
		}
	};

});