'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
		SheetModel = require('models/sheet');


	/**
	 * 选中区域集合类
	 * @author ray wu
	 * @since 0.1.0
	 * @class SelectRegion  
	 * @module collections
	 * @extends Backbone.Collection
	 * @constructor
	 */
	var Sheets = Backbone.Collection.extend({
		/**
		 * 集合成员类型
		 * @property model 
		 * @type app.Models.SelectRegion
		 */
		model: SheetModel
	});
	return new Sheets();
});