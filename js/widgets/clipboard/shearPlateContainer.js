	define(function(require) {
		'use strict';
		var $ = require('lib/jquery'),
			_ = require('lib/underscore'),
			Backbone = require('lib/backbone'),
			clipSelectOperate = require('entrance/tool/clipselectoperate'),
			clipPasteOperate=require('entrance/tool/clippasteoperate'),
			ShearPlateContainer;

		/**
		 * 剪切板视图类
		 * @author ray wu
		 * @since 0.1.0
		 * @class ShearPlateContainer  
		 * @module views
		 * @extends Backbone.View
		 * @constructor
		 */
		ShearPlateContainer = Backbone.View.extend({
			/**
			 * 绑定视图
			 * @property el
			 * @type {String}
			 */
			el: "#shearPlateContainer",
			/**
			 * 类初始化方法
			 * @method initialize
			 */
			initialize: function() {
				_.bindAll(this, 'pasteData');
				Backbone.on('event:pasteData', this.pasteData);
			},
			events: {
				'mousedown div': 'pasteAction'
			},
			pasteAction: function(e) {
				var action;
				action = $(e.currentTarget).data('toolbar');
				switch (action) {
					case 'paste':
						this.pasteData();
						break;
					case 'copy':
						this.copyData();
						break;
					case 'cut':
						this.cutData();
						break;
					default:
						break;
				}
			},
			copyData: function() {
				clipSelectOperate("copy");
			},
			cutData: function() {
				clipSelectOperate("cut");
			},
			/**
			 * 复制数据
			 * @method pasteData
			 * @param  {string} pasteText 数据 
			 */
			pasteData: function(pasteText) {
				clipPasteOperate(pasteText);
			},
		});
		return ShearPlateContainer;
	});