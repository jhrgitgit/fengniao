'use strict';
define(function(require) {
	var cache = require('basic/tools/cache'),
		config = require('spreadsheet/config'),
		selectRegions = require('collections/selectRegion'),
		operation;

	operation = {
		setDataSourceRegion: function() {
			cache.mouseOperateState = config.mouseOperateState.dataSource;
		},
		setSelectRegion: function() {
			cache.mouseOperateState = config.mouseOperateState.select;
		},
		destroyDataSoureRegion: function() {
			if (selectRegions.getModelByType('dataSource')[0] !== undefined) {
				selectRegions.getModelByType('dataSource')[0].destroy();
			}
		}
	};
	return operation;
});