define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache'),
		Point = require('basic/tools/point'),
		excelBuild = require('spreadsheet/excelbuild');

	function SpreadSheet(id, cfg) {
		if (!document.getElementById(id)) {
			throw new Error('未找到id为' + id + '容器');
		}
		if (cfg !== undefined && window.SPREADSHEET_BUILD_STATE === 'true') {
			config.User.initRowNum = cfg.initRowNum || config.User.initRowNum;
			config.User.initColNum = cfg.initColNum || config.User.initColNum;
			config.User.cellWidth = cfg.cellWidth || config.User.cellWidth;
			config.User.cellHeight = cfg.cellHeight || config.User.cellHeight;
			config.User.maxColNum = cfg.maxColNum || config.User.maxColNum;
			config.User.maxRowNum = cfg.maxRowNum || config.User.maxRowNum;
		}
		cache.containerId = id;
		excelBuild.buildDom(id);
		excelBuild.buildExcelOriginalData(id);
		excelBuild.buildExcelView(id);
		excelBuild.buildExcelToolbar();
		excelBuild.buildExcelPublicAPI(SpreadSheet);
		excelBuild.buildDataSourceOperation(SpreadSheet);
		excelBuild.buildExcelEventListener(SpreadSheet);
		excelBuild.buildExcelExtend(SpreadSheet);
	}
	SpreadSheet.Point = Point;
	return SpreadSheet;
});