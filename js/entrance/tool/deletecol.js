'use strict';
define(function(require) {
	var Backbone = require('lib/backbone'),
		cache = require('basic/tools/cache'),
		headItemRows = require('collections/headItemRow'),
		cells = require('collections/cells'),
		selectRegions = require('collections/selectRegion'),
		siderLineRows = require('collections/siderLineRow'),
		send = require('basic/tools/send');

	return {
		/**
		 * 删除列操作
		 * @param {string} sheetId sheetId
		 * @param {string} label   行标识号,如果为undefined,则按照当前选中区域进行操作
		 */
		deleteCol: function(sheetId, label) {
			var index = -1,
				alias,
				select,
				clip,
				box;

			clip = selectRegions.getModelByType('clip')[0];                                                                                                                                                                                                                                                                                                                          
			if (clip !== undefined) {
				cache.clipState = 'null';
				clip.destroy();
			}
			if (label !== undefined) {
				index = headItemCols.getIndexByDisplayname(label);
				if (index === -1) {
					return;
				}
			} else {
				select = selectRegions.getModelByType('operation')[0];
				box = select.get('wholePosi');
				if (box.endX !== 'MAX') {
					index = headItemCols.getIndexByAlias(box.startY);
				}
			}

			alias = headItemCols.models[index].get('alias');

			this._adaptCells(index);
			this._adaptSelectRegion(index);
			this._frozenHandle(index);
			this._adaptHeadRowItem(index);

			if (cache.TempProp.isFrozen === true) {
				Backbone.trigger('event:bodyContainer:executiveFrozen');
			}
			Backbone.on('event:mainContainer:addBottom');

			send.PackAjax({
				url: 'cells.htm?m=cols_delete',
				data: JSON.stringify({
					excelId: window.SPREADSHEET_AUTHENTIC_KEY,
					sheetId: '1',
					colAlias: alias,
				}),
			});
		},
		/**
		 * 调整行对象
		 * @param  {number} index 行索引值
		 */
		_adaptHeadRowItem: function(index) {
			var currentRowModel,
				height,
				sort,
				top,
				len,
				i = index;
			currentColModel = headItemCols.models[index];
			height = currentRowModel.get('height');
			headItemRows.remove(currentRowModel);
			currentRowModel.destroy();

			len = headItemRows.length;
			for (; i < len; i++) {
				currentRowModel = headItemRows.models[i];
				top = currentRowModel.get('top') - height - 1;
				sort = currentRowModel.get('sort') - 1;
				currentRowModel.set('top', top);
				currentRowModel.set('displayName', (sort + 1).toString());
				currentRowModel.set('sort', sort);
			}
		},
		/**
		 * 调整选中区域
		 * @param  {number} index 索引值
		 */
		_adaptSelectRegion: function(index) {
			var select,
				startColAlias,
				endColAlias,
				startColIndex,
				endColIndex,
				width,
				left;

			select = selectRegions.getModelByType('operation')[0];
			startColAlias = select.get('wholePosi').startX;
			endColAlias = select.get('wholePosi').endX;
			startColIndex = headItemCols.getIndexByAlias(startColAlias);
			endColIndex = headItemCols.getIndexByAlias(endColAlias);

			top = select.get('physicsPosi').top;
			height = select.get('physicsBox').height;


			if (endColIndex < index) {
				return;
			}
			if (startColIndex === index) {
				if (endColIndex === startColIndex) {
					width = headItemCols.models[index + 1].get('width');
					endColAlias = headItemCols.models[index + 1].get('alias');
					select.set('wholePosi.endY', endColAlias);
					select.set('wholePosi.startY', endColAlias);
					headItemCols.models[index + 1].set('activeState', true);
				} else {
					width = width - headItemCols.models[index].get('width') - 1;
				}
				startColAlias = headItemCols.models[index + 1].get('alias');
				select.set('wholePosi.startY', startColAlias);
				select.set('physicsBox.width', width);

			}
			if (endColIndex !== startColIndex && endColIndex === index) {
				width = select.get('physicsBox').width;
				width = width - headItemCols.models[index].get('width') - 1;
				endColAlias = headItemCols.models[index - 1].get('alias');
				select.set('wholePosi.endX', endColAlias);
			}
			if (startColIndex < index && endColIndex > index) {
				width = select.get('physicsBox').width;
				width = width - headItemCols.models[index].get('width') - 1;
				select.set('physicsBox.width', width);
			}

			if (startColIndex > index) {
				left = left - headItemCols.models[index].get('width') - 1;
				select.set('physicsPosi.left', left);
			}
			siderLineRows.models[0].set('width', width);
		},
		/**
		 * 调整单元格
		 * @param  {number} index 索引 
		 */
		_adaptCells: function(index) {
			var width,
				left,
				deleteAlias,
				rowAlias,
				aliasRowArray,
				aliasColArray,
				startIndex,
				cellsList,
				aliasLen,
				len, i = 0,
				j,
				tempCell;

			cellsList = cells.getCellsByColIndex(index,
				headItemCols.length - 1);

			deleteAlias = headItemCols.models[index].get('alias');

			len = cellsList.length;
			for (; i < len; i++) {
				tempCell = cellsList[i];
				aliasRowArray = tempCell.get('occupy').y;
				aliasColArray = tempCell.get('occupy').x;
				aliasLen = aliasRowArray.length;
				colAlias = aliasColArray[0];

				startIndex = headItemCols.getIndexByAlias(colAlias);

				if (startIndex === index && aliasColArray.length === 1) {
					tempCell.set('isDestroy', true);

				} else if (startIndex <= index) {

					width = tempCell.get('physicsBox').width;
					width -= headItemCols.models[index].get('width');
					tempCell.set('physicsBox.width', width - 1);
					aliasColArray.splice(index - startIndex, 1);
					tempCell.set('occupy.x', aliasColArray);
				} else if (startIndex > index) {
					left = tempCell.get('physicsBox').left;
					left = left - headItemCols.models[index].get('width') - 1;
					tempCell.set('physicsBox.left', left);
				}
				for (j = 0; j < aliasLen; j++) {
					cache.deletePosi(aliasRowArray[i], deleteAlias);
				}
			}
		},
		/**
		 * 处理冻结状态下,插入行功能
		 * @param  {number} index 插入索引
		 */
		_frozenHandle: function(index) {
			var userViewAlias,
				userViewIndex,
				frozenAlias,
				frozenIndex;

			if (cache.TempProp.isFrozen === true) {
				userViewAlias = cache.UserView.colAlias;
				frozenAlias = cache.TempProp.colAlias;
				userViewIndex = headItemCols.getIndexByAlias(userViewAlias);
				frozenIndex = headItemCols.getIndexByAlias(frozenAlias);

				if (userViewIndex === index) {
					cache.UserView.colAlias = headItemCols.models[index + 1].get('alias');
				}
				if (frozenIndex === index) {
					if (index === 0) {
						cache.TempProp.colAlias = headItemCols.models[1].get('alias');
					} else {
						cache.TempProp.colAlias = headItemCols.models[index + 1].get('alias');
					}
				}
			}
		}
	};
});