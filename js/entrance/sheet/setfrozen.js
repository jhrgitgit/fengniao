'use strict';
define(function(require) {

	var Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cache = require('basic/tools/cache'),
		binary = require('basic/util/binary'),
		selectRegions = require('collections/selectRegion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		getOperRegion = require('basic/tools/getoperregion');


	var setFrozen = function(sheetId, frozenPositon, label) {


		var clip,
			region,
			operRegion,
			sendRegion;

		clip = selectRegions.getModelByType('clip')[0];
		if (clip !== undefined) {
			cache.clipState = 'null';
			clip.destroy();
		}
		region = getOperRegion(label);
		operRegion = region.operRegion;
		sendRegion = region.sendRegion;

		if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
			return;
		}
		if (sendRegion.endColIndex === 100 || sendRegion.endRowIndex === 10000) {
			return;
		}

		switch (frozenPositon) {
			case 'custom':
				setCustom(operRegion);
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
				setCustom(operRegion);
				break;
		}
		Backbone.trigger('event:bodyContainer:executiveFrozen');
	};

	/**
	 * 过滤超出用户可视区域操作
	 * @method filterOutUserView
	 */
	var filterOutUserView = function(region) {
		var startViewColIndex,
			startViewRowIndex,
			endViewColIndex,
			endViewRowIndex;

		startViewColIndex = binary.newModelBinary(cache.gridLineView.left, headItemCols.models, 'left', 'width');
		startViewRowIndex = binary.newModelBinary(cache.gridLineView.top, headItemRows.models, 'top', 'height');
		endViewColIndex = binary.newModelBinary(cache.gridLineView.left, headItemCols.models, 'left', 'width');
		endViewRowIndex = binary.newModelBinary(cache.gridLineView.bottom, headItemRows.models, 'top', 'height');

		if (region.startColIndex < startViewColIndex ||
			region.startRowIndex < startViewRowIndex ||
			region.startColIndex > endViewColIndex ||
			region.startRowIndex > endViewRowIndex) {
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
		var headItemRowList = headItemRows.models,
			headItemColList = headItemCols.models,
			splitColAlias = headItemColList[region.startColIndex].get('alias'),
			splitRowAlias = headItemRowList[region.startRowIndex].get('alias'),
			splitColSort = headItemColList[region.startColIndex].get('sort'),
			splitRowSort = headItemRowList[region.startRowIndex].get('sort');

		if (filterOutUserView(region)) {
			return;
		}

		cache.TempProp = {
			isFrozen: true,
			colAlias: splitColAlias,
			rowAlias: splitRowAlias,
			rowFrozen: true,
			colFrozen: true
		};

		requestFrozen(splitColSort, splitRowSort);
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
		requestFrozen(neighborModel.get('sort'), 0);
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
		requestFrozen(0, neighborModel.get('sort'));
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
	var requestFrozen = function(frozenColSort, frozenRowSort) {
		var startColSort = headItemCols.getModelByAlias(cache.UserView.colAlias).get('sort'),
			startRowSort = headItemRows.getModelByAlias(cache.UserView.rowAlias).get('sort');
		send.PackAjax({
			url: 'sheet.htm?m=frozen',
			data: JSON.stringify({
				frozenSortX: frozenColSort,
				frozenSortY: frozenRowSort,
				startSortX: startColSort,
				startSortY: startRowSort
			})
		});
	};
	/**
	 * 向后台请求解除冻操作
	 * @method requestUnfrozen
	 */
	var requestUnfrozen = function() {
		send.PackAjax({
			url: 'sheet.htm?m=unFrozen'
		});
	};
	return setFrozen;
});