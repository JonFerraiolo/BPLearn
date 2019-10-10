define([
	'text!./chapterTabs.html',
	'../util/cls',
	'../util/removeAccidentalWhitespace',
	'../chapterTabsMenu/chapterTabsMenu',
	'../newCloneDialog/newCloneDialog'
], function(
	chapterTabs_html,
	cls,
	removeAccidentalWhitespace,
	chapterTabsMenu,
	newCloneDialog
) {
	var selectedTabClass = 'chapterTabLISelected';

	var currentSheetType, currentSheetId, parentNode;

	var highlightTab = function(workbookId, sheetType, sheetId) {
		var chapterTabLINodes = this.parentNode.querySelectorAll('.chapterTabLI');
		for (var i=0; i<chapterTabLINodes.length; i++) {
			var chapterTabLINode = chapterTabLINodes[i];
			cls.remove(chapterTabLINode, selectedTabClass);
		}
		currentSheetType = sheetType;
		currentSheetId = sheetId;
		var chapterTabLINodeSelected = this.parentNode.querySelector('.chapterTabLI[data-bp-tab='+currentSheetType+']');
		if (chapterTabLINodeSelected) {
			cls.add(chapterTabLINodeSelected, selectedTabClass);
		}
	};

	/**
	 * @constructor
	 * @param {function} workbookView  Instance of the workbookView class
	 * @param {string} sheetType  Positioning_Statement|Elevator_Pitch|...
	 * @param {number} sheetId  id into sheets array for this workbook
	 * @param {Element} parentNode  Parent element for chapter tabs
	 */
 	var chapterTabs = function(workbookView, workbookId, sheetType, sheetId, parentNode) {
		this.workbookView = workbookView;
		this.workbookId = workbookId;
		this.sheetType = sheetType;
		this.sheetId = sheetId;
		this.parentNode = parentNode;
		this.model = workbookView.model;
		parentNode.innerHTML = removeAccidentalWhitespace(chapterTabs_html);
		var chapterTabLINodes = parentNode.querySelectorAll('.chapterTabLI');
		for (var i=0; i<chapterTabLINodes.length; i++) {
			var chapterTabLINode = chapterTabLINodes[i];
			chapterTabLINode.addEventListener('click', function(e) {
				e.preventDefault();
				var newSheetType = e.currentTarget.getAttribute('data-bp-tab');
				if (newSheetType && newSheetType != this.sheetType) {
					var workbookId = this.model.get('nav.workbookId');
					var newSheetId = this.model.currentSheetId(workbookId, newSheetType);
					this.workbookView.changeSheet(workbookId, newSheetType, newSheetId);
				}
			}.bind(this), false);
			var chapterTabBadgeArrow = chapterTabLINode.querySelector('.chapterTabBadgeArrow');
			if (chapterTabBadgeArrow) {
				chapterTabBadgeArrow.addEventListener('click', function(e) {
					e.preventDefault();
					var node = e.target;
					while (node && node.tagName != 'BODY') {
						if (node.hasAttribute('data-bp-tab')) {
							break;
						} else {
							node = node.parentNode;
						}
					}
					var refNode = node.querySelector('.chapterTabBadgeArrow');
					chapterTabsMenu.show(refNode, this.workbookView);
				}.bind(this), false);
			}
		}
		this.updateBadge();
		highlightTab.bind(this)(this.workbookId, this.sheetType, this.sheetId);
	};

	var p = chapterTabs.prototype;

	p.updateBadge = function() {
		var chapterTabLINodes = this.parentNode.querySelectorAll('.chapterTabLI');
		for (var i=0; i<chapterTabLINodes.length; i++) {
			var chapterTabLINode = chapterTabLINodes[i];
			var chapterLabel = chapterTabLINode.getAttribute('data-bp-tab');
			if (chapterLabel) {
				var workbookId = this.model.currentWorkbookId();
				var sheetType = this.model.currentSheetType(workbookId);
				var sheetId = this.model.currentSheetId(workbookId, sheetType);
				var nSheets = this.model.nSheets(workbookId, sheetType);
				var chapterTabBadgeArrow = chapterTabLINode.querySelector('.chapterTabBadgeArrow');
/*
				var chapterTabBadge = chapterTabLINode.querySelector('.chapterTabBadge');
				if (chapterTabBadge) {
					chapterTabBadge.innerHTML = (sheetId+1) + '/' + nSheets;
				}
*/
				if (chapterTabBadgeArrow) {
					cls.add(chapterTabBadgeArrow, 'chapterTabMultipleSheets');
				}
			}
		}
	};

	p.update = function() {
		this.workbookId = this.model.currentWorkbookId();
		this.sheetType = this.model.currentSheetType(this.workbookId);
		this.sheetId = this.model.currentSheetId(this.workbookId, this.sheetType);
		highlightTab.bind(this)(this.workbookId, this.sheetType, this.sheetId);
		this.updateBadge();
	};

	return chapterTabs;

});
