'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		commentContainer;

	commentContainer = Backbone.View.extend({
		tagName: 'textarea',
		className: 'comment',
		state: 'show', // show:显示状态   edit: 编辑状态  
		events: {
			'blur': 'close'
		},
		initialize: function(options) {
			var colIndex,
				rowIndex;
			this.state = options.state || 'show';
			this.comment = options.comment;
			this.startLeft = options.startLeft || 0;
			this.startTop = options.startTop || 0;
			colIndex = options.colIndex;
			rowIndex = options.rowIndex;
			//修改
			this.left = headItemCols.models[colIndex].get('left') + headItemCols.models[colIndex].get('width') + 3 - this.startLeft;
			this.top = headItemRows.models[rowIndex].get('top') - this.startTop;
			if (this.state !== 'show') {
				cache.commentState = true;
			}
		},
		render: function() {
			this.$el.css({
				left: this.left,
				top: this.top,
			});
			this.$el.val(this.comment);
			if (this.state === 'show') {
				this.$el.attr('disabled', true);
			}
			return this;
		},

		close: function() {
			var comment;
			if (this.state !== 'show') {
				cache.commentState = false;
				comment = this.$el.val();
				comment = comment || '';
				Backbone.trigger('event:selectRegion:patchOprCell', function(cell) {
					cell.set('customProp.comment', comment);
				});
			}
			this.sendData(comment);
			this.remove();
		},
		sendData: function(comment){
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
				url: 'text.htm?m=comment_set',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					coordinate: {
						startRowAlais:startRowAlias,
						endRowAlais:endRowAlias,
						startColAlais:startColAlias,
						endColAlais:endColAlias
					},
					comment: comment
				})
			});
		}
	});
	return commentContainer;
});