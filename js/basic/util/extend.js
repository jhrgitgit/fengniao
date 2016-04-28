'use strict';
define(function() {
	var extend = function() {
		var target,
			options,
			name,
			deep,
			src,
			copy,
			len,
			clone,
			i = 1;

		target = arguments[0];
		len = arguments.length;
		if (typeof(target) === 'boolean') {
			deep = target;
			target = arguments[i];
			i++;
		}
		if (typeof(target) !== 'object' && typeof(target) !== 'function') {
			target = {};
		}
		for (; i < len; i++) {
			if ((options = arguments[i]) !== null && options !== undefined) {
				for (name in options) {
					src = target[name];
					copy = options[name];
					if (copy && deep && (typeof(copy) === 'object')) {
						if (copy instanceof Array) {
							clone = src && src instanceof Array ? src : [];
						} else {
							clone = src && typeof(src) ? src : {};
						}
						target[name] = extend(deep, clone, copy);
					} else {
						target[name] = copy;
					}

				}
			}
		}
		return target;
	};
	return extend;
});