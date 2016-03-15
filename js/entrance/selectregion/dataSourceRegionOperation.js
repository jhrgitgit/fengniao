define(function(require) {
	'use strict';
	var cache = require('basic/tools/cache'),
		dataSourceRegions = require('collections/dataSourceRegion'),
		operation;

	operation = {
		setDataSourceRegion: function() {
			cache.setDataSource = true;
		},
		setSelectRegion: function() {
			cache.setDataSource = false;
		},
		destroyDataSoureRegion: function() {
			if (dataSourceRegions.length > 0) {
				dataSourceRegions.models[0].destroy();
			}
		}
	};
	return operation;
});