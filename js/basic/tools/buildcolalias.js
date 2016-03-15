define(function() {
	'use strict';
	var buildColAlias = function(currentIndex) {
		var aliasCol = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
			displayText = '',
			remainder,
			divisible,
			temp = 0;

		remainder = currentIndex % aliasCol.length;
		divisible = Math.floor(currentIndex / aliasCol.length);
		displayText = aliasCol[remainder] + displayText;
		while (divisible > 0) {
			currentIndex = divisible - 1;
			remainder = currentIndex % aliasCol.length;
			divisible = Math.floor(currentIndex / aliasCol.length);
			displayText = aliasCol[remainder] + displayText;
		}
		return displayText;
	};
	return buildColAlias;
});