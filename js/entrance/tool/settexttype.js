'use strict';
define(function(require) {
	var send = require('basic/tools/send'),
		cells = require('collections/cells'),
		config = require('spreadsheet/config'),
		getOperRegion = require('basic/tools/getoperregion'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		selectRegions = require('collections/selectRegion'),
		analysisLabel = require('basic/tools/analysislabel'),
		rowOperate = require('entrance/row/rowoperation'),
		colOperate = require('entrance/col/coloperation'),
		cache = require('basic/tools/cache'),
		textTypeHandler;

	textTypeHandler = {
		/**
		 * 自动识别类型：识别常规类型与日期类型,只有在用户输入与复制操作时，进行识别
		 * @return {string} 返回识别后，格式化类型
		 */
		textTypeRecognize: function(model) {
			var text = model.get('content').texts,
				format = model.get('customProp').format,
				decimal;

			if (format === 'normal' && this.isDate(text)) {
				model.set('customProp.dateFormat', this.getDateFormat(text));
				model.set('customProp.format', 'date');
			}

			if (format === 'normal' && this.isNum(text) && text.indexOf(',') === -1) {
				decimal = this.getNoZeroDecimal(text);
				text = this.getFormatNumber(text, false, decimal);
				model.set('content.texts', text);
			}
			return text;
		},
		setNormal: function(sheetId, label) {
			var clip,
				region,
				operRegion,
				sendRegion;

			clip = selectRegions.getModelByType('clip')[0];
			if (clip !== undefined) {
				cache.clipState = 'null';
				clip.destroy();
			}
			region = getOperRegion(label);
			operRegion = region.operRegion;
			sendRegion = region.sendRegion;
			if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
				this.sendData('normal', null, null, null, null, sendRegion);
				return;
			}

			//后期修改，多次设置属性，造成效率低下
			if (region.endColIndex === 'MAX') { //整行操作
				//整列操作优化
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.format', 'normal');
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.isValid', true);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.decimal', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.thousands', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.dateFormat', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.currencySign', null);
			} else if (region.endRowIndex === 'MAX') {
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.format', 'normal');
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.isValid', true);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.decimal', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.thousands', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.dateFormat', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.currencySign', null);
			} else {
				cells.operateCellsByRegion(operRegion, function(cell) {
					text = cell.get('content').texts;
					cell.set('customProp.format', 'normal');
					cell.set('customProp.isValid', true);
					cell.set('customProp.decimal', null);
					cell.set('customProp.thousands', null);
					cell.set('customProp.dateFormat', null);
					cell.set('customProp.currencySign', null);
				});
			}

			this.sendData('normal', null, null, null, null, sendRegion);
		},
		setText: function(sheetId, label) {
			var text,
				clip,
				region,
				operRegion,
				sendRegion;

			clip = selectRegions.getModelByType('clip')[0];
			if (clip !== undefined) {
				cache.clipState = 'null';
				clip.destroy();
			}
			region = getOperRegion(label);
			operRegion = region.operRegion;
			sendRegion = region.sendRegion;
			if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
				this.sendData('text', null, null, null, null, sendRegion);
				return;
			}
			if (operRegion.endColIndex === 'MAX') { //整行操作
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.format', 'text');
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.isValid', true);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.decimal', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.thousands', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.dateFormat', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.currencySign', null);
			} else if (operRegion.endRowIndex === 'MAX') {
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.format', 'text');
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.isValid', true);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.decimal', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.thousands', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.dateFormat', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.currencySign', null);
			} else {
				cells.operateCellsByRegion(operRegion, function(cell) {
					text = cell.get('content').texts;
					cell.set('customProp.format', 'text');
					cell.set('customProp.isValid', true);
					cell.set('customProp.decimal', null);
					cell.set('customProp.thousands', null);
					cell.set('customProp.dateFormat', null);
					cell.set('customProp.currencySign', null);
				});
			}

			this.sendData('text', null, null, null, null, sendRegion);
		},
		setNum: function(sheetId, thousands, decimal, label) {
			var text,
				isValid,
				self,
				clip,
				region,
				operRegion,
				sendRegion;

			clip = selectRegions.getModelByType('clip')[0];
			if (clip !== undefined) {
				cache.clipState = 'null';
				clip.destroy();
			}
			self = this;
			region = getOperRegion(label);
			operRegion = region.operRegion;
			sendRegion = region.sendRegion;
			if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
				this.sendData('text', null, null, null, null, sendRegion);
				return;
			}
			if (operRegion.endColIndex === 'MAX') { //整行操作
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.format', 'number');
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.decimal', decimal);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.thousands', thousands);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.dateFormat', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.currencySign', null);
			} else if (operRegion.endRowIndex === 'MAX') { //整行操作
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.format', 'number');
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.decimal', decimal);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.thousands', thousands);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.dateFormat', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.currencySign', null);
			} else {
				cells.operateCellsByRegion(operRegion, function(cell) {
					text = cell.get('content').texts;
					isValid = self.isNum(text);
					cell.set('customProp.format', 'number');
					cell.set('customProp.isValid', isValid);
					cell.set('customProp.decimal', decimal);
					cell.set('customProp.thousands', thousands);
					cell.set('customProp.dateFormat', null);
					cell.set('customProp.currencySign', null);
				});
			}
			this.sendData('number', decimal, thousands, null, null, sendRegion);
		},
		setDate: function(sheetId, dateFormat, label) {
			var self,
				text,
				isValid,
				clip,
				region,
				operRegion,
				sendRegion;

			clip = selectRegions.getModelByType('clip')[0];
			if (clip !== undefined) {
				cache.clipState = 'null';
				clip.destroy();
			}
			region = getOperRegion(label);
			operRegion = region.operRegion;
			sendRegion = region.sendRegion;
			self = this;
			if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
				this.sendData('date', null, null, dateFormat, null, sendRegion);
				return;
			}
			if (operRegion.endColIndex === 'MAX') { //整行操作
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.format', 'number');
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.decimal', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.thousands', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.dateFormat', dateFormat);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.currencySign', null);
			} else if (operRegion.endRowIndex === 'MAX') { //整列操作
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.format', 'number');
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.decimal', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.thousands', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.dateFormat', dateFormat);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.currencySign', null);
			} else {
				cells.operateCellsByRegion(operRegion, function(cell) {
					text = cell.get('content').texts;
					isValid = self.isDate(text);
					cell.set('customProp.format', 'date');
					cell.set('customProp.isValid', isValid);
					cell.set('customProp.decimal', null);
					cell.set('customProp.thousands', null);
					cell.set('customProp.dateFormat', dateFormat);
					cell.set('customProp.currencySign', null);
				});
			}
			this.sendData('date', null, null, dateFormat, null, sendRegion);
		},
		setPercent: function(sheetId, decimal, label) {
			var self,
				text,
				isValid,
				clip,
				region,
				operRegion,
				sendRegion;

			clip = selectRegions.getModelByType('clip')[0];
			if (clip !== undefined) {
				cache.clipState = 'null';
				clip.destroy();
			}
			region = getOperRegion(label);
			operRegion = region.operRegion;
			sendRegion = region.sendRegion;
			self = this;
			if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
				this.sendData('percent', decimal, false, null, null, sendRegion);
				return;
			}
			if (operRegion.endColIndex === 'MAX') { //整行操作
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.format', 'percent');
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.decimal', decimal);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.thousands', false);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.dateFormat', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.currencySign', null);
			} else if (operRegion.endRowIndex === 'MAX') { //整行操作
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.format', 'percent');
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.decimal', decimal);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.thousands', false);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.dateFormat', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.currencySign', null);
			} else {
				cells.operateCellsByRegion(operRegion, function(cell) {
					text = cell.get('content').texts;
					isValid = self.isPercent(text);
					cell.set('customProp.format', 'percent');
					//存在问题
					cell.set('customProp.isValid', isValid);
					cell.set('customProp.decimal', decimal);
					cell.set('customProp.thousands', false);
					cell.set('customProp.dateFormat', null);
					cell.set('customProp.currencySign', null);
				});
			}
			this.sendData('percent', decimal, false, null, null, sendRegion);
		},

		setCoin: function(sheetId, decimal, sign, label) {
			var clip,
				self,
				text,
				isValid,
				region,
				operRegion,
				sendRegion;

			clip = selectRegions.getModelByType('clip')[0];
			if (clip !== undefined) {
				cache.clipState = 'null';
				clip.destroy();
			}
			region = getOperRegion(label);
			operRegion = region.operRegion;
			sendRegion = region.sendRegion;
			self = this;
			if (operRegion.startColIndex === -1 || operRegion.startRowIndex === -1) {
				this.sendData('currency', decimal, true, null, sign, sendRegion);
				return;
			}
			if (operRegion.endColIndex === 'MAX') { //整行操作
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.format', 'currency');
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.decimal', decimal);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.thousands', true);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.dateFormat', null);
				rowOperate.rowPropOper(operRegion.startRowIndex, 'customProp.currencySign', sign);
			} else if (operRegion.endRowIndex === 'MAX') { //整行操作
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.format', 'currency');
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.decimal', decimal);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.thousands', true);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.dateFormat', null);
				colOperate.colPropOper(operRegion.startColIndex, 'customProp.currencySign', sign);
			} else {
				cells.operateCellsByRegion(operRegion, function(cell) {
					text = cell.get('content').texts;
					isValid = self.isCoin(text);
					cell.set('customProp.format', 'currency');
					cell.set('customProp.isValid', isValid);
					cell.set('customProp.decimal', decimal);
					cell.set('customProp.thousands', true);
					cell.set('customProp.dateFormat', null);
					cell.set('customProp.currencySign', sign);
				});
			}
			this.sendData('currency', decimal, true, null, sign, sendRegion);
		},
		sendData: function(format, decimal, thousands, dateFormat, currencySign, sendRegion) {
			var data;
			data = {
				excelId: window.SPREADSHEET_AUTHENTIC_KEY,
				sheetId: '1',
				coordinate: sendRegion,
				format: format
			};
			switch (format) {
				case 'number':
					data.decimalPoint = decimal || 0;
					data.thousandPoint = thousands || false;
					break;
				case 'date':
					data.dateFormat = dateFormat || '';
					break;
				case 'currency':
					data.decimalPoint = decimal || 0;
					data.currencySymbol = currencySign;
					break;
				case 'percent':
					data.decimalPoint = decimal || 0;
					break;
			}
			send.PackAjax({
				url: 'text.htm?m=data_format',
				data: JSON.stringify(data)
			});
		},
		isNum: function(value) {
			var values,
				tail,
				head,
				reHead,
				reTail;

			if (value === '') {
				return false;
			}
			values = value.split('.');
			if (values.length > 2) {
				return false;
			}
			if (values.length === 2) {
				if (values[1] === '' && values[0] === '') {
					return false;
				}
				tail = values[1];
				reTail = /^\d*$/g;
				if (!reTail.test(tail)) {
					return false;
				}
			}
			head = values[0];
			if (head.indexOf('+') === 0 || head.indexOf('-') === 0) {
				head = head.substring(1);
			}
			reHead = /^\d{1,3}(,\d{3})*$/g;
			if (!reHead.test(head) && !/^\d+$/.test(head)) {
				return false;
			}
			return true;
		},
		getNoZeroDecimal: function(value) {
			var i, j,
				tail,
				values;
			if (!this.isNum(value)) {
				return 0;
			}
			values = value.split('.');
			if (values.length < 2) {
				return 0;
			}
			tail = values[1];
			i = tail.length;
			for (j = i - 1; j > -1; j--) {
				if (tail.charAt(j) === '0') {
					i--;
				} else {
					break;
				}
			}
			return i;
		},
		getFormatNumber: function(value, thousands, decimal) {
			var i = 0,
				len,
				head,
				heads,
				remainder,
				tail = '',
				temp = '',
				sign = '', //正负号
				tailZeroCache = '', //小数位开始0的个数
				values;
			if (!this.isNum(value) || value === '') {
				return value;
			}
			values = value.split('.');
			head = values[0];
			//去除符号
			if ((head.indexOf('-') === 0 && (sign = '-')) || head.indexOf('+') === 0) {
				head = head.substring(1);
			}
			//输入数据已存在千分位，需要先去掉千分位
			if (head.indexOf(',') !== -1) {
				heads = head.split(',');
				head = '';
				for (temp in heads) {
					head += heads[temp];
				}
			}
			if (thousands === true) { //输出数据存在千分位
				len = Math.ceil(head.length / 3);
				remainder = head.length % 3 > 0 ? head.length % 3 : 3;
				temp = head;
				head = '';
				for (i = len - 1; i > -1; i--) {
					if (i === 0) {
						// remainder = remainder > 0 ? remainder : 3;
						head = temp.substring(0, remainder) + head;
					} else {
						head = ',' + temp.substring(3 * (i - 1) + remainder, 3 * i + remainder) + head;
					}
				}
			}
			if (head === undefined || head === '') {
				head = '0';
			}
			while (head.indexOf('0') === 0 && head.length > 1) {
				head = head.substring(1);
			}
			if (decimal === undefined) {
				decimal === 2;
			}
			if (decimal > 0) {
				if (decimal > 30) {
					decimal = 30;
				}
				head += '.';
				if (values.length > 1) {
					tail = values[1];
				}
				if (tail.length > decimal) {
					tail = tail.substring(0, decimal + 1);
					//缓存开头的0
					while (tail.indexOf('0') === 0) {
						tail = tail.substring(1);
						tailZeroCache += '0';
					}
					tail = Math.round(parseInt(tail) / 10).toString();
					tail = tailZeroCache + tail;
				} else {
					for (i = tail.length; i < decimal; i++) {
						tail += '0';
					}
				}
			}
			if (decimal < 0 && values.length > 1) {
				head += '.';
				tail = values[1];
			}
			return sign + head + tail;
		},
		isDate: function(value) {
			var regularLine = /^\d{4}\/\d{1,2}\/\d{1,2}$/,
				regularWord = /^\d{4}\u5e74\d{1,2}\u6708(\d{1,2}\u65e5)?$/,
				year,
				month,
				day,
				date;
			if (value === '') {
				return false;
			}
			if (!regularLine.test(value) && !regularWord.test(value)) {
				return false;
			}
			year = value.match(/\d{4}/)[0];
			month = value.match(/(\/|\u5e74)\d{1,2}(\/|\u6708)/);
			if (month !== null) {
				month = month[0].substring(1, month[0].length - 1);
			}
			day = value.match(/\d{1,2}\u65e5/);

			if (day === null) {
				day = value.match(/\d{1,2}$/);
			}
			if (day !== null) {
				day = day[0].substring(0, day[0].length);
			}
			if (day !== null && day.indexOf('日') !== -1) {
				day = day.substring(0, day.length - 1);
			}

			date = new Date(year + '/' + (month || '01') + '/' + (day || '01'));
			if (parseInt(year) !== date.getFullYear()) {
				return false;
			}
			if (month !== null && parseInt(month) !== date.getMonth() + 1) {
				return false;
			}
			if (day !== null && parseInt(day) !== date.getDate()) {
				return false;
			}
			return true;
		},
		getFormatDate: function(value, formatType) {
			var year,
				month,
				day,
				result;
			if (!this.isDate(value) || value === '') {
				return value;
			}
			year = value.match(/\d{4}/)[0];
			month = value.match(/(\/|\u5e74)\d{1,2}(\/|\u6708)/);
			if (month !== null) {
				month = month[0].substring(1, month[0].length - 1);
			} else {
				month = '01';
			}
			day = value.match(/\d{1,2}\u65e5/);
			if (day === null) {
				day = value.match(/\d{1,2}$/);
			}
			if (day !== null) {
				day = day[0].substring(0, day[0].length);
			}
			if (day !== null && day.indexOf('日') !== -1) {
				day = day.substring(0, day.length - 1);
			}
			if (day === null) {
				day = '01';
			}
			switch (formatType) {
				case config.dateFormatType.frist:
					result = year + '/' + month + '/' + day;
					break;
				case config.dateFormatType.second:
					result = year + '/' + month;
					break;
				case config.dateFormatType.third:
					result = year;
					break;
				case config.dateFormatType.fourth:
					result = year + '年' + month + '月' + day + '日';
					break;
				case config.dateFormatType.fifth:
					result = year + '年' + month + '月';
					break;
				case config.dateFormatType.sixth:
					result = year + '年';
					break;
				default:
					result = value;
					break;
			}
			return result;
		},
		/**
		 * 获取日期格式类型
		 * @return {[type]} [description]
		 */
		getDateFormat: function(value) {
			var regular1 = /^\d{4}\/\d{1,2}\/\d{1,2}$/, // 1999/01/01
				regular2 = /^\d{4}\u5e74\d{1,2}\u6708$/, // 1999年1月
				regular3 = /^\d{4}\u5e74\d{1,2}\u6708\d{1,2}\u65e5$/; // 1999年1月1日
			if (regular1.test(value)) {
				return config.dateFormatType.frist;
			}
			if (regular2.test(value)) {
				return config.dateFormatType.fifth;
			}
			if (regular3.test(value)) {
				return config.dateFormatType.fourth;
			}
			return null;
		},
		isCoin: function(value) {
			if (value.charAt(0) === '¥' || value.charAt(0) === '$') {
				value = value.substring(1, value.length);
			}
			return this.isNum(value);
		},
		getFormatCoin: function(value, decimal, sign) {
			var temp = value,
				result;
			if (value === '') {
				return value;
			}
			if (this.isCoin(value)) {
				if (value.charAt(0) === '¥' || value.charAt(0) === '$') {
					value = value.substring(1, value.length);
				}
				result = sign + this.getFormatNumber(value, true, decimal);
				return result;
			}
			return temp;
		},
		isPercent: function(value) {
			if (value.charAt(value.length - 1) === '%') {
				value = value.substring(0, value.length - 1);
			}
			return this.isNum(value);
		},
		getFormatPercent: function(value, decimal) {
			var temp = value;
			if (value === '') {
				return value;
			}
			if (value.charAt(value.length - 1) === '%') {
				value = value.substring(0, value.length - 1);
				if (this.isNum(value)) {
					value = this.getFormatNumber(value, false, decimal);
					return value + '%';
				}
			} else {
				if (this.isNum(value)) {
					value = (Number(value) * 100).toString();
					value = this.getFormatNumber(value, false, decimal);
					return value + '%';
				}
			}

			return temp;
		}
	};
	return textTypeHandler;
});