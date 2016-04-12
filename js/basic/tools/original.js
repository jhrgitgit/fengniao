define(function(require) {
	'use strict';
	var $ = require('lib/jquery'),
		config = require('spreadsheet/config'),
		binary = require('basic/util/binary'),
		cache = require('basic/tools/cache'),
		send = require('basic/tools/send'),
		loadRecorder = require('basic/tools/loadrecorder'),
		buildColAlias = require('basic/tools/buildcolalias'),
		LineRow = require('models/lineRow'),
		LineCol = require('models/lineCol'),
		Cell = require('models/cell'),
		headItemCols = require('collections/headItemCol'),
		headItemRows = require('collections/headItemRow'),
		siderLineCols = require('collections/siderLineCol'),
		siderLineRows = require('collections/siderLineRow'),
		selectRegions = require('collections/selectRegion'),
		sheets = require('collections/sheets'),
		cells = require('collections/cells');

	/**
	 * 后台数据还原类
	 * 系统配置变量
	 * @author caijl
	 * @module basic
	 * @since 0.1.0
	 */
	return {
		/**
		 * 创建新Excel表单
		 * @method bulidNewExcel
		 */
		bulidNewExcel: function() {
			var i,
				j,
				lenCol,
				lenRow,
				currentObject;
			lenCol = config.User.initColNum;
			lenRow = config.User.initRowNum;

			for (i = 0; i < lenCol; i++) {
				currentObject = {
					sort: i,
					alias: (i + 1).toString(),
					left: i * config.User.cellWidth,
					width: config.User.cellWidth - 1,
					displayName: buildColAlias(i)
				};
				headItemCols.add(currentObject);
			}
			for (j = 0; j < lenRow; j++) {
				currentObject = {
					sort: j,
					alias: (j + 1).toString(),
					top: j * config.User.cellHeight,
					height: config.User.cellHeight - 1,
					displayName: binary.buildRowAlias(j)
				};
				headItemRows.add(currentObject);
			}
			this.restoreSelectRegion();
			loadRecorder.insertPosi(0, headItemRows.models[lenRow - 1].height + headItemRows.models[lenRow - 1].top, cache.rowRegionPosi);
			loadRecorder.insertPosi(0, headItemRows.models[lenRow - 1].height + headItemRows.models[lenRow - 1].top, cache.cellRegionPosi.vertical);
		},
		/**
		 * 解析后台返回行索引数据，如果行数未满足加载区域，则生成新行，进行补充
		 * @method analysisRowData
		 * @param  {Array} rows 行数据数组
		 */
		analysisRowData: function(rows, startRowSort) {
			var tempRow,
				tempHeadRow,
				index, //插入Rows中的索引值
				i,
				j,
				len,
				rowLen;
			
			for (i = 0; i < rows.length; i++) {
				index = binary.indexModelBinary(rows[i].top, headItemRows.models, 'top', 'height');
				if (headItemRows.getIndexByAlias(rows[i].aliasY) != -1) {
					index++;
					continue;
				}
				tempHeadRow = new LineRow();
				tempHeadRow.set('sort', startRowSort + i);
				tempHeadRow.set('top', rows[i].top);
				tempHeadRow.set('height', rows[i].height);
				tempHeadRow.set('alias', rows[i].aliasY);
				tempHeadRow.set('displayName', binary.buildRowAlias(startRowSort + i));
				headItemRows.push(tempHeadRow, {
					at: index
				});
			}
			//ps:数据还原
		},
		/**
		 * 解析后台返回列索引数据，如果列数未满足加载区域，则生成新列，进行补充
		 * @method analysisColData
		 * @param  {Array} cols 列数据数组
		 */
		analysisColData: function(cols, startColSort) {
			var tempCol, tempHeadCol, i, j, len, collen;
			for (i = 0; i < cols.length; i++) {
				//去重
				if (headItemCols.getIndexByAlias(cols[i].aliasY) != -1) {
					continue;
				}
				tempHeadCol = new LineCol();
				tempHeadCol.set('sort', startColSort + i);
				tempHeadCol.set('left', cols[i].left);
				tempHeadCol.set('width', cols[i].width);
				tempHeadCol.set('alias', cols[i].aliasX);
				tempHeadCol.set('displayName', buildColAlias(startColSort + i));
				headItemCols.add(tempHeadCol);
			}


			if (headItemCols.length < config.User.initColNum) {
				len = config.User.initColNum - headItemCols.length;
				collen = headItemCols.length;
				for (j = 0; j < len; j++) {
					tempHeadCol = new LineCol();
					tempHeadCol.set('left', headItemCols.models[collen + j - 1].get('left') + headItemCols.models[collen + j - 1].get('width') + 1);
					tempHeadCol.set('width', 71);
					tempHeadCol.set('alias', (headItemCols.length + 1).toString());
					tempHeadCol.set('displayName', buildColAlias(collen + j));
					headItemCols.add(tempHeadCol);
				}
			}
		},

		/**
		 * @method 解析cell模型数据
		 * @param  {Array} cellsData cell模型数组数据
		 */
		analysisCellData: function(cellsData) {
			var j, k, //循环变量
				tempCell,
				existCell, //已存在单元格
				gridLineColList,
				gridLineRowList,
				cellAttributes, //cell模型属性 
				physicsBox = {},
				gridAliasColList, //cell列索引list
				gridAliasRowList, //cell行索引list
				cellStartRowIndex, //cell起始row索引
				cellStartColIndex, //cell起始col索引
				cellEndRowIndex, //cell结束row索引
				cellEndColIndex, //cell结束row索引
				cellsPositionX,
				width,
				height,
				left,
				top,
				rowEndIndex,
				i,
				model; //gridrow加载数量

			gridLineColList = headItemCols.models;
			gridLineRowList = headItemRows.models;


			//解析cell
			for (i = 0; i < cellsData.length; i++) {
				cellAttributes = cellsData[i];
				if (cellAttributes === null) {
					continue;
				}

				gridAliasColList = cellAttributes.occupy.x;
				gridAliasRowList = cellAttributes.occupy.y;
				width = 0;
				height = 0;
				//获取已加载行模型内，cell起始索引，结束索引
				for (j = 0; j < gridAliasRowList.length; j++) {
					if (headItemRows.getIndexByAlias(gridAliasRowList[j]) != -1) {
						cellStartRowIndex = headItemRows.getIndexByAlias(gridAliasRowList[j]);
						break;
					}
				}
				for (j = gridAliasRowList.length - 1; j > -1; j--) {
					if (headItemRows.getIndexByAlias(gridAliasRowList[j]) != -1) {
						cellEndRowIndex = headItemRows.getIndexByAlias(gridAliasRowList[j]);
						break;
					}
				}
				if (cellStartRowIndex == -1 || cellEndRowIndex == -1) {
					continue;
				}
				//列模型未涉及动态加载功能，直接使用cell模型列索引
				cellStartColIndex = headItemCols.getIndexByAlias(gridAliasColList[0]);
				cellEndColIndex = headItemCols.getIndexByAlias(gridAliasColList[gridAliasColList.length - 1]);

				//判断cell模型是否已加载
				cellsPositionX = cache.CellsPosition.strandX;
				if (cellsPositionX[gridAliasColList[0]] !== undefined &&
					cellsPositionX[gridAliasColList[0]][gridAliasRowList[0]] !== undefined) {
					existCell = cells.models[cellsPositionX[gridAliasColList[0]][gridAliasRowList[0]]];
				}

				//计算cell模型宽高
				for (j = cellStartColIndex; j < cellEndColIndex + 1; j++) {
					model = gridLineColList[j];
					width += model.get('width') + 1;
				}
				for (j = cellStartRowIndex; j < cellEndRowIndex + 1; j++) {
					model = gridLineRowList[j];
					height += model.get('height') + 1;
				}
				physicsBox = {
					top: gridLineRowList[cellStartRowIndex].get('top') + 1,
					left: gridLineColList[cellStartColIndex].get('left') + 1,
					width: width - 2,
					height: height - 2
				};
				if (existCell !== null && existCell !== undefined) {
					//重新渲染cell模型宽高
					existCell.set('physicsBox', physicsBox);
				} else {
					tempCell = new Cell(cellAttributes);
					tempCell.set('physicsBox', physicsBox);
					cells.add(tempCell);
					//维护postion
					for (j = 0; j < gridAliasColList.length; j++) {
						for (k = 0; k < gridAliasRowList.length; k++) {
							cache.cachePosition(gridAliasRowList[k], gridAliasColList[j], cells.length - 1);
						}
					}
				}
				existCell = null;
			}
		},
		analysisSheetData: function(sheetsData) {
			var i;
			for (i = 0; i < sheetsData.length; i++) {
				sheets.add({
					name: sheetsData[i],
					sort: i
				});
			}
		},
		/**
		 * 还原选中区域
		 * @method restoreSelectRegion
		 * @param  {Array} cellsData cell模型数组数据
		 */
		restoreSelectRegion: function() {
			var headItemRowModel,
				headItemColModel,
				aliasGridRow,
				aliasGridCol,
				cellsPositionX,
				modelCell,
				selectRegionModel;

			headItemRowModel = headItemRows.getModelByAlias(cache.UserView.rowAlias);
			headItemColModel = headItemCols.getModelByAlias(cache.UserView.colAlias);
			cellsPositionX = cache.CellsPosition.strandX;
			if (cellsPositionX[aliasGridCol] !== undefined &&
				cellsPositionX[aliasGridCol][aliasGridRow] !== undefined) {
				modelCell = cells.models[cellsPositionX[aliasGridCol][aliasGridRow]];
			}
			if (modelCell !== undefined) {
				selectRegionModel = {
					physicsPosi: {
						top: modelCell.get("physicsBox").top,
						left: modelCell.get("physicsBox").left
					},
					physicsBox: {
						width: modelCell.get('physicsBox').width,
						height: modelCell.get('physicsBox').height
					}
				};
				selectRegions.add(selectRegionModel);
				siderLineCols.add({
					left: modelCell.get("physicsBox").left,
					width: modelCell.get('physicsBox').width
				});
				siderLineRows.add({
					top: modelCell.get("physicsBox").top,
					height: modelCell.get("physicsBox").height
				});
			} else {
				selectRegionModel = {
					physicsPosi: {
						top: headItemRowModel.get("top"),
						left: headItemColModel.get("left")
					},
					physicsBox: {
						width: headItemColModel.get('width'),
						height: headItemRowModel.get('height')
					}
				};
				selectRegions.add(selectRegionModel);
				siderLineCols.add({
					left: headItemColModel.get("left"),
					width: headItemColModel.get('width')
				});
				siderLineRows.add({
					top: headItemRowModel.get('top'),
					height: headItemRowModel.get('height')
				});
			}

		},

		/**
		 * 从后台发送请求，得到excel数据，进行重新加载
		 * @method  
		 */
		restoreExcel: function() {
			var excelId = window.SPREADSHEET_AUTHENTIC_KEY,
				build = window.SPREADSHEET_BUILD_STATE,
				localRowPosi = 0, //后台存储excel数据总高度
				startRowAliasY,
				startRowSort,
				startColSort,
				sheetNames = [],
				mainContainerHeight = $("#tableContainer").height - 19,
				self = this,
				i;

			if (build === "true" || build === undefined) {
				this.bulidNewExcel();
				cache.localRowPosi = 0;
				return;
			}
			

			$.ajax({
				url: config.rootPath + 'excel.htm?m=position&excelId=' + excelId + '&sheetId=1&containerHeight=' + $('#spreadSheet').height(),
				async: false,
				dataType: 'json',
				success: function(data) {
					if (data === '') {
						return;
					}
					cache.UserView.colAlias = data.displayRowStartAlias;
					cache.UserView.rowAlias = data.displayColStartAlias;

					if (data.returndata.spreadSheet[0].sheet.frozen.state === "1") {
						cache.TempProp = {
							isFrozen: true,
							colAlias: data.returndata.spreadSheet[0].sheet.frozen.colIndex,
							rowAlias: data.returndata.spreadSheet[0].sheet.frozen.rowIndex,
							rowFrozen: true,
							colFrozen: true
						};
					}
					for (i = 0; i < data.returndata.spreadSheet.length; i++) {
						sheetNames.push(data.returndata.spreadSheet[i].name);
					}
					cache.localRowPosi = data.maxPixel;
					startRowSort = data.dataRowStartIndex;
					startColSort = data.dataColStartIndex;
					data = data.returndata;
					var cellModels = data.spreadSheet[0].sheet.cells;
					var rows = data.spreadSheet[0].sheet.glY;
					var cols = data.spreadSheet[0].sheet.glX;
					self.analysisSheetData(sheetNames);
					self.analysisRowData(rows, startRowSort);
					self.analysisColData(cols, startColSort);
					self.analysisCellData(cellModels);
					self.restoreSelectRegion();

				}

			});
			loadRecorder.insertPosi(headItemRows.models[0].get('top'), headItemRows.models[headItemRows.length - 1].get('top') + headItemRows.models[headItemRows.length - 1].get('height'), cache.rowRegionPosi);
		}
	};
});