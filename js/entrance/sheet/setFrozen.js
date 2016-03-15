define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		selectRegions = require('collections/selectRegion'),
		cells = require('collections/cells'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		regionOperation = require('entrance/regionoperation'),
		sendRegion;


	var setFrozen = function(sheetId, frozenPositon, region) {
		var operationRegion = {};
		if (region !== undefined && region !== null) {
			operationRegion = regionOperation.getRegionIndexByRegionLabel(region);
			operationRegion = regionOperation.getFullSelectRegion(operationRegion.startColIndex, operationRegion.startRowIndex, operationRegion.endColIndex, operationRegion.endRowIndex);
		} else {
			operationRegion.startColIndex = selectRegions.models[0].get('wholePosi').startX;
			operationRegion.startRowIndex = selectRegions.models[0].get('wholePosi').startY;
			operationRegion.endColIndex = selectRegions.models[0].get('wholePosi').endX;
			operationRegion.endRowIndex = selectRegions.models[0].get('wholePosi').endY;
		}
		switch (frozenPositon) {
			case 'custom':
				setCustom(operationRegion);
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
		}
		Backbone.trigger('event:bodyContainer:executiveFrozen');
	};
	/**
	 * 过滤超出用户可视区域操作
	 * @method filterOutUserView
	 */
	var filterOutUserView = function(operationRegion) {
		var headItemRowList = headItemRows.models,
			headItemColList = headItemCols.models,
			userViewColIndex = headItemCols.getIndexByAlias(cache.UserView.colAlias),
			userViewRowIndex = headItemRows.getIndexByAlias(cache.UserView.rowAlias),
			userViewEndColIndex = headItemCols.getIndexByAlias(cache.UserView.colEndAlias),
			userViewEndRowIndex = headItemRows.getIndexByAlias(cache.UserView.rowEndAlias);
		//初始化，未进行滚动
		if (userViewRowIndex === userViewEndRowIndex) {
			return false;
		} else if (operationRegion.startColIndex < userViewColIndex || operationRegion.startRowIndex < userViewRowIndex || operationRegion.startColIndex > userViewEndColIndex || operationRegion.startRowIndex > userViewEndRowIndex) {
			return true;
		} else {
			return false;
		}
	};
	/**
	 * 执行自定义冻结
	 * @method setCustom
	 */
	var setCustom = function(operationRegion) {
		if (filterOutUserView(operationRegion)) {
			return;
		}
		var headItemRowList = headItemRows.models,
			headItemColList = headItemCols.models,
			splitColAlias = headItemColList[operationRegion.startColIndex].get('alias'),
			splitRowAlias = headItemRowList[operationRegion.startRowIndex].get('alias');

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
		var excelId = SPREADSHEET_AUTHENTIC_KEY,
			sheetId = '1';
		send.PackAjax({
			url: 'sheet.htm?m=frozen&excelId=' + excelId + '&sheetId=' + sheetId + '&frozenX=' + frozenColAlias + '&frozenY=' + frozenRowAlias + '&startX=' + startColAlias + '&startY=' + startRowAlias,
			success: function(data) {
				console.log('success');
			}
		});
	};
	/**
	 * 向后台请求解除冻操作
	 * @method requestUnfrozen
	 */
	var requestUnfrozen = function() {
		var excelId = window.SPREADSHEET_AUTHENTIC_KEY,
			sheetId = $("#sheetId").val();
		send.PackAjax({
			url: 'sheet.htm?m=unFrozen&excelId=' + excelId + '&sheetId=' + sheetId,
			success: function(data) {

			}
		});
	};
	return setFrozen;
});