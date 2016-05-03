define(function(require) {
	var textTypeHandler = require('entrance/tool/settexttype');
	describe("文本类型转换校验", function() {
		it("数字合法性校验测试", function() {
			expect(textTypeHandler.isNum("123")).toEqual(true); //正确整数
			expect(textTypeHandler.isNum("123,123")).toEqual(true); //正确千分位整数
			expect(textTypeHandler.isNum("123.123")).toEqual(true); //正确浮点数
			expect(textTypeHandler.isNum("+123.123")).toEqual(true); //含有符号正确数字
			expect(textTypeHandler.isNum("-1")).toEqual(true); //正确负数
			expect(textTypeHandler.isNum(".001")).toEqual(true); //小数点开始
			expect(textTypeHandler.isNum("112.")).toEqual(true); //小数点结尾
			expect(textTypeHandler.isNum("")).toEqual(true); //空
			expect(textTypeHandler.isNum("345,123,123.00")).toEqual(true); //含千分位小数
			expect(textTypeHandler.isNum("123.-123")).toEqual(false); //小数点后数字含有符号
			expect(textTypeHandler.isNum("123.123.123")).toEqual(false); //小数点标记错误数字
			expect(textTypeHandler.isNum("12,3123.123")).toEqual(false); //千分位标记错误数字
			expect(textTypeHandler.isNum("123123.123,123")).toEqual(false); //千分位标记错误数字
			expect(textTypeHandler.isNum("@123")).toEqual(false); //含有特殊字符
			expect(textTypeHandler.isNum("AB")).toEqual(false); //含有字母

		});
		it("获取数字格式数据测试", function() {
			expect(textTypeHandler.getFormatNumber("123123", true, 0)).toEqual("123,123"); //整数增加千分位，不显示小数
			expect(textTypeHandler.getFormatNumber("12345678901234567", true, 0)).toEqual("12,345,678,901,234,567"); //长整数增加千分位，不显示小数
			expect(textTypeHandler.getFormatNumber("-123334.14423", true, 0)).toEqual("-123,334"); //浮点数增加千分位
			expect(textTypeHandler.getFormatNumber("+123334.14423", true, 0)).toEqual("123,334"); //含有加号数增加千分位
			expect(textTypeHandler.getFormatNumber("-78,654,321.123", false, 0)).toEqual("-78654321"); //负数已存在千分位数据，去掉千分位
			expect(textTypeHandler.getFormatNumber("", false, 0)).toEqual(""); //空字符，去掉千分位
			expect(textTypeHandler.getFormatNumber("", true, 0)).toEqual(""); //空字符，增加千分位
			expect(textTypeHandler.getFormatNumber("123123", true, 2)).toEqual("123,123.00"); //整数，显示2位小数
			expect(textTypeHandler.getFormatNumber("12345678901234567", true, 4)).toEqual("12,345,678,901,234,567.0000"); //长整数增加千分位，显示4小数
			expect(textTypeHandler.getFormatNumber("-123334.14423", true, 2)).toEqual("-123,334.14"); //浮点数5位小数变为2位
			expect(textTypeHandler.getFormatNumber("+123334.14423", true, 3)).toEqual("123,334.144"); //含有加号数增加千分位，显示3位小数
			expect(textTypeHandler.getFormatNumber("1,234.123", false, 0)).toEqual("1234"); //已存在千分位数据，去掉千分位,不显示小数
			expect(textTypeHandler.getFormatNumber("1,234.123", false, -1)).toEqual("1234.123"); //已存在千分位数据，去掉千分位,显示小数
			expect(textTypeHandler.getFormatNumber("", false, 2)).toEqual(""); //空字符，去掉千分位，显示2位小数：
			expect(textTypeHandler.getFormatNumber(".1", true, 2)).toEqual("0.10"); //左侧为空，增加千分位，显示2位小数
			expect(textTypeHandler.getFormatNumber("1.", true, 2)).toEqual("1.00"); // 右侧为空，增加千分位，显示2位小数
			expect(textTypeHandler.getFormatNumber(".", true, 2)).toEqual("."); //错误数据
		});
		it("日期合法性校验测试", function() {
			expect(textTypeHandler.isDate("2016")).toEqual(true);
			expect(textTypeHandler.isDate("2016-03")).toEqual(true);
			expect(textTypeHandler.isDate("2016-03-09")).toEqual(true);
			expect(textTypeHandler.isDate("1999年")).toEqual(true);
			expect(textTypeHandler.isDate("1999年01月11日")).toEqual(true);
			expect(textTypeHandler.isDate("2000年02月29日")).toEqual(true);
			expect(textTypeHandler.isDate("1999年01月11日")).toEqual(true);
			expect(textTypeHandler.isDate("1999年01月")).toEqual(true);
			expect(textTypeHandler.isDate("19999")).toEqual(false);
			expect(textTypeHandler.isDate("199A")).toEqual(false);
			expect(textTypeHandler.isDate("1999-")).toEqual(false);
			expect(textTypeHandler.isDate("1999-01-")).toEqual(false);
			expect(textTypeHandler.isDate("1999-01-111")).toEqual(false);
			expect(textTypeHandler.isDate("1999日")).toEqual(false);
			expect(textTypeHandler.isDate("1999年10")).toEqual(false);
			expect(textTypeHandler.isDate("2001年02月29日")).toEqual(false);
			expect(textTypeHandler.isDate("YYYY-MM-DD")).toEqual(false);
		});
		it("日期格式转换测试", function() {
			expect(textTypeHandler.getFormatDate("2001年02月29日", "yyyy-MM-dd")).toEqual("2001年02月29日");
			expect(textTypeHandler.getFormatDate("2016", "yyyy-MM-dd")).toEqual("2016-01-01");
			expect(textTypeHandler.getFormatDate("2016", "yyyy-MM")).toEqual("2016-01");
			expect(textTypeHandler.getFormatDate("2016", "yyyy")).toEqual("2016");
			expect(textTypeHandler.getFormatDate("2016", "yyyy年MM月dd日")).toEqual("2016年01月01日");
			expect(textTypeHandler.getFormatDate("2016", "yyyy年MM月")).toEqual("2016年01月");
			expect(textTypeHandler.getFormatDate("2016", "yyyy年")).toEqual("2016年");
			expect(textTypeHandler.getFormatDate("2016-01-01", "yyyy年MM月dd日")).toEqual("2016年01月01日");
			expect(textTypeHandler.getFormatDate("2016-01-01", "yyyy年MM月")).toEqual("2016年01月");
			expect(textTypeHandler.getFormatDate("2016-01-01", "yyyy年")).toEqual("2016年");
			expect(textTypeHandler.getFormatDate("2016年10月11日", "yyyy-MM-dd")).toEqual("2016-10-11");
			expect(textTypeHandler.getFormatDate("2016年10月11日", "yyyy-MM")).toEqual("2016-10");
			expect(textTypeHandler.getFormatDate("2016年10月11日", "yyyy")).toEqual("2016");
		});
		it("货币格式校验测试", function() {
			expect(textTypeHandler.isCoin("123")).toEqual(true);
			expect(textTypeHandler.isCoin("¥123")).toEqual(true);
			expect(textTypeHandler.isCoin("¥@123")).toEqual(false);
			expect(textTypeHandler.isCoin("￥123")).toEqual(false);
		});
		it("货币格式转换测试", function() {
			expect(textTypeHandler.getFormatCoin("1234",2)).toEqual("¥1,234.00");
			expect(textTypeHandler.getFormatCoin("123",2)).toEqual("¥123.00");
			expect(textTypeHandler.getFormatCoin("¥1234",2)).toEqual("¥1,234.00");
			expect(textTypeHandler.getFormatCoin("¥@123",2)).toEqual("¥@123");
			expect(textTypeHandler.getFormatCoin("$123",2)).toEqual("$123");
		});
		it("百分比格式校验测试", function() {
			expect(textTypeHandler.isPercent("123")).toEqual(true);
			expect(textTypeHandler.isPercent("123%")).toEqual(true);
			expect(textTypeHandler.isPercent("%123.001%")).toEqual(false);
			expect(textTypeHandler.isPercent("¥123")).toEqual(false);
			expect(textTypeHandler.isPercent("¥@123")).toEqual(false);
			expect(textTypeHandler.isPercent("￥123")).toEqual(false);
		});
		it("百分比格式转化测试", function() {
			expect(textTypeHandler.getFormatPercent("123",2)).toEqual("12300.00%");
			expect(textTypeHandler.getFormatPercent("123%",5)).toEqual("123.00000%");
			expect(textTypeHandler.getFormatPercent("%123.001%")).toEqual("%123.001%");
			expect(textTypeHandler.getFormatPercent("¥123")).toEqual("¥123");
		});

	});
});