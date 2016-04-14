define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		systemConfig = require('spreadsheet/config');
	/**
	 * ajax工具类
	 * @author ray wu
	 * @class packAjax
	 * @since 0.1.0
	 * @module basic
	 */
	return {
		/**
		 * 封装的AJAX，为减少代码的重复内容
		 * 部分封装默认参数
		 * @method PackAjax
		 * @param  {object} cfg 用户自定义配置
		 */
		PackAjax: function(cfg) {
			var config = {},
				NULLFUNC = function() {};
			if (!cfg.url) {
				return;
			}
			config = {
				url: typeof cfg.url === 'string' ? (systemConfig.rootPath + cfg.url) : undefined,
				type: cfg.type || 'post',
				contentType: cfg.contentType || 'application/json; charset=UTF-8',
				dataType: cfg.dataType || 'json',
				data: cfg.data || '',
				async: cfg.async !== undefined ? cfg.async : true,
				timeout: cfg.timeout || 5000,
				success: cfg.success || NULLFUNC,
				error: cfg.error || NULLFUNC,
				complete: cfg.complete || NULLFUNC
			};

			$.ajax({
				url: config.url,
				type: config.type,
				contentType: config.contentType,
				dataType: config.dataType,
				async: config.async,
				data: config.data,
				timeout: config.timeout,
				success: config.success,
				error: config.error,
				complete: function() {
					config.complete();
				}
			});

		}
	};
});