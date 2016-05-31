'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
		SiderLineColModel = require('models/siderLineCol'),
		SiderLineCols;
	/**
	 * 选中区域列标线类
	 * @author ray wu
	 * @since 0.1.0
	 * @class SiderLineCol  
	 * @module collections
	 * @extends Backbone.Collection
	 * @constructor
	 */
	SiderLineCols = Backbone.Collection.extend({
		/**
		 * 集合成员类型
		 * @property model 
		 * @type app.Models.SiderLineCol
		 */
		model: SiderLineColModel,
		url: 'sidercol'
	});
	return new SiderLineCols();
});