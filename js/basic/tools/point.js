'use strict';
define(function() {

	var Point = function(config) {
		var regCol = /^[A-Z]+$/,
			regRow = /^[1-9]+[0-9]*$/;

		if ((typeof config) !== 'object') {
			throw new Error('Parameter format error');
		}
		this.startCol = config.startCol;
		this.startRow = config.startRow;
		this.endCol = config.endCol || config.startCol;
		this.endRow = config.endRow || config.startRow;
		this.success = config.success;
		this.error = config.error;
		//校验
		if (this.startRow === undefined && this.startCol === undefined) {
			throw new Error('Parameter format error');
		}
		if (this.startCol !== undefined && !regCol.test(this.startCol)) {
			throw new Error('Parameter format error');
		}
		if (this.startRow !== undefined && !regRow.test(this.startRow)) {
			throw new Error('Parameter format error');
		}
		if (this.endCol !== undefined && !regCol.test(this.endCol)) {
			throw new Error('Parameter format error');
		}
		if (this.endRow !== undefined && !regRow.test(this.endRow)) {
			throw new Error('Parameter format error');
		}
		if (!this.success && (typeof this.success) === 'function') {
			throw new Error('Parameter format error');
		}
		if (!this.error && (typeof this.error) === 'function') {
			throw new Error('Parameter format error');
		}
		//需要增加整行整列操作的校验
	};
	return Point;
});