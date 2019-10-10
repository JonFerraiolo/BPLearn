define([
	'../util/request',
	'../util/cls',
	'../util/elem',
	'../modal/popup',
	'text!./chapterTabsMenu.html',
	'../util/removeAccidentalWhitespace',
	'../newCloneDialog/newCloneDialog'
], function(
	request,
	cls,
	elem,
	popup,
	chapterTabsMenu_html,
	removeAccidentalWhitespace,
	newCloneDialog
) {

	var pathRoot = (location.pathname == '/') ? '/' : location.pathname.substr(0, location.pathname.lastIndexOf('/')+1);

	return {
		show: function(refNode, workbookView) {
			this.workbookView = workbookView;
			this.model = this.workbookView.model;
			var data = this.model.get('');

			var workbookId = data.nav.workbookId;
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var sheetTypeAdjusted = sheetType.replace(/_/g, ' ');

			var content = removeAccidentalWhitespace(chapterTabsMenu_html);
			var popupElem = popup.show({
				content: content,
				refNode: refNode,
				refX: 'center',
				popupX: 'center',
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
			var workbookId = this.model.currentWorkbookId();
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var sheetTypeAdjusted = sheetType.replace(/_/g, ' ');
			var currentWorkbook = this.model.get('workbooks['+workbookId+']');
			if (!currentWorkbook) {
				console.error('No workbook with index: '+workbookId);
			} else {
				var sheets = currentWorkbook.sheets[sheetType];
				for (var i in sheets) {
					var sheet = sheets[i];
					var checked = (i == sheetId),
						active = !checked;
					var title = sheet.Title || '(no title)';
					createTextLI('goto_'+sheetType+'_'+i, title, active, checked);
				}
				createSeparatorLI();
				createTextLI('new', 'New '+sheetTypeAdjusted, true, false);
				createTextLI('clone', 'Duplicate '+sheetTypeAdjusted, true, false);
				createTextLI('delete', 'Delete '+sheetTypeAdjusted, true, false);
				createTextLI('printPage', 'Print '+sheetTypeAdjusted, true, false);
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
				var re = /^goto_(Assessment|Positioning_Statement|Elevator_Pitch|Brand_Strategy|Ecosystem_Model|Action_Plan)_(\d+)$/;
				var matches = value.match(re);
				if (matches) {
					var workbookId = this.model.get('nav.workbookId');
					var sType = matches[1];
					var sId = parseInt(matches[2]);
					this.workbookView.changeSheet(workbookId, sType, sId);
				} else if (value == 'new' || value == 'clone') {
					var workbookId = this.model.currentWorkbookId();
					var sheetType = this.model.currentSheetType(workbookId);
					var sheetId = this.model.currentSheetId(workbookId, sheetType);
					var sheetTypeAdjusted = sheetId.replace(/_/g, ' ');
					var sheets = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']');
					var nSheets = this.model.nSheets(workbookId, sheetType);
					var sheet;
					if (!sheets) {
						// If !sheets, then no save operations have happened yet for any sheet of type sheetId
						// so the model does not contain any sheets yet. So, create an empty one.
						sheet = this.model.newSheet(workbookId, sheetType);
						sheets = {};
						sheets[sheet._id] = sheet;
						this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']', sheets);
					} else {
						sheet = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']');
					}
					var newSheetNum = nSheets + 1;
					var title;
					if (value == 'clone') {
						var currentSheetDataCopy = JSON.parse(JSON.stringify(sheet));
						this.workbookView.duplicateSheetPostProcess(currentSheetDataCopy, workbookId, sheetType, sheetId);
						var oldTitle = currentSheetDataCopy.Title || '';
						if (oldTitle.length > 0) {
							var trailingNumberRegex = new RegExp('(.*)\\ \\d+$');
							var trailingNumberMatches = oldTitle.match(trailingNumberRegex);
							if (trailingNumberMatches) {
								title = trailingNumberMatches[1] + ' ' + (newSheetNum+1);
							} else {
								title = oldTitle + ' ' + (newSheetNum+1);
							}
						} else {
							title = sheetTypeAdjusted + ' ' + (newSheetNum+1);
						}
						currentSheetDataCopy.Title = title;
						this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheet._id+']', currentSheetDataCopy);
						this.workbookView.changeSheet(workbookId, sheetType, sheet._id);
					} else {
						title = sheetTypeAdjusted + ' ' + (newSheetNum+1);
						var newSheet = this.model.newSheet(workbookId, sheetType);
						this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+newSheet._id+']', newSheet);
						this.workbookView.changeSheet(workbookId, sheetType, newSheet._id);
					}

				} else if (value == 'delete') {
					var workbookId = this.model.currentWorkbookId();
					var sheetType = this.model.currentSheetType(workbookId);
					var sheetId = this.model.currentSheetId(workbookId, sheetType);
					var sheetTypeAdjusted = sheetId.replace(/_/g, ' ');
					newCloneDialog({
						text: 'Are you sure you want to delete the currently showing ' + sheetTypeAdjusted + '? Note that this action cannot be undone.'
					}, function(result) {
						if (result == 'yes') {
							var workbookId = this.model.currentWorkbookId();
							var sheetType = this.model.currentSheetType(workbookId);
							var sheetId = this.model.currentSheetId(workbookId, sheetType);
							var sheets = JSON.parse(JSON.stringify(this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']')));
							var newSheetId = null;
							var sheetFound = false;
							for (var i in sheets) {
								var sheet = sheets[i];
								if (sheetFound) {
									newSheetId = sheet._id;
									break;
								} else if (i == sheetId) {
									sheetFound = true;
								}
							}
							var nSheets = this.model.nSheets(workbookId, sheetType);
							if (nSheets > 1) {
								delete sheets[sheetId];
								this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']', sheets);
								this.workbookView.changeSheet(workbookId, sheetType, newSheetId);
							}
						}
					}.bind(this));
				} else if (value == 'printPage') {
					var workbookId = this.model.currentWorkbookId();
					var sheetType = this.model.currentSheetType(workbookId);
					var sheetId = this.model.currentSheetId(workbookId, sheetType);
					this.workbookView.printPage(workbookId, sheetType, sheetId);
				}
			}.bind(this), false);
		}
	}
	
});