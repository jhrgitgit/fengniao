//attention bug, new model has large question

define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		_ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		selectRegions = require('collections/selectRegion'),
		setAlign = require('entrance/tool/setalign'),
		setWordWrap = require('entrance/tool/setwordwrap');

	/**
	 * ContentAlignContainer
	 * @author ray wu
	 * @since 0.1.0
	 * @class ContentAlignContainer  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */
	var ContentAlignContainer = Backbone.View.extend({
		/**
		 * @property {element} el
		 */
		el: "#contentAlignContainer",
		/**
		 * @property {object} events
		 */
		events: {
			/**
			 * 设置对象方式
			 * @event click
			 */
			'click span[data-align]': 'setAlignAction'
		},
		/**
		 * [setAlignAction description]
		 * @method setAlignAction
		 * @param  {event} e 鼠标点击事件
		 */
		setAlignAction: function(e) {
			var alignType,
				transverse,
				data,
				url,
				vertical;
			alignType = $(e.currentTarget).data('align');
			if(alignType==='wordWrap'){
				setWordWrap();
			}else{
				setAlign('1', alignType);
			}
			
		}
	});
	return ContentAlignContainer;
});