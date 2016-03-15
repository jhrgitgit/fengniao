define(function(require) {
	'use strict';
	var cache = require('basic/tools/cache'),
		listenerList = cache.listenerList,
		listener;

	listener = {
		addEventListener: function(event, callback ) {
			var key;
			if (event.indexOf('on') !== 0) event = 'on' + event;

			listenerList = listenerList || {};
			listenerList[event] = listenerList[event] || {};

			if (callback.listener === undefined) {
				callback.listener = [];
			}
			if (typeof callback === 'function') {
				key = Object.getOwnPropertyNames(listenerList[event]).length;
				callback.listener.push(key);
				listenerList[event][key] = callback;
			}
		},
		removeEventListener: function(event, callback) {
			if (event.indexOf('on') !== 0) event = 'on' + event;
			if (callback === undefined) {
				delete listenerList[event];
				return;
			}
			if (callback.listener !== undefined && listenerList[event] !== undefined) {
				for (var key in callback.listener) {
					if (listenerList[event][key] !== undefined) delete listenerList[event][key];
				}
			}

		},
		excute: function(event, e) {
			if (event.indexOf('on') !== 0) event = 'on' + event;
			if (listenerList[event] !== undefined) {
				for (var i in listenerList[event]) {
					listenerList[event][i](e);
				}
			}
		}
	};
	return listener;
});