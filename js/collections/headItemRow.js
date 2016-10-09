'use strict';
define(function(require) {
	var _ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
		config = require('spreadsheet/config'),
		cache = require('basic/tools/cache'),
		buildAlias = require('basic/tools/buildalias'),
		binary = require('basic/util/binary'),
		LineRowModel = require('models/lineRow'),
		selectRegions = require('collections/selectRegion'),
		HeadItemRows;
	/**
	 * 行模型集合类
	 * @author ray wu
	 * @since 0.1.0
	 * @class HeadItemRow 
	 * @module collections
	 * @extends Backbone.Collection
	 * @constructor
	 */
	HeadItemRows = Backbone.Collection.extend({
		/**
		 * 集合成员类型
		 * @property model 
		 * @type app.Models.LineRow
		 */
		model: LineRowModel,
		url: 'itemrow',
		/**
		 * 获取选中区域初始单元格行标
		 * @method getModelInitSelectRegion
		 * @return {app.Models.LineRow} LineRow对象
		 */
		getModelInitSelectRegion: function() {
			return this.models[selectRegions.models[0].toJSON().initPosi.startY];
		},
		/**
		 * 获取区域的所有列对象
		 * @method getModelListByIndex
		 * @return {Array} lineRow数组
		 */
		getModelListByIndex: function(startRowIndex, endRowIndex) {
			var i, modelList = [];
			for (i = startRowIndex; i < endRowIndex + 1; i++) {
				modelList.push(this.models[i]);
			}
			return modelList;
		},
		/**
		 * 获取选中区域的所有列对象
		 * @method getModelListByWholeSelectRegion
		 * @return {app.Models.LineRow} LineRow对象
		 */
		getModelListByWholeSelectRegion: function() {
			var modelList = [],
				selectRegion,
				between,
				startIndexRow,
				endIndexRow,
				i = 0;

			selectRegion = selectRegions.models[0];
			startIndexRow = selectRegion.get('wholePosi').startY;
			endIndexRow = selectRegion.get('wholePosi').endY;
			between = endIndexRow - startIndexRow + 1;
			for (; i < between; i++) {
				modelList.push(this.models[startIndexRow + i]);
			}
			return modelList;
		},
		getIndexByDisplayname: function(displayName) {
			return _.findIndex(this.toJSON(), {
				'displayName': displayName
			});
		},
		/**
		 * 获取整个列标容器宽度
		 * @method getMaxDistanceHeight
		 * @return {int} 高度
		 */
		getMaxDistanceHeight: function() {
			var currentModel = this.models[this.models.length - 1];
			return currentModel.get('top') + currentModel.get('height');
		},
		/**
		 * 通过别名查询符合条件标线的对象
		 * @method getModelByAlias
		 * @param  {alias} alias 别名
		 * @return {app.Models.LineCol} 对象
		 */
		getModelByAlias: function(alias) {
			return this.findWhere({
				'alias': alias
			});
		},
		/**
		 * 获取标线对象通过别名
		 * @method getModelByAlias
		 * @param  {alias} alias 别名
		 * @return {app.Models.LineRow} 对象
		 */
		getModelByPosition: function(posi) {
			var currentIndex = binary.newModelBinary(posi, this.models, 'top', 'height', 0, this.models.length - 1);
			return this.models[currentIndex];
		},
		getLastModel: function() {
			return this.models[this.length - 1];
		},
		/**
		 * 通过别名查询符合条件标线的索引
		 * @method getIndexByAlias
		 * @param  {alias} alias 别名
		 * @return {int} 索引
		 */
		getIndexByAlias: function(alias) {
			if (alias === 'MAX') {
				return 'MAX';
			} else {
				return _.findIndex(this.toJSON(), {
					'alias': alias
				});
			}
		},
		getNextAliasByAlias: function(alias) {
			var index,
				model;
			model = this.findWhere({
				'alias': alias
			});
			index = _.indexOf(this.models, model);
			return this.models[index + 1].get('alias');
		},
		/**
		 * 获取相邻标线的对象
		 * @method getNeighborModelByAlias
		 * @param  {alias} alias 别名
		 * @param {string} redirction 方向
		 * @return {app.Models.LineCol} 对象
		 */
		getNeighborModelByAlias: function(alias, redirction) {
			var modelList = this.models,
				len = modelList.length,
				currentIndex;
			//toward to right
			if (redirction === 'RIGHT') {
				currentIndex = this.getIndexByAlias(alias);
				if (currentIndex === len - 1) {
					return null;
				}
				return modelList[currentIndex + 1];
			}
			// toward to left
			if (redirction === 'LEFT') {
				currentIndex = this.getIndexByAlias(alias);
				if (currentIndex === 0) {
					return null;
				}
				return modelList[currentIndex - 1];
			}
			return null;
		},
		generate: function() {
			var lastModel = this.getLastModel(),
				model = new LineRowModel(),
				sort = lastModel.get('sort'),
				top;
			top = lastModel.get('top') + lastModel.get('height') + 1;
			model.set('top', top);
			model.set('alias', cache.aliasGenerator('row'));
			model.set('height', config.User.cellHeight);
			model.set('sort', sort + 1);
			model.set('displayName', buildAlias.buildRowAlias(sort + 1));
			this.add(model);
		}
	});
	return new HeadItemRows();
});