'use strict';
define(function(require) {
	var BackboneNest = require('lib/backbone.nested'),
		SiderLineColModel;


	/**
	 * siderLineCol model对象
	 * @author ray wu
	 * @since 0.1.0
	 * @class SiderLineCol  
	 * @module models
	 * @extends Backbone.Model
	 * @constructor
	 */
	SiderLineColModel = BackboneNest.NestedModel.extend({
		defaults: {
			/**
			 * 相对位置`left`值
			 * @property {number} left
			 */
			left: 0,
			/**
			 * 宽度
			 * @property {number} width
			 */
			width: 69
		}
	});
	return SiderLineColModel;
});