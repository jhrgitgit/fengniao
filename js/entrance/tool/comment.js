'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cells = require('collections/cells'),
		Backbone = require('lib/backbone'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion'),
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
			this.sendData();
		},
		sendData: function() {
			var select,
				startColAlias,
				startRowAlias,
				endColAlias,
				endRowAlias;
			select = selectRegions.getModelByType('operation')[0];
			startColAlias = headItemCols.models[select.get('wholePosi').startX].get('alias');
			startRowAlias = headItemRows.models[select.get('wholePosi').startY].get('alias');
			endColAlias = headItemCols.models[select.get('wholePosi').endX].get('alias');
			endRowAlias = headItemRows.models[select.get('wholePosi').endY].get('alias');
			send.PackAjax({
				url: 'text.htm?m=comment_del',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					coordinate: {
						startRowAlais: startRowAlias,
						endRowAlais: endRowAlias,
						startColAlais: startColAlias,
						endColAlais: endColAlias
					},
				})
			});
		}
	};
	return commentHandler;
});