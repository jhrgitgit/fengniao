/**
 * getScrollbarWidth basic对象
 * @author ray wu
 * @module basic
 * @submodule basic-getScrollbarWidth
 * @since 1.0.0
 * @main basic
 */
'use strict';
define(function() {
	return {
		/**
		 * @method getScrollbarWidth
		 * @deprecated 已经被移植到bodyContainer
		 * 
		 */
		getScrollbarWidth: function() {
			var virtualObj, scrollNone, scrollExist;
			virtualObj = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>');
			$('body').append(virtualObj);
			scrollNone = $('div', virtualObj).innerWidth();
			virtualObj.css('overflow-y', 'auto');
			scrollExist = $('div', virtualObj).innerWidth();
			$(virtualObj).remove();
			return (scrollNone - scrollExist);
		}
	};
})();