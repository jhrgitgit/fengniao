'use strict';
define(function(require) {
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		rowOperation = require('entrance/tool/deleterow'),
		colOperation = require('entrance/tool/deletecol'),
		InsertOperation;
		
	InsertOperation = Backbone.View.extend({
		el: '#delete',
		events: {
			'mousedown li': 'action'
		},
		action: function(e) {
			var operate = $(e.currentTarget).data('type');
			// if(operate === 'column'){
			// 	this.deleteColumn();
			// }else{
			// 	this.deleteRow();
			// }
			if(operate === 'row'){
				this.deleteRow();
			}
		},
		deleteRow: function() {
			rowOperation.deleteRow();
		},
		deleteColumn: function(){
			colOperation.deleteCol();
		}
	});
	return InsertOperation;
});