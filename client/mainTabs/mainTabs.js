define([
	'text!./mainTabs.html',
	'../about/about',
	'../bookView/bookView',
	'../eWorkbookView/eWorkbookView',
	'../splitView/splitView',
	'../util/cls',
	'../util/sendDataToServer',
	'../util/removeAccidentalWhitespace'
], function(
	mainTabs_html,
	about,
	bookView,
	eWorkbookView,
	splitView,
	cls,
	sendDataToServer,
	removeAccidentalWhitespace
) {

	//FIXME: This seems wrong
	var pathRoot = location.pathname;
	if (pathRoot[pathRoot.length-1] != '/') {
		pathRoot += '/';
	}

	var selectedTabClass = 'mainTabSelected';

	var showTab = function(newTab, updateModel) {
		if (newTab && newTab != this.currentTab) {
			this.mainTabsContent.innerHTML = '';
			if (updateModel) {
				this.model.set('nav.mainTab', newTab);
			}
			this.currentTab = newTab;
			if (newTab == 'Course') {
				this.bookViewInstance = new bookView(this.model, this.mainTabsContent);
			} else if (newTab == 'My Workbook') {
				this.eWorkbookViewInstance = new eWorkbookView(this.model, this.mainTabsContent);
			}
			var mainTabsLINodes = this.parentNodeTabs.querySelectorAll('.mainTabsTabs li');
			for (var i=0; i<mainTabsLINodes.length; i++) {
				var liNode = mainTabsLINodes[i];
				cls.remove(liNode, selectedTabClass);
			}
			var liNodeSelected = this.parentNodeTabs.querySelector('.mainTabsTabs li[data-bp-mainTab="'+newTab+'"]');
			if (liNodeSelected) {
				cls.add(liNodeSelected, selectedTabClass);
			}
		}
	};

	var mainTabs = function(model, parentNodeTabs, parentNodeContent) {
		this.model = model;
		this.parentNodeTabs = parentNodeTabs;
		this.mainTabsContent = parentNodeContent;
		parentNodeTabs.innerHTML = removeAccidentalWhitespace(mainTabs_html);
		var mainTabsTabs = parentNodeTabs.querySelector('.mainTabsTabs');
		var tabList = mainTabsTabs.querySelectorAll('.mainTabsTab');
		if (tabList && tabList.length > 0) {
			var lastTab = tabList[tabList.length - 1];
			cls.add(lastTab, 'mainTabsTabLast');
		}
		mainTabsTabs.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var node = e.target;
			var newTab = undefined;
			while (node && node.tagName != 'BODY') {
				var tabLabel = node.getAttribute('data-bp-mainTab');
				if (tabLabel) {
					newTab = tabLabel;
					break;
				} else {
					node = node.parentNode;
				}
			}
			showTab.bind(this)(newTab, true);
		}.bind(this), false);
		this.currentTab = undefined;
		var initialTab = model.get('nav.mainTab') || 'Course';
		showTab.bind(this)(initialTab, false);
		this.model.watch(/^nav\.mainTab/, sendDataToServer.bind(this, this.model, pathRoot));
	};

	return mainTabs;
});
