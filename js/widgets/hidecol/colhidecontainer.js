'use strict';
define(function(require) {
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		colHide = require('entrance/col/colhide'),
		HideOperation;

	HideOperation = Backbone.View.extend({
		el: '#hideContainer',
		events: {
			'click .fui-section': 'action'
		},
		action: function(e) {
			var operate = $(e.currentTarget).data('toolbar');
			if (operate === 'hide') {
				colHide.hide();
			} else {
				colHide.cancelHide();
			}
		}
	});
	return HideOperation;
});