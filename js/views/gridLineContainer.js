define(function(require) {
    'use strict';
    var $ = require('lib/jquery'),
        _ = require('lib/underscore'),
        Backbone = require('lib/backbone'),
        RowsGridContainer = require('views/rowsGridContainer'),
        ColsGridContainer = require('views/colsGridContainer');
    /**
     * GridLineContainer
     * @author ray wu
     * @since 0.1.0
     * @class GridLineContainer  
     * @module views
     * @extends Backbone.View
     * @constructor
     */
    var GridLineContainer = Backbone.View.extend({
        /**
         * @property {element} className
         */
        className: 'line-container',
        /**
         * 初始化函数
         * @method initialize
         */
        initialize: function() {

        },
        /**
         * 渲染本身对象
         * @method render
         * @return {object} 返回自身对象`this`
         */
        render: function() {
            this.rowsGridContainer = new RowsGridContainer();
            this.$el.append(this.rowsGridContainer.render().el);

            this.colsGridContainer = new ColsGridContainer();
            this.$el.append(this.colsGridContainer.render().el);
            return this;
        },
        /**
         * 视图销毁
         * @method destroy
         */
        destroy: function() {
            this.rowsGridContainer.destroy();
            this.colsGridContainer.destroy();
            this.remove();
        }
    });
    return GridLineContainer;
});