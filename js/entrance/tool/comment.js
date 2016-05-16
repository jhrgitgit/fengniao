'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cells = require('collections/cells'),
		Backbone = require('lib/backbone'),
		commentHandler;

	commentHandler = {
		addComment: function(sheetId) {
			Backbone.trigger('event:selectRegion:createCommentContainer', undefined, 'add');
			
		},
		editComment: function(sheetId) {
			Backbone.trigger('event:selectRegion:createCommentContainer', undefined, 'edit');
		},
		deleteComment: function(sheetId) {
			var cellList,
				i;
			cellList = cells.getCellsByWholeSelectRegion();
			for (i in cellList) {
				if (cellList[i] !== null) {
					cellList[i].set('customProp.comment', null);
				}
			}
		}
	};
	return commentHandler;
});