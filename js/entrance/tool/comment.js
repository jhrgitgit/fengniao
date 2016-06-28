'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cells = require('collections/cells'),
		Backbone = require('lib/backbone'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion'),
		analysisLabel = require('basic/tools/analysislabel'),
		rowOperate = require('entrance/row/rowoperation'),
		commentHandler;

	commentHandler = {
		modifyComment: function(sheetId, comment, label) {
			if (label !== undefined) {
				region = analysisLabel(label);
			} else {
				select = selectRegions.getModelByType('operation')[0];
				region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
				region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
				region.endColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').endX);
				region.endRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').endY);
			}

			if (region.endColIndex === 'MAX') { //整行操作
				rowOperate.rowPropOper(region.startRowIndex, 'customProp.comment', comment);
				endColAlias = 'MAX';
			} else {
				region = cells.getFullOperationRegion(region);
				cells.operateCellsByRegion(region, function(cell) {
					cell.set('customProp.comment', comment);
				});
			}

			this.sendData(region, comment, 'text.htm?m=comment_set');
		},

		createAddCommentView: function(sheetId) {
			var select = selectRegions.getModelByType('operation')[0];
			Backbone.trigger('event:commentContainer:show', {
				'state': 'add',
			});
		},

		createEditComment: function(sheetId) {
			var select = selectRegions.getModelByType('operation')[0];
			Backbone.trigger('event:commentContainer:show', {
				'state': 'edit'
			});
		},

		deleteComment: function(sheetId, label) {
			var select,
				region = {};
			if (label !== undefined) {
				region = analysisLabel(label);
			} else {
				select = selectRegions.getModelByType('operation')[0];
				region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
				region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
				region.endColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').endX);
				region.endRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').endY);
			}
			if (region.endColIndex === 'MAX') { //整行操作
				rowOperate.rowPropOper(region.startRowIndex, 'customProp.comment', null);
			} else {
				region = cells.getFullOperationRegion(region);
				cells.operateCellsByRegion(region, function(cell) {
					cell.set('customProp.comment', null);
				});
			}
			this.sendData(region, undefined, 'text.htm?m=comment_del');
		},
		sendData: function(region, comment, url) {
			var startColAlias,
				startRowAlias,
				endColAlias,
				endRowAlias,
				data;

			startColAlias = headItemCols.models[region.startColIndex].get('alias');
			startRowAlias = headItemRows.models[region.startRowIndex].get('alias');
			if (region.endColIndex === 'MAX') {
				endColAlias = 'MAX';
			} else {
				endColAlias = headItemCols.models[region.endColIndex].get('alias');
			}
			if (region.endRowIndex === 'MAX') {
				endRowAlias = headItemRows.models[region.endRowIndex].get('alias');
			} else{
				endRowAlias = headItemRows.models[region.startRowIndex].get('alias');
			}

			data = {
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: {
					startRowAlais: startRowAlias,
					endRowAlais: endRowAlias,
					startColAlais: startColAlias,
					endColAlais: endColAlias
				}
			};
			if (comment !== undefined) {
				data.comment = comment;
			}

			send.PackAjax({
				url: url,
				data: JSON.stringify(data)
			});
		}
	};
	return commentHandler;
});