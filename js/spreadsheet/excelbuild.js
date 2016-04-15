define(function(require) {
	'use strict';

	var original = require('basic/tools/original'),
		domloader = require('basic/tools/template'),
		listener = require('basic/util/listener'),
		extend = require('basic/util/extend'),
		setFontColor = require('entrance/tool/setFontColor'),
		setFillColor = require('entrance/tool/setFillColor'),
		setFontFamily = require('entrance/tool/setFontFamily'),
		setCellHeight = require('entrance/cell/setCellHeight'),
		setCellWidth = require('entrance/cell/setCellWidth'),
		selectCell = require('entrance/cell/selectCell'),
		mergeCell = require('entrance/tool/mergeCell'),
		splitCell = require('entrance/tool/splitCell'),
		setCellContent = require('entrance/tool/setCellContent'),
		selectCellCols = require('entrance/cell/selectCellCols'),
		selectCellRows = require('entrance/cell/selectCellRows'),
		setCellBorder = require('entrance/tool/setCellBorder'),
		setFontFamilySize = require('entrance/tool/setFontFamilySize'),
		setFontWeight = require('entrance/tool/setFontWeight'),
		setFontStyle = require('entrance/tool/setFontStyle'),
		setFrozen = require('entrance/sheet/setFrozen'),
		setAlign = require('entrance/tool/setAlign'),
		setTextType = require('entrance/tool/setTextType'),
		operationDataSourceRegion = require('entrance/selectregion/dataSourceRegionOperation'),
		getPointByPosi = require('entrance/sheet/getPointByPosi'),
		setWordWrap = require('entrance/tool/setWordWrap'),
		getTextByCoordinate = require('entrance/cell/getTextByCoordinate'),
		adaptScreen = require('entrance/sheet/adaptScreen'),
		getFrozenState = require('entrance/sheet/getFrozenState'),
		getSelectRegion = require('entrance/sheet/getSelectRegion'),
		highlight = require('entrance/extention/highlight'),
		reloadCells = require('entrance/cell/reloadCells');



	var excelBuild = {
		buildDom: function(id) {
			domloader(id);
		},
		buildExcelOriginalData: function() {
			original.restoreExcel();
		},
		buildExcelView: function(id) {
			var Screen = require('views/screen');
			new Screen();
		},
		buildExcelToolbar: function() {
			var ShearPlateContainer = require('widgets/clipboard/shearPlateContainer'),
				FontFamilyContainer = require('widgets/font/fontFamilyContainer'),
				FontSizeContainer = require('widgets/font/fontSizeContainer'),
				BorderContainer = require('widgets/celloperation/borderContainer'),
				FillColorContainer = require('widgets/celloperation/fillColorContainer'),
				FontColorContainer = require('widgets/font/fontColorContainer'),
				ContentAlignContainer = require('widgets/align/contentAlignContainer'),
				TextFormatContainer = require('widgets/cellformat/textFormatContainer'),
				MergeCellContainer = require('widgets/celloperation/mergeCellContainer'),
				ContentFontContainer = require('widgets/font/contentFontContainer'),
				FrozenContainer = require('widgets/frozen/frozenContainer');
			new ShearPlateContainer();
			new FontFamilyContainer();
			new FontSizeContainer();
			new BorderContainer();
			new FillColorContainer();
			new FontColorContainer();
			new ContentAlignContainer();
			new TextFormatContainer();
			new MergeCellContainer();
			new ContentFontContainer();
			new FrozenContainer();
		},
		buildExcelPublicAPI: function(SpreadSheet) {
			SpreadSheet.prototype.setFontColor = setFontColor;
			SpreadSheet.prototype.setFillColor = setFillColor;
			SpreadSheet.prototype.setFontFamily = setFontFamily;
			SpreadSheet.prototype.setCellHeight = setCellHeight;
			SpreadSheet.prototype.selectCell = selectCell;
			SpreadSheet.prototype.mergeCell = mergeCell;
			SpreadSheet.prototype.splitCell = splitCell;
			SpreadSheet.prototype.setCellBorder = setCellBorder;
			SpreadSheet.prototype.setCellContent = setCellContent;
			SpreadSheet.prototype.setAlign = setAlign;
			SpreadSheet.prototype.selectCellCols = selectCellCols;
			SpreadSheet.prototype.selectCellRows = selectCellRows;
			SpreadSheet.prototype.setCellWidth = setCellWidth;
			SpreadSheet.prototype.setFontFamilySize = setFontFamilySize;
			SpreadSheet.prototype.setFontStyle = setFontStyle;
			SpreadSheet.prototype.setFontWeight = setFontWeight;
			SpreadSheet.prototype.setFrozen = setFrozen;
			SpreadSheet.prototype.setTextType = setTextType;
			SpreadSheet.prototype.getPointByPosi = getPointByPosi;
			SpreadSheet.prototype.adaptScreen = adaptScreen;
			SpreadSheet.prototype.getTextByCoordinate = getTextByCoordinate;
			SpreadSheet.prototype.getFrozenState = getFrozenState;
			SpreadSheet.prototype.setWordWrap = setWordWrap;
			SpreadSheet.prototype.getSelectRegion = getSelectRegion;
			SpreadSheet.prototype.reloadCells = reloadCells;
		},
		buildDataSourceOperation: function(SpreadSheet) {
			SpreadSheet.prototype.setDataSourceRegion = operationDataSourceRegion.setDataSourceRegion;
			SpreadSheet.prototype.setSelectRegion = operationDataSourceRegion.setSelectRegion;
			SpreadSheet.prototype.destroyDataSoureRegion = operationDataSourceRegion.destroyDataSoureRegion;
		},
		buildExcelEventListener: function(SpreadSheet) {
			SpreadSheet.prototype.addEventListener = listener.addEventListener;
			SpreadSheet.prototype.removeEventListener = listener.removeEventListener;
		},
		buildExcelExtend: function(SpreadSheet) {
			SpreadSheet.prototype.startHighlight = highlight.startHighlight;
			SpreadSheet.prototype.stopHighlight = highlight.stopHighlight;
			SpreadSheet.prototype.getHighlightDirection = highlight.getHighlightDirection;
		}
	};
	return excelBuild;
});