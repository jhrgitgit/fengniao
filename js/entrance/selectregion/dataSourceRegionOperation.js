define(function(require) {
	'use strict';
	var cache = require('basic/tools/cache'),
		operation;

	operation = {
		setDataSourceRegion: function() {
			cache.setDataSource = true;
		},
		setSelectRegion: function() {
			cache.setDataSource = false;
		},
		destroyDataSoureRegion: function() {
			if (selectRegions.getModelByType("dataSource")[0] !== undefined) {
				selectRegions.getModelByType("dataSource")[0].destroy();
			}
		}
	};
	return operation;
});