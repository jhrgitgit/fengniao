//attention bug, those name didn't significance

define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		BackboneNest = require('lib/backbone.nested'),
		SelectRegion;

	/**
	 * 选中区域模型对象
	 * @author ray wu
	 * @since 0.1.0
	 * @class SelectRegion  
	 * @module models
	 * @extends Backbone.NestedModel
	 * @constructor
	 */
	SelectRegion = Backbone.NestedModel.extend({
		defaults: {
			/**
			 * 鼠标相对位置信息，索引值，初始化信息
			 * @property {object} initPosi
			 */
			initPosi: {
				/**
				 * 鼠标的`X`的位置索引
				 * @property {number} startX
				 */
				startX: 0,
				/**
				 * 鼠标的`Y`的位置索引
				 * @property {number} startY
				 */
				startY: 0,
			},
			/**
			 * 鼠标相对位置信息，索引值，最终结束信息
			 * @property {object} mousePosi
			 */
			mousePosi: {
				/**
				 * 鼠标的`X`的位置索引
				 * @property {number} mouseX
				 */
				mouseX: 0,
				/**
				 * 鼠标的`Y`的位置索引
				 * @property {number} mouseY
				 */
				mouseY: 0
			},
			/**
			 * 相对位置属性
			 * @property {object} physicsPosi
			 */
			physicsPosi: {
				/**
				 * 相对位置`top`值
				 * @property {number} top
				 */
				top: 0,
				/**
				 * 相对位置`bottom`值
				 * @property {number} bottom
				 */
				bottom: 0,
				/**
				 * 相对位置`left`值
				 * @property {number} left
				 */
				left: 0,
				/**
				 * 相对位置`right`值
				 * @property {number} right
				 */
				right: 0
			},
			/**
			 * 宽高属性
			 * @property {object} physicBox
			 */
			physicsBox: {
				/**
				 * 宽度
				 * @property {number} width
				 */
				width: 71,
				/**
				 * 高度
				 * @property {number} height
				 */
				height: 19
			},
			//current box start,end postion index value (complete)
			/**
			 * [wholePosi description]
			 * @property {object} wholePosi
			 */
			wholePosi: {
				/**
				 * 开始盒模型`col`索引值
				 * @property {number} startX
				 */
				startX: 0,
				/**
				 * 开始盒模型`row`索引值
				 * @property {number} startY
				 */
				startY: 0,
				/**
				 * 结束盒模型`col`索引值
				 * @property {number} endX
				 */
				endX: 0,
				/**
				 * 结束盒模型`row`索引值
				 * @property {number} endY
				 */
				endY: 0
			},
			selectType: 'operation' // 'dataSource','drag'
		}
	});
	return SelectRegion;
});