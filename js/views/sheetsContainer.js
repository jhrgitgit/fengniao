define(function(require) {
	'use strict';
	var Backbone = require('lib/backbone'),
		sheets = require('collections/sheets'),
		SheetContainer = require('views/sheetContainer');
	/**
	 * RowsGridContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class RowsGridContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var SheetsContainer = Backbone.View.extend({

		tagName: 'ul',
		/**
		 * @property {element} className
		 */
		className: 'sheet-list',
		/**
		 * 初始化事件监听
		 * @method initialize
		 */
		initialize: function(option) {
			if (sheets.length < 1) {
				sheets.add({
					name: 'Sheet1',
					sort: 0
				});
			}
		},
		render: function() {
			var i, sheetView, active;
			for (i = 0; i < sheets.length; i++) {
				if (i === 0) {
					active = true;
				} else {
					active = false;
				}
				sheetView = new SheetContainer({
					model: sheets.models[i],
					active: active
				});
				this.$el.append(sheetView.render().el);
			}
			return this;
		},
		destroy:function(){
			this.remove();
		}
	});
	return SheetsContainer;
});