define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		template = require('basic/tools/template'),
		config = require('spreadsheet/config'),
		excelBuild = require('spreadsheet/excelbuild');

	function SpreadSheet(id, cfg) {
		if (cfg !== undefined && window.SPREADSHEET_BUILD_STATE === 'true') {
			config.User.initRowNum = cfg.initRowNum || config.User.initRowNum;
			config.User.initColNum = cfg.initColNum || config.User.initColNum;
			config.User.cellWidth = cfg.cellWidth || config.User.cellWidth;
			config.User.cellHeight = cfg.cellHeight || config.User.cellHeight;
			config.User.maxColNum = cfg.maxColNum || config.User.maxColNum;
			config.User.maxRowNum = cfg.maxRowNum || config.User.maxRowNum;
		}
		template('#spreadSheet');
		excelBuild.buildExcelOriginalData();
		excelBuild.buildExcelView();
		excelBuild.buildExcelToolbar();
		excelBuild.buildExcelPublicAPI(SpreadSheet);
		excelBuild.buildDataSourceOperation(SpreadSheet);
		excelBuild.buildExcelEventListener(SpreadSheet);
		excelBuild.buildExcelExtend(SpreadSheet);

	}
	return SpreadSheet;
});