//attention bug, those name didn't significance
//attention bug, between user config and system config mix
define(function() {
	'use strict';
	/**
	 * 系统配置变量
	 * @author ray wu
	 * @class config
	 * @since 0.1.0
	 * @module basic
	 */
	return {
		/**
		 * 用户可配置属性
		 * @property {object} User
		 */
		User: {
			/**
			 * 页面初始化行数
			 * @property {int} initRowNum
			 */
			initRowNum: 100,
			/**
			 * 页面初始化列数
			 * @property {int} initColNum
			 */
			initColNum: 26,
			/**
			 * 单元格宽度
			 * @property {int} cellWidth
			 */
			cellWidth: 72,
			/**
			 * 单元格高度
			 * @property {int} cellHeight
			 */
			cellHeight: 20,
			/**
			 * excel最大支持行数
			 * @property {number} maxRowNum
			 */
			maxColNum: 100,
			/**
			 * excel最大支持行数
			 * @property {number} maxRowNum
			 */
			maxRowNum: 9999

		},
		/**
		 * 系统配置属性
		 * @property {object} System
		 */
		System: {
			/**
			 * 页面左侧距离
			 * @property {int} outerLeft
			 */
			outerLeft: 37,
			/**
			 * 页面顶部距离
			 * @property {int} outerTop
			 */
			outerTop: 20,
			/**
			 * 页面底部距离
			 * @property {int} outerBottom
			 */
			outerBottom: 30,
			/**
			 * 单元格宽度
			 * @property {int} cellWidth
			 */
			cellWidth: 72,
			/**
			 * 单元格高度
			 * @property {int} cellHeight
			 */
			cellHeight: 20,
			/**
			 * 列调整时，鼠标手势变化的距离
			 * @property {int} effectDistanceCol
			 */
			effectDistanceCol: 10,
			/**
			 * 行调整时，鼠标手势变化的距离
			 * @property {int} effectDistanceRow
			 */
			effectDistanceRow: 5,
			/**
			 * 预加载，行隐藏的距离
			 * @property {int} prestrainHeight
			 */
			prestrainHeight: 200,
			/**
			 * 预加载，列隐藏的距离
			 * @property {number} prestrainWidth
			 */
			prestrainWidth: 100,
			/**
			 * excel最大支持行数
			 * @property {number} maxRowNum
			 */
			maxRowNum: 9999
		},
		keyboard: {
			backspace: 8,
			deleteKey: 46,
			enter: 13,
			escape: 27,
			pageUp: 33,
			pageDown: 34,
			leftArrow: 37,
			upArrow: 38,
			rightArrow: 39,
			downArrow: 40
		},
		rootPath: 'http://192.168.1.250:8080/acmrexcel-0.1.5/'
	};
});