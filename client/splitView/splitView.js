define([
	'text!./splitView.html',
	'../workbookView/workbookView',
	'../assess/assessView/assessView',
/*FIXME: remove this
	'../helpView/helpView',
*/
	'../util/cls',
	'../util/removeAccidentalWhitespace'
], function(
	splitView_html,
	workbookView,
	assessView,
/*FIXME: remove this
	helpView,
*/
	cls,
	removeAccidentalWhitespace
) {

//FIXME: splitView - does it still do anything?
	var viewInstance = {};
	var viewTypes = [ 'workbook', 'compare' ];
	var splitView = function(parentObj, parentNode) {
		this.parentObj = parentObj;
		var model = this.model = parentObj.model;
		parentNode.innerHTML = removeAccidentalWhitespace(splitView_html);
		var workbookId = this.model.currentWorkbookId();
		var sheetType = this.model.currentSheetType(workbookId);
		var sheetId = this.model.currentSheetId(workbookId, sheetType);
		var parentNodeClass = 'splitViewTD_workbook';
		var viewParentNode = parentNode.querySelector('.' + parentNodeClass);
		this.parentObj.workbookViewInstance = new workbookView({
					model: model,
					workbookId: workbookId, 
					sheetType: sheetType, 
					sheetId: sheetId
				}, viewParentNode);
	};

	return splitView;
});
