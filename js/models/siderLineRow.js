
define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		BackboneNest = require('lib/backbone.nested'),
		SiderLineRowModel;
	
	/**
	 * SiderLineRow model对象
	 * @author ray wu
	 * @since 0.1.0
	 * @class SiderLineRow  
	 * @module models
	 * @extends Backbone.Model
	 * @constructor
	 */
	SiderLineRowModel = Backbone.Model.extend({
		defaults: {
			/**
			 * 相对位置`top`值
			 * @property {number} top
			 */
			top: 0,
			/**
			 * 高度
			 * @property {number} height
			 */
			height: 17
		}
	});
	return SiderLineRowModel;
});