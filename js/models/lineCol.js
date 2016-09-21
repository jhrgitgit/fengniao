'use strict';
define(function(require) {
	var BackboneNest = require('lib/backbone.nested'),
		LineColModel;


	/**
	 * 列模型对象
	 * @author ray wu
	 * @since 0.1.0
	 * @class LineCol  
	 * @module models
	 * @extends Backbone.Collection
	 * @constructor
	 */
	LineColModel = BackboneNest.NestedModel.extend({
		defaults: {
			/**
			 * 排序码
			 * @property {Number}
			 */
			sort: 0,
			/**
			 * 别名，唯一标识
			 * @property {string} alias
			 */
			alias: '',
			/**
			 * 相对位置`left`值
			 * @property {number} left
			 */
			left: 0,
			/**
			 * 宽度
			 * @property {number} width
			 */
			width: 71,
			/**
			 * 原始宽度：取消隐藏后显示宽度
			 * @property {number} originWidth
			 */
			originalWidth: 71,
			/**
			 * 右侧存在已隐藏的列：head是否为双竖线显示,且宽度-1
			 * @property {boolean} isRightAjacentHide
			 */
			isRightAjacentHide: false,
			/**
			 * 左侧存在已隐藏的列：宽度-1
			 * @property {boolean} isleftAjacentHide
			 */
			isleftAjacentHide: false,
			/**
			 * 显示的名字
			 * @property {string} displayName
			 */
			displayName: '',
			/**
			 * 是否被选中
			 * @property {boolean} activeState
			 */
			activeState: false,
			/**
			 * 是否隐藏，用于隐藏列功能，判断该列是否隐藏
			 * @type {Boolean}
			 */
			hidden: false,
			/**
			 * 是否显示,用于动态加载功能，判断是否存在dom对象
			 * @property {boolean} isView
			 */
			isView: true,
			/**
			 * 整列操作设置属性
			 */
			operProp: {}
		},
		/**
		 * 销毁`model`对象的视图
		 *
		 * @method destoryView
		 */
		destroyView: function() {
			this.set('isView', false);
		}
	});
	return LineColModel;
});