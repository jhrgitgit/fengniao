define(function(require) {
	'use strict';
	var _ = require('lib/underscore'),
		Backbone = require('lib/backbone'),
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
			var model = this.findWhere({
				'displayName': displayName
			});
			return _.indexOf(this.models, model);
		},
		/**
		 * @deprecated 因为废弃了索引的方式，进行查询，所以该方法过时了
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
		 * 获取整个列标容器宽度
		 * @method getMaxDistanceHeight
		 * @return {int} 高度
		 */
		getMaxDistanceHeight: function() {
			var currentModel = this.models[this.models.length - 1];
			return currentModel.get('top') + currentModel.get('height');
		},
		/**
		 * 通过别名查询符合条件标线的索引
		 * @method getIndexByAlias
		 * @param  {alias} alias 别名
		 * @return {int} 索引
		 */
		getIndexByAlias: function(alias) {
			var model = this.findWhere({
				'alias': alias
			});
			return _.indexOf(this.models, model);
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
		}
	});
	return new HeadItemRows();
});