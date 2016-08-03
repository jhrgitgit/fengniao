'use strict';
define(function(require) {
	var $ = require('lib/jquery');
	return {
		getTextHeight: function(text, wordWrap, fontSize, width) {
			var tempDiv,
				height,
				inputText = '',
				texts,
				i = 0,
				len;
			texts = text.split('\n');
			len = texts.length;
			for (; i < len; i++) {
				inputText += (texts[i] + '<br>');
			}
			tempDiv = $('<div/>').html(inputText);
			tempDiv.css({
				'visibility': 'hidden',
				'font-size': fontSize + 'pt'
			});
			if (wordWrap === true || width !== undefined) {
				tempDiv.css({
					'word-wrap': 'break-word',
					'width': width
				});
			}
			$('body').append(tempDiv);
			height = parseInt(tempDiv.height());
			tempDiv.remove();
			return height;
		},
		getTextWidth: function(text, fontSize) {
			var tempDiv,
				tempDiv = $('<div/>').html(text),
				currentWidth;
			tempDiv.css({
				"display": "none",
				"font-size": fontSize + 'pt'
			});
			$('body').append(tempDiv);
			currentWidth = parseInt(tempDiv.width());
			tempDiv.remove();
			return currentWidth;
		}
	};
});