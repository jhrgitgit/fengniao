define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		SelectRegionModel = require('models/selectRegion'),
		DataSourceRegion;
	/**
	 * 选中数据源集合类
	 * @author ray wu
	 * @since 0.1.0
	 * @class SelectRegion  
	 * @module collections
	 * @extends Backbone.Collection
	 * @constructor
	 */
	DataSourceRegion = Backbone.Collection.extend({
		/**
		 * 集合成员类型
		 * @property model 
		 * @type app.Models.SelectRegion
		 */
		model: SelectRegionModel,
		url: 'select',
	});
	return new DataSourceRegion();
});