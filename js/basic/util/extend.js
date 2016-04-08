define(function(require) {
	'use strict';
	var extend = function(options) {
		var target = this,
			name;
		if (options !== undefined && typeof(options) === "object") {
			for (name in options) {
				target[name] = options;
			}
		}
	};
	return extend;
});