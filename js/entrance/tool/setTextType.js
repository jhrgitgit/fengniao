define(function(require) {
	'use strict';

	var $ = require('lib/jquery'),
		Backbone = require('lib/backbone'),
		send = require('basic/tools/send'),
		cells = require('collections/cells'),
		config = require('spreadsheet/config'),
		textTypeHandler;


	// var setTextType = function(sheetId, format, region) {
	// 	var tempValue;
	// 	if (format === 'number') {
	// 		tempValue = 'num';
	// 	} else if (format === 'time') {
	// 		tempValue = 'time';
	// 	} else {
	// 		tempValue = 'text';
	// 	}
	// 	sendRegion = common.regionOperation(sheetId, region, function(cell) {
	// 		cell.set('customProp.format', tempValue);
	// 	});
	// 	send.PackAjax({
	// 		url: 'text.htm?m=date_format',
	// 		data: JSON.stringify({
	// 			excelId: window.SPREADSHEET_AUTHENTIC_KEY,
	// 			sheetId: '1',
	// 			coordinate: {
	// 				startX: sendRegion.startColIndex,
	// 				startY: sendRegion.startRowIndex,
	// 				endX: sendRegion.endColIndex,
	// 				endY: sendRegion.endRowIndex
	// 			},
	// 			format: tempValue
	// 		})
	// 	});

	// };
	// return setTextType;
	textTypeHandler = {
		setText: function() {
			cells.operateCellByDisplayName('1', null, function(cell) {

			});
		},
		setNum: function(thousands, decimal) {
			var self=this,
				text;
			cells.operateCellByDisplayName('1', null, function(cell) {
				text = cell.get("content").texts;
				if (self.isNum(text)) {
					cell.set("customProp.format", "num");
					cell.set("customProp.decimal", decimal);
					cell.set("content.displayTexts", self.getFormatNumber(text, true, 4));
				}
			});
		},
		setDate: function() {

		},
		isNum: function(value) {
			var values,
				tail,
				head,
				reHead,
				reTail;

			values = value.split('.');
			if (values.length > 2) {
				return false;
			}
			if (values.length === 2) {
				if (values[1] === "" && values[0] === "") return false;
				tail = values[1];
				reTail = /^\d*$/g;
				if (!reTail.test(tail)) return false;
			}
			head = values[0];
			if (head.indexOf("+") === 0 || head.indexOf("-") === 0) {
				head = head.substring(1);
			}
			reHead = /^\d{1,3}(,\d{3})*$/g;
			if (!reHead.test(head) && isNaN(head)) {
				return false;
			}
			return true;
		},
		getFormatNumber: function(value, thousands, decimal) {
			var i = 0,
				len,
				head,
				heads,
				numList,
				remainder,
				tail = "",
				temp = "",
				sign = "", //正负号
				values;
			if (!this.isNum(value)) return value;
			values = value.split(".");
			head = values[0];
			//去除符号
			if ((head.indexOf("-") === 0 && (sign = "-")) || head.indexOf("+") === 0) {
				head = head.substring(1);
			}
			//输入数据已存在千分位，需要先去掉千分位
			if (head.indexOf(",") !== -1) {
				heads = head.split(",");
				head = "";
				for (temp in heads) {
					head += heads[temp];
				}
			}
			if (thousands === true) { //输出数据存在千分位
				len = Math.ceil(head.length / 3);
				remainder = head.length % 3 > 0 ? head.length % 3 : 3;
				temp = head;
				head = "";
				//ps:问题
				for (i = len - 1; i > -1; i--) {
					if (i === 0) {
						// remainder = remainder > 0 ? remainder : 3;
						head = temp.substring(0, remainder) + head;
					} else {
						head = "," + temp.substring(3 * (i - 1) + remainder, 3 * i + remainder) + head;
					}
				}
			}
			if (head === undefined || head === "") head = "0";
			if (decimal === undefined) decimal === 2;
			if (decimal > 0) {
				if (decimal > 30) decimal = 30;
				head += ".";
				if (values.length > 1) {
					tail = values[1];
				}
				if (tail.length >= decimal) {
					tail = tail.substring(0, decimal);
				} else {
					for (i = tail.length; i < decimal; i++) {
						tail += "0";
					}
				}
			}
			return sign + head + tail;
		},
		isDate: function(value) {
			var regularLine = /^\d{4}(-\d{1,2}(-\d{1,2})?)?$/,
				regularWord = /^\d{4}\u5e74(\d{1,2}\u6708(\d{1,2}\u65e5)?)?$/,
				year,
				month,
				day,
				len,
				date;
			if (!regularLine.test(value) && !regularWord.test(value)) {
				return false;
			}
			year = value.match(/\d{4}/)[0];

			month = value.match(/(-|\u5e74)\d{1,2}(-|\u6708)/);
			if (month !== null) {
				month = month[0].substring(1, month[0].length - 1);
			}
			day = value.match(/\d{1,2}\u65e5/);
			if (day !== null) {
				day = day[0].substring(0, day[0].length - 1);
			}

			date = new Date(year + "/" + (month || "01") + "/" + (day || "01"));
			var t = date.getFullYear();
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
			if (!isDate(value)) return value;
			year = value.match(/\d{4}/)[0];
			month = value.match(/(-|\u5e74)\d{1,2}(-|\u6708)/);
			if (month !== null) {
				month = month[0].substring(1, month[0].length - 1);
			} else {
				month = "01";
			}
			day = value.match(/\d{1,2}\u65e5/);
			if (day !== null) {
				day = day[0].substring(0, day[0].length - 1);
			} else {
				day = "01";
			}
			switch (formatType) {
				case config.dateFormatType.frist:
					result = year + '-' + month + '-' + day;
					break;
				case config.dateFormatType.second:
					result = year + '-' + month;
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
	};
	return textTypeHandler;
});