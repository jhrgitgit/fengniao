//attention bug, this `models` need to `Models` , this is error , secound phease correction
//attention bug, remarket lack isn't exist `remarket` property .
//attention bug, showState is or not exist value ?


define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone');
	var BackboneNest = require('lib/backbone.nested');


	/**
	 * 单元格模型对象
	 * @author ray wu
	 * @since 0.1.0
	 * @class CellModel  
	 * @module models
	 * @extends Backbone.Collection
	 * @constructor
	 */
	var CellModel = BackboneNest.NestedModel.extend({
		defaults: {
			/**
			 * 单元格物理盒模型
			 * @property {object} physicBox 
			 */
			physicsBox: {
				/**
				 * 单元格的距顶距离
				 * @property {number} top 
				 */
				top: 0,
				/**
				 * 单元格的距左距离
				 * @property {number} left 
				 */
				left: 0,
				/**
				 * 单元格的宽度
				 * @property {number} width
				 */
				width: 71,
				/**
				 * 单元格的高度
				 * @property {number} height
				 */
				height: 19
			},
			/**
			 * 单元格占位
			 * @property {object} occupy
			 */
			occupy: {
				/**
				 * 单元格占`col`的`alias`
				 * @property {array} x
				 */
				x: [],
				/**
				 * 单元格占`row`的`alias`
				 * @property {array} y
				 */
				y: []
			},
			/**
			 * 字体属性对象
			 * @property {object} content
			 */
			content: {
				/**
				 * 字号
				 * @property {string} size
				 */
				size: "11pt",
				/**
				 * 字体风格
				 * @property {string} family
				 */
				family: "SimSun",
				/**
				 * 字体加粗
				 * @property {boolean} bd
				 */
				bd: false,
				/**
				 * 字体倾斜
				 * @property {boolean} italic
				 */
				italic: false,
				/**
				 * 字体颜色RGB
				 * @property {string} color
				 */
				color: "#000",
				/**
				 * 左右对齐
				 * @property {string} alignRow
				 */
				alignRow: '',
				/**
				 * 上下对齐
				 * @property {string} alignLine
				 */
				alignCol: "middle",
				/**
				 * 文本内容
				 * @property {string} texts
				 */
				texts: '',
				
				
			},
			wordWrap : false,
			/**
			 * 边线属性
			 * @property {object} border
			 */
			border: {
				/**
				 * 上边线
				 * @property {boolean} top
				 */
				top: false,
				/**
				 * 右边线
				 * @property {boolean} right
				 */
				right: false,
				/**
				 * 低边线
				 * @property {boolean} bottom
				 */
				bottom: false,
				/**
				 * 左边线
				 * @property {boolean} left
				 */
				left: false
			},
			/**
			 * 用户可定义的属性
			 * @property {object} customProp
			 */
			customProp: {
				/**
				 * 单元格背景颜色RGB
				 * @property {string} background
				 */
				background: "#fff",
				/**
				 * 单元格格式
				 * @property {string} format
				 */
				format: "text",
				/**
				 * 单元格备注内容
				 * @property {string} remarket
				 */
				remarket: ""
			},
			/**
			 * 单元格是否显示
			 * @property {boolean} showState
			 */
			showState: true,
			/**
			 * 是否已经被销毁
			 * @property {Boolean} isDestroy
			 */
			isDestroy: false,
			/**
			 * 是否允许单元格进行高亮效果（ps:此属性为外部扩展属性，后期应对此属性进行分离）
			 * @type {Boolean}
			 */
			highlight: false
		},
		/**
		 * 隐藏当前单元格
		 * @method hide
		 */
		hide: function() {
			this.set('showState', false);
		}
	});
	return CellModel;
});