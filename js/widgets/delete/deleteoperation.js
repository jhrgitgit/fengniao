'use strict';
define(function(require) {
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		rowOperation = require('entrance/tool/deleterow'),
		colOperation = require('entrance/tool/deletecol'),
		deleteOperation;
		
	deleteOperation = Backbone.View.extend({
		el: '#delete',
		events: {
			'mousedown li': 'action'
		},
		action: function(e) {
			var operate = $(e.currentTarget).data('type');
			if(operate === 'column'){
				this.deleteColumn();
			}else{
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
	return deleteOperation;
});