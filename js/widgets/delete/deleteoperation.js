'use strict';
define(function(require) {
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		rowOperation = require('entrance/tool/deleterow'),
		InsertOperation;
		
	InsertOperation = Backbone.View.extend({
		el: '#delete',
		events: {
			'mousedown li': 'action'
		},
		action: function(e) {
			var operate = $(e.currentTarget).data('operate');
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

		}
	});
	return InsertOperation;
});