define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		Handlebars = require('lib/handlebars'),
		util = require('basic/util/clone'),
		binary = require('basic/util/binary'),
		cache = require('basic/tools/cache'),
		send = require('basic/tools/send'),
		Cell = require('models/cell'),
		headItemRows = require('collections/headItemRow'),
		headItemCols = require('collections/headItemCol'),
		cells = require('collections/cells'),
		InputContainer = require('views/inputContainer'),
		DataSourceRegion;

	/**
	 * 选中区域视图类
	 * @author ray wu
	 * @since 0.1.0
	 * @class SelectRegion  
	 * @module views
	 * @extends Backbone.View
	 * @constructor
	 */

	DataSourceRegion = Backbone.View.extend({
		/**
		 * 设置class属性
		 * @property className
		 * @type {String}
		 */
		className: 'datasource-container',
		/**
		 * 视图初始化函数
		 * @method initialize
		 */
		initialize: function() {
			var modelRowList, modelColList;
			this.listenTo(this.model, 'change', this.changePosition);
			this.listenTo(this.model, 'destroy', this.destroy);
			this.currentRule = util.clone(cache.CurrentRule);
			modelRowList = headItemRows;
			modelColList = headItemCols;
			this.userViewTop = cache.TempProp.isFrozen ? modelRowList.getModelByAlias(cache.UserView.rowAlias).get('top') : 0;
			this.userViewLeft = cache.TempProp.isFrozen ? modelColList.getModelByAlias(cache.UserView.colAlias).get('left') : 0;
			this.offsetLeft = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetLeft || 0) : 0;
			this.offsetTop = cache.TempProp.isFrozen ? (this.currentRule.displayPosition.offsetTop || 0) : 0;
		},
		/**
		 * 页面渲染方法
		 * @method render
		 */
		render: function() {
			this.changePosition();
			this.template = Handlebars.compile($('#tempSelectContainer').html());
			this.$el.html(this.template());
			this.triggerCallback();
			return this;
		},
		/**
		 * 更新显示视图大小，坐标
		 * @method changePosition
		 */
		changePosition: function() {
			var modelJSON = this.model.toJSON(),
				height = modelJSON.physicsBox.height,
				width = modelJSON.physicsBox.width,
				left = modelJSON.physicsPosi.left,
				top = modelJSON.physicsPosi.top;
			if (left === 0) {
				left = left - 1;
				width = width - 1;
			} else {
				width = width - 2;
			}
			if (top === 0) {
				top = top - 1;
				height = height - 1;
			} else {
				height = height - 2;
			}
			this.$el.css({
				width: width,
				height: height,
				left: left - this.offsetLeft - this.userViewLeft,
				top: top - this.offsetTop - this.userViewTop
			});
		},
		/**
		 * 绑定其他视图
		 * @method triggerCallback
		 */
		triggerCallback: function() {
			Backbone.trigger('call:cellsContainer', this.callView('viewCellsContainer'));
		},
		callView: function(name) {
			var object = this;
			return function(callback) {
				object[name] = callback;
			};
		},
		/**
		 * 视图销毁
		 * @method destroy
		 */
		destroy: function() {
			this.remove();
			this.viewCellsContainer.dataSoureRegionView = null;
		}
	});
	return DataSourceRegion;
});