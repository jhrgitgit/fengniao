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
				'font-size': fontSize,
			});
			if (wordWrap === true) {
				tempDiv.css({
					'word-wrap': 'break-word',
					'width': width
				});
			}
			$('body').append(tempDiv);

			tempDiv.remove();
			return height;
		}
	};
});
