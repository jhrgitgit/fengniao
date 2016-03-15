define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		config = require('spreadsheet/config'),
		util = require('basic/util/clone'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		CellContainer = require('views/cellContainer');


	/**
	 * ContentContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class ContentContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var ContentCellsContainer = Backbone.View.extend({
		/**
		 * @property {element} el
		 */
		className: 'content-list',
		/**
		 * 初始化监听事件
		 * @method initialize
		 */
		initialize: function() {
			this.currentRule = util.clone(cache.CurrentRule);
			this.listenTo(cells, 'add', this.addCell);
		},
		/**
		 * 视图渲染方法
		 * @method render
		 */
		render: function() {
			this.fillCells();
			return this;
		},
		/**
		 * 填充单元格集合
		 * @method fillCells
		 */
		fillCells: function() {
			var len, i, cellsList;
			cellsList = cells.where({
				isDestroy: false
			});
			len = cellsList.length;
			for (i = 0; i < len; i++) {
				this.addCell(cellsList[i]);
			}
		},
		/**
		 * view创建一个单元格
		 * @method addCell
		 * @param  {object} cell
		 */
		addCell: function(cell) {
			if (cache.TempProp.isFrozen) {
				var displayPosition = this.currentRule.displayPosition,
					currentOccupy,
					len, i,
					headItemColList = headItemCols,
					headItemRowList = headItemRows,
					cellRowStartIndex,
					cellColStartIndex,
					cellRowEndIndex, cellColEndIndex;
				//ps:增加循环判断
				currentOccupy = cell.get('occupy');
				len = currentOccupy.x.length;
				cellColStartIndex = headItemColList.getIndexByAlias(currentOccupy.x[0]);
				cellColEndIndex = headItemColList.getIndexByAlias(currentOccupy.x[len - 1]);

				for (i = 0; i < currentOccupy.y.length; i++) {
					if (headItemRowList.getIndexByAlias(currentOccupy.y[i]) !== -1) {
						cellRowStartIndex = headItemRowList.getIndexByAlias(currentOccupy.y[i]);
						break;
					}
				}
				for (i = currentOccupy.y.length - 1; i > -1; i--) {
					if (headItemRowList.getIndexByAlias(currentOccupy.y[i]) !== -1) {
						cellRowEndIndex = headItemRowList.getIndexByAlias(currentOccupy.y[i]);
						break;
					}
				}
				if (isNumber(displayPosition.startRowIndex) &&
					cellRowEndIndex < displayPosition.startRowIndex ||
					isNumber(displayPosition.endRowIndex) &&
					cellRowStartIndex > displayPosition.endRowIndex - 1 ||
					isNumber(displayPosition.startColIndex) &&
					cellColEndIndex < displayPosition.startColIndex ||
					isNumber(displayPosition.endColIndex) &&
					cellColStartIndex > displayPosition.endColIndex - 1) {
					return;
				}

			}

			this.cellView = new CellContainer({
				model: cell,
				currentRule: this.currentRule
			});
			this.$el.append(this.cellView.render().el);

			function isNumber(source) {
				return typeof source === 'number';
			}

		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			if (this.cellView) {
				this.cellView.destroy();
			}
			this.remove();
		}
	});
	return ContentCellsContainer;
});