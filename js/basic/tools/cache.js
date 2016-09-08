//attention bug , those cache objects has mix , for use 
'use strict';
define(function(require) {
	var config = require('spreadsheet/config');
	/**
	 * 系统缓存对象
	 * @author ray wu
	 * @class cache
	 * @since 0.1.0
	 * @module basic
	 */
	return {
		//ps:如果加载超过100行，问题
		aliasRowCounter: '100',
		aliasColCounter: '26',
		sendQueueStep: 0, //0
		containerId: '',
		//ps:CurrentRule ，FrozenRules ，TempProp 都存有冻结信息，具体功能，需要说明
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
		commentState: false, //true 备注编辑状态,不能进行选中区域的移动
		/**
		 * 用户可视的区域,初始化时,需要修改默认值
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
			rowEndAlias: '1',
		},
		//可视区域（适用于滚动区域）
		visibleRegion: {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0
		},
		/**
		 * 动态加载，视图存在区域
		 * @type {Object}
		 */
		existView: {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
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
		loadStartColAlias: '1',
		loadEndColAlias: '26',
		//变量值重复，需要删除
		//动态加载，模型对象已加载区域，以坐标为记录单位
		rowRegionPosi: [],
		//动态加载，模型对象已加载区域，以坐标为记录单位
		colRegionPosi: [],
		//动态加载，模型对象已加载区域，以坐标为记录单位
		cellRegionPosi: {
			transverse: [],
			vertical: []
		},
		//
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
		/**
		 * 删除缓存位置信息
		 * @method deletePosi
		 * @param  {string}      aliasRow 行的别名
		 * @param  {string}      aliasCol 列的别名
		 */
		deletePosi: function(aliasRow, aliasCol) {
			var currentCellPosition = this.CellsPosition,
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
		aliasGenerator: function(type) {
			var alias,
				num;
			if (type === 'col') {
				alias = this.aliasColCounter;
			} else {
				alias = this.aliasRowCounter;
			}

			num = parseInt(alias);
			alias = (num + 1).toString();
			if (type === 'col') {
				this.aliasColCounter = alias;
			} else {
				this.aliasRowCounter = alias;
			}
			return alias;
		}
	};
});