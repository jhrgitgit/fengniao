define(function(require) {
	'use strict';

	var original = require('basic/tools/original'),
		domloader = require('basic/tools/template'),
		listener = require('basic/util/listener'),
		extend = require('basic/util/extend'),
		setFontColor = require('entrance/tool/setfontcolor'),
		setFillColor = require('entrance/tool/setfillcolor'),
		setFontFamily = require('entrance/tool/setfontfamily'),
		setCellHeight = require('entrance/cell/setcellheight'),
		setCellWidth = require('entrance/cell/setcellwidth'),
		selectCell = require('entrance/cell/selectcell'),
		mergeCell = require('entrance/tool/mergecell'),
		splitCell = require('entrance/tool/splitcell'),
		setCellContent = require('entrance/tool/setcellcontent'),
		selectCellCols = require('entrance/cell/selectcellcols'),
		selectCellRows = require('entrance/cell/selectcellrows'),
		setCellBorder = require('entrance/tool/setcellborder'),
		setFontFamilySize = require('entrance/tool/setfontfamilysize'),
		setFontWeight = require('entrance/tool/setfontweight'),
		setFontStyle = require('entrance/tool/setfontstyle'),
		setFrozen = require('entrance/sheet/setfrozen'),
		setAlign = require('entrance/tool/setalign'),
		operationDataSourceRegion = require('entrance/selectregion/datasourceregionoperation'),
		getPointByPosi = require('entrance/sheet/getpointbyposi'),
		setWordWrap = require('entrance/tool/setwordwrap'),
		getTextByCoordinate = require('entrance/cell/gettextbycoordinate'),
		adaptScreen = require('entrance/sheet/adaptscreen'),
		getFrozenState = require('entrance/sheet/getfrozenstate'),
		getSelectRegion = require('entrance/sheet/getselectregion'),
		highlight = require('entrance/extention/highlight'),
		reloadCells = require('entrance/cell/reloadcells'),
		setTextType = require('entrance/tool/settexttype'),
		comment = require('entrance/tool/comment');


	var excelBuild = {
		buildDom: function(id) {
			domloader(id);
		},
		buildExcelOriginalData: function() {
			original.restoreExcel();
		},
		buildExcelView: function(id) {
			var Screen = require('views/screen');
			var a = new Screen();
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
				FrozenContainer = require('widgets/frozen/frozenContainer'),
				CommentContainer =require('widgets/celloperation/commentcontainer');
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
			new CommentContainer();
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

			SpreadSheet.prototype.setTextType = setTextType.setText;
			SpreadSheet.prototype.setNumType = setTextType.setNum;
			SpreadSheet.prototype.setDateType = setTextType.setDate;
			SpreadSheet.prototype.setPercentType = setTextType.setPercent;
			SpreadSheet.prototype.setCoinType = setTextType.setCoin;

			SpreadSheet.prototype.getPointByPosi = getPointByPosi;
			SpreadSheet.prototype.adaptScreen = adaptScreen;
			SpreadSheet.prototype.getTextByCoordinate = getTextByCoordinate;
			SpreadSheet.prototype.getFrozenState = getFrozenState;
			SpreadSheet.prototype.setWordWrap = setWordWrap;
			SpreadSheet.prototype.getSelectRegion = getSelectRegion;
			SpreadSheet.prototype.reloadCells = reloadCells;

			SpreadSheet.prototype.addComment =comment.addComment;
			SpreadSheet.prototype.editComment =comment.editComment;
			SpreadSheet.prototype.deleteComment =comment.deleteComment;
			
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