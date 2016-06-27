'use strict';
define(function() {
	var buildAlias = {
		buildColAlias: function(currentIndex) {
			var aliasCol = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
				displayText = '',
				remainder,
				divisible;

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
		},
		/**
		 * 生成行名称
		 * @method buildRowAlias
		 * @param  {int} 当前索引值
		 * @return {string} 当前显示的名称
		 */
		buildRowAlias: function(currentIndex) {
			return (currentIndex + 1).toString();
		}
	};
	return buildAlias;
});