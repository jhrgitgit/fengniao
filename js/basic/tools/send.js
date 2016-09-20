'use strict';
define(function(require) {
	var $ = require('lib/jquery'),
		cache = require('basic/tools/cache'),
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
			var self = this,
				config = {},
				NULLFUNC = function() {},
				containerId = cache.containerId;
			if (!cfg.url) {
				return;
			}
			config = {
				url: typeof cfg.url === 'string' ? (systemConfig.rootPath + cfg.url) : undefined,
				type: cfg.type || 'post',
				contentType: cfg.contentType || 'application/json; charset=UTF-8',
				dataType: cfg.dataType || 'json',
				data: cfg.data || '',
				async: cfg.async !== undefined ? cfg.async : false,
				// async: cfg.async !== undefined ? cfg.async : true,
				timeout: cfg.timeout || 5000,
				success: cfg.success || NULLFUNC,
				error: cfg.error || NULLFUNC,
				complete: cfg.complete || NULLFUNC,
				isPublic: cfg.isPublic !== undefined ? cfg.isPublic : true
			};
			//请求过滤,回调数据
			if (config.isPublic === true) {
				cache.sendQueueStep++;
			}
			$.ajax({
				url: config.url,
				beforeSend: function(request) {
					var step = cache.sendQueueStep;
					if (config.isPublic === true) {
						request.setRequestHeader('step', step);
					} else if (config.url.indexOf('openexcel') !== -1) {
						request.setRequestHeader('step', step);
					}
					request.setRequestHeader('excelId', window.SPREADSHEET_AUTHENTIC_KEY);
					request.setRequestHeader('sheetId', '1');

				},
				type: config.type,
				contentType: config.contentType,
				dataType: config.dataType,
				async: config.async, 
				data: config.data,
				timeout: config.timeout,
				success: function(data) {
					if (config.async || data.returncode === -1) {
						if ($('#' + containerId + ' .loadmark').length === 0) {
							$('#' + containerId).append('<div class="loadmark"></div>');
						}
						setTimeout(function() {
							self.PackAjax(cfg);
						}, 500);
					} else {
						config.success(data);
						if ($('#' + containerId + ' .loadmark').length > 0) {
							$('#' + containerId + ' .loadmark').remove();
						}
					}
				},
				error: config.error,
				complete: config.complete
			});
		}
	};
});