'use strict';
define(function(require) {

	var Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		analysisLabel = require('basic/tools/analysislabel');


	var setFrozen = function(sheetId, frozenPositon, label) {
		var select,
			region = {};
		//选中区域内开始坐标，结束坐标
		if (label !== undefined) {
			region = analysisLabel(label);
		} else {
			select = selectRegions.getModelByType('operation')[0];
			region.startColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').startX);
			region.startRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').startY);
			region.endColIndex = headItemCols.getIndexByAlias(select.get('wholePosi').endX);
			region.endRowIndex = headItemRows.getIndexByAlias(select.get('wholePosi').endY);
		}
		if (region.endColIndex === 'MAX' || region.endRowIndex === 'MAX') {
			return;
		}
		region = cells.getFullOperationRegion(region);

		switch (frozenPositon) {
			case 'custom':
				setCustom(region);
				break;
			case 'row':
				setRow();
				break;
			case 'col':
				setCol();
				break;
			case 'unfrozen':
				setUnfrozen();
				break;
			default:
				setCustom(region);
				break;
		}
		Backbone.trigger('event:bodyContainer:executiveFrozen');
	};

	/**
	 * 过滤超出用户可视区域操作
	 * @method filterOutUserView
	 */
	var filterOutUserView = function(region) {
		var userViewColIndex = headItemCols.getIndexByAlias(cache.UserView.colAlias),
			userViewRowIndex = headItemRows.getIndexByAlias(cache.UserView.rowAlias),
			userViewEndColIndex = headItemCols.getIndexByAlias(cache.UserView.colEndAlias),
			userViewEndRowIndex = headItemRows.getIndexByAlias(cache.UserView.rowEndAlias);
		//初始化，未进行滚动
		if (userViewRowIndex === userViewEndRowIndex) {
			return false;
		} else if (region.startColIndex < userViewColIndex || region.startRowIndex < userViewRowIndex || region.startColIndex > userViewEndColIndex || region.startRowIndex > userViewEndRowIndex) {
			return true;
		} else {
			return false;
		}
	};
	/**
	 * 执行自定义冻结
	 * @method setCustom
	 */
	var setCustom = function(region) {
		if (filterOutUserView(region)) {
			return;
		}
		var headItemRowList = headItemRows.models,
			headItemColList = headItemCols.models,
			splitColAlias = headItemColList[region.startColIndex].get('alias'),
			splitRowAlias = headItemRowList[region.startRowIndex].get('alias');

		cache.TempProp = {
			isFrozen: true,
			colAlias: splitColAlias,
			rowAlias: splitRowAlias,
			rowFrozen: true,
			colFrozen: true
		};

		requestFrozen(splitColAlias, splitRowAlias, cache.UserView.colAlias, cache.UserView.rowAlias);
	};
	/**
	 * 执行列冻结
	 * @method setCustom
	 */
	var setCol = function() {
		var neighborModel = headItemCols.getNeighborModelByAlias(cache.UserView.colAlias, 'RIGHT');
		cache.TempProp = {
			isFrozen: true,
			colAlias: neighborModel.get('alias'),
			rowAlias: '1',
			colFrozen: true
		};
		cache.UserView.rowAlias = '1';
		requestFrozen(neighborModel.get('alias'), '1', cache.UserView.colAlias, cache.UserView.rowAlias);
	};
	/**
	 * 执行行冻结
	 * @method setCustom
	 */
	var setRow = function() {
		var neighborModel = headItemRows.getNeighborModelByAlias(cache.UserView.rowAlias, 'RIGHT');
		cache.TempProp = {
			isFrozen: true,
			colAlias: '1',
			rowAlias: neighborModel.get('alias'),
			rowFrozen: true
		};

		cache.UserView.colAlias = '1';
		requestFrozen('1', neighborModel.get('alias'), cache.UserView.colAlias, cache.UserView.rowAlias);
	};
	/**
	 * 解除冻结
	 * @method setUnfrozen
	 */
	var setUnfrozen = function() {
		cache.TempProp = {
			isFrozen: false,
			colAlias: '1',
			rowAlias: '1'
		};
		requestUnfrozen();
	};
	/**
	 * 向后台请求冻结操作
	 * @method requestFrozen
	 */
	var requestFrozen = function(frozenColAlias, frozenRowAlias, startColAlias, startRowAlias) {
		var excelId = window.SPREADSHEET_AUTHENTIC_KEY,
			sheetId = '1';

		send.PackAjax({
			url: 'excel.htm?m=frozen',
			data: JSON.stringify({
				excelId: excelId,
				sheetId: '1',
				frozenX: frozenColAlias,
				frozenY: frozenRowAlias,
				startX: startColAlias,
				startY: startRowAlias
			})
		});
	};
	/**
	 * 向后台请求解除冻操作
	 * @method requestUnfrozen
	 */
	var requestUnfrozen = function() {
		var excelId = window.SPREADSHEET_AUTHENTIC_KEY;
		send.PackAjax({
			url: 'sheet.htm?m=unFrozen&excelId=' + excelId + '&sheetId=1'
		});
	};
	return setFrozen;
});