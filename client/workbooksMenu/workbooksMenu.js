define([
	'../util/request',
	'../util/cls',
	'../util/elem',
	'../modal/popup',
	'text!./workbooksMenu.html',
	'../util/removeAccidentalWhitespace',
	'../newCloneDialog/newCloneDialog'
], function(
	request,
	cls,
	elem,
	popup,
	workbooksMenu_html,
	removeAccidentalWhitespace,
	newCloneDialog
) {

	var pathRoot = (location.pathname == '/') ? '/' : location.pathname.substr(0, location.pathname.lastIndexOf('/')+1);

	return {
		show: function(refNode, parentWidget) {
			this.parentWidget = parentWidget;
			this.model = parentWidget.model;
			var data = this.parentWidget.model.get('');

			var workbookId = data.nav.workbookId;

			var content = removeAccidentalWhitespace(workbooksMenu_html);
			var popupElem = popup.show({
				content: content,
				refNode: refNode,
				refX: 'left',
				popupX: 'left',
				refY: 'bottom',
				popupY: 'top',
				underlayOpacity: '0.0',
				hideCallback: function() {
					cls.remove(refNode, 'popupMenuShowing');
				}
			});
			cls.add(refNode, 'popupMenuShowing');

			var UL = popupElem.querySelector('.popupMenuUL');
			var createTextLI = function(value, label, active, checked) {
				var li = elem('li', {}, UL);
				var aClass = 'popupMenuItem' + (active ? '' : ' popupMenuItemInactive') + (checked ? ' popupMenuItemChecked' : '');
				var a = elem('a', { attrs: { href:'', 'class': aClass, 'data-bp-value': value }}, li);
				var checkSpan = elem('span', { attrs: { 'class': 'popupMenuCheckbox' }}, a);
				var labelSpan = elem('span', { attrs: { 'class':'popupMenuLabel' }, children: label }, a);
			};
			var createSeparatorLI = function() {
				var li = elem('li', { attrs: { 'class': 'popupMenuItem popupMenuSeparator' }}, UL);
			};
			if (!data.workbooks) {
				console.error('No workbooks!');
			} else {
				for (var wId in data.workbooks) {
					var workbook = data.workbooks[wId];
					var checked = (wId == workbookId),
						active = !checked;
					var title = workbook.Title || '(no title)';
					createTextLI('goto_workbook_'+wId, title, active, checked);
				};
				createSeparatorLI();
				createTextLI('newWorkbook', 'New Workbook', true, false);
				createTextLI('cloneWorkbook', 'Duplicate Workbook', true, false);
				createTextLI('deleteWorkbook', 'Delete Workbook', true, false);
				createTextLI('printWorkbook', 'Print Workbook', true, false);
			}

			// In case user clicks on a part of menu that doesn't map to a command
			popupElem.addEventListener('click', function(e) {
				popup.hide();
			}, false);
			UL.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				popup.hide();
				var node = e.target;
				var value = '';
				while (node && node.tagName != 'BODY') {
					value = node.getAttribute('data-bp-value');
					if (value) {
						break;
					} else {
						node = node.parentNode;
					}
				}
				var workbookId = this.model.currentWorkbookId();
				var sheetType = this.model.currentSheetType(workbookId);
				var sheetId = this.model.currentSheetId(workbookId, sheetType);
				var sheetTypeAdjusted = sheetType.replace(/_/g, ' ');
				var workbooks = this.model.get('workbooks');
				var nWorkbooks = this.model.nWorkbooks();
				var newWorkbookNum = nWorkbooks || '';
				var re = /^goto_workbook_(\d+)$/;
				var matches = value.match(re);
				if (value == 'newWorkbook') {
					var title = 'Workbook ' + (newWorkbookNum+1);
					var newWorkbook = this.model.newWorkbook();
					this.model.set('workbooks['+newWorkbookNum+']', newWorkbook);
					var newSheetType = 'Positioning_Statement';
					var newSheet = this.model.getFirstSheet(newWorkbook._id, newSheetType) || this.model.newSheet(newWorkbook._id, newSheetType);
					this.parentWidget.changeSheet(nWorkbooks, 'Positioning_Statement', newSheet._id);

				} else if (value == 'cloneWorkbook') {
					var title;
					var currentWorkbookDataCopy;
					if (workbooks[workbookId]) {
						currentWorkbookDataCopy = JSON.parse(JSON.stringify(workbooks[workbookId]));
					} else {
						currentWorkbookDataCopy = {};
					}
					var oldTitle = currentWorkbookDataCopy.Title || '';
					if (oldTitle.length > 0) {
						var trailingNumberRegex = new RegExp('(.*)\\ \\d+$');
						var trailingNumberMatches = oldTitle.match(trailingNumberRegex);
						if (trailingNumberMatches) {
							title = trailingNumberMatches[1] + ' ' + (newWorkbookNum+1);
						} else {
							title = oldTitle + ' ' + (newWorkbookNum+1);
						}
					} else {
						title = sheetTypeAdjusted + ' ' + (newWorkbookNum+1);
					}
					currentWorkbookDataCopy.Title = title;
					this.parentWidget.duplicateWorkbookPostProcess(currentWorkbookDataCopy);
					this.model.set('workbooks['+newWorkbookNum+']', currentWorkbookDataCopy);
					this.parentWidget.changeSheet(nWorkbooks, sheetType, sheetId);

				} else if (value == 'deleteWorkbook') {
					newCloneDialog({
						text: 'Are you sure you want to delete the currently showing workbook? Note that this action cannot be undone.'
					}, function(result) {
						if (result == 'yes') {
							var workbookId = this.model.get('nav.workbookId');
							var workbooks = JSON.parse(JSON.stringify(this.model.get('workbooks')));
							var nWorkbooks = this.model.nWorkbooks();
							var foundWorkbookId = false;
							var newWorkbookId = null;
							for (var i in workbooks) {
								if (foundWorkbookId) {
									newWorkbookId = i;
									break;
								} else if (i == workbookId) {
									delete workbooks[i];
									foundWorkbookId = true;
								}
							}
							delete workbooks[workbookId];
							this.model.set('workbooks', workbooks);
							var newSheetId = this.model.currentSheetId(newWorkbookId, sheetType);
							this.parentWidget.changeSheet(newworkbookId, 'Positioning_Statement', newSheetId);
						}
					}.bind(this));

				} else if (value == 'printWorkbook') {
					var workbookId = this.parentWidget.model.get('nav.workbookId');
					this.parentWidget.printWorkbook(workbookId);

				} else if (matches) {
					var newWorkbookId = parseInt(matches[1]);
					var newSheetType = this.model.currentSheetType(newWorkbookId);
					var newSheetId = this.model.currentSheetId(newWorkbookId, newSheetType);
					this.parentWidget.changeSheet(newWorkbookId, newSheetType, newSheetId);
				}
			}.bind(this), false);
		}
	}
	
});