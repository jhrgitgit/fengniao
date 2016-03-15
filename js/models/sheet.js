define(function(require) {
    'use strict';
    var Backbone = require('lib/backbone'),
        BackboneNest = require('lib/backbone.nested'),
        SheetModel;
    SheetModel = Backbone.Model.extend({
        defaults: {
            name: 'book',
            sort: 0
        }
    });
    return SheetModel;
});