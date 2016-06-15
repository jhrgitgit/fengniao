'use strict';
define(function(require) {
	
	
	var SpreadSheet = require('spreadsheet/spreadsheet');
	new SpreadSheet();

	var $ = require('lib/jquery');
	var Backbone = require('lib/backbone');
	
	$('#test1').click(function(){
		Backbone.trigger('event:InputContainer:show');
	});
	$('#test2').click(function(){
		Backbone.trigger('event:InputContainer:hide');
	});
	//测试分支提交
	// $(document).on('click','#test',function(){
		// ss.setFillColor('','rgb(127, 127, 127)',['B6','C7']);
		// ss.setFillColor('','rgb(127, 127, 127)','D6');
		// ss.setFillColor('','rgb(127, 127, 127)','5');
		
		// ss.setFontFamily('','楷体', ['E8','F9']);
		// ss.setFontFamily('','楷体', 'E10');
		// ss.setFontFamily('','楷体', '11');

		// ss.setFontFamilySize('','16', ['E8','F9']);
		// ss.setFontFamilySize('','16', 'E10');
		// ss.setFontFamilySize('','16', '11');
		

		// ss.setFontWeight('','bold',['B6','C7']);
		// ss.setFontWeight('','bold','D6');
		// ss.setFontWeight('','bold','5');

		// ss.setFontStyle('','italic',['B6','C7']);
		// ss.setFontStyle('','italic','D6');
		// ss.setFontStyle('','italic','5');

		// ss.setCellBorder('','all',['B6','C7']);
		// ss.setCellBorder('','all','D6');
		// ss.setCellBorder('','all','5');

		// ss.setFontColor('','rgb(100, 0, 0)',['B6','C7']);
		// ss.setFontColor('','rgb(100, 0, 0)','D6');
		// ss.setFontColor('','rgb(100, 0, 0)','5');


		// ss.setAlign('','center',['B6','C7']);
		// ss.setAlign('','center','D6');
		// ss.setAlign('','center','5');

		// ss.setAlign('','middel',['B6','C7']);
		// ss.setAlign('','middel','D6');
		// ss.setAlign('','middel','5');


		// ss.setType.setText('','1');
		// ss.setType.setText('',['B1','B2']);
		// ss.setType.setText('','B3');

		// ss.setType.setNum('',true,3,'1');
		// ss.setType.setNum('',true,3,['B1','B2']);
		// ss.setType.setNum('',true,3,'B3');

		//ps:增加测试
		//
		// Backbone.trigger('event:cellsContainer:adaptSelectRegion');
	// });

});