'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
		SiderLineRowModel = require('models/siderLineRow'),
		SiderLineRows;

	/**
	 * 选中区域行标线类
	 * @author ray wu
	 * @since 0.1.0
	 * @class SiderLineRow  
	 * @module collections
	 * @extends Backbone.Collection
	 * @constructor
	 */
	SiderLineRows = Backbone.Collection.extend({
		/**
		 * 集合成员类型
		 * @property model 
		 * @type app.Models.SiderLineRow
		 */
		model: SiderLineRowModel,
		url: 'siderrow'
	});
	return new SiderLineRows();
});