'use strict';
define(function(require) {

	var BackboneNest = require('lib/backbone.nested'),
		LineRowModel;

	/**
	 * 行模型对象
	 * @author ray wu
	 * @since 0.1.0
	 * @class LineRow  
	 * @module models
	 * @extends Backbone.Collection
	 * @constructor
	 */
	LineRowModel = BackboneNest.NestedModel.extend({
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
			 * 相对位置`top`值
			 * @property {number} top
			 */
			top: 0,
			/**
			 * 高度
			 * @property {number} height
			 */
			height: 19,
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
			 * 是否显示
			 * @property {boolean} isView
			 */
			isView: true,
			/**
			 * 整行操作设置属性
			 */
			operProp:{

			}
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
	return LineRowModel;
});