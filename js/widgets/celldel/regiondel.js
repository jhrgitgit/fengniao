'use strict';
define(function(require) {
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		regionDelOpr = require('entrance/tool/regiondel'),
		regionDel;
		
	regionDel = Backbone.View.extend({
		el: '#regionDelContainer',
		events: {
			'click': 'action'
		},
		action: function(e) {
			regionDelOpr();
		}
	});
	return regionDel;
});