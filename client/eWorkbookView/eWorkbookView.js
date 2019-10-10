define([
	'text!./eWorkbookView.html',
	'../eWorkbookTOC/eWorkbookTOC',
	'../splitView/splitView',
	'../util/animSlide',
	'../util/cls',
	'../util/removeAccidentalWhitespace'
], function(
	eWorkbookView_html,
	eWorkbookTOC,
	splitView,
	animSlide,
	cls,
	removeAccidentalWhitespace
) {
	var bookDir = '../../../ebook/xhtml/';

	var chapterTitleXref = {
		Positioning_Statement: 'Step 1: Positioning Statement',
		Elevator_Pitch: 'Step 2: Elevator Pitch',
		Brand_Strategy: 'Step 3: Brand Strategy',
		Ecosystem_Model: 'Step 4: Ecosystem Model',
		Action_Plan: 'Step 5: Action Plan',
		Assessment: 'Brand Assessment (optional)'
	};

	var eWorkbookView = function(model, parentNode) {
		this.model = model;
		this.parentNode = parentNode;
		parentNode.innerHTML = removeAccidentalWhitespace(eWorkbookView_html);
		this.eWorkbookViewSlideParent = parentNode.querySelector('.eWorkbookViewSlideParent');
		this.eWorkbookViewSlideInContainerTOC = parentNode.querySelector('.eWorkbookViewSlideInContainerTOC');
		this.eWorkbookViewSlideInContainerCourse = parentNode.querySelector('.eWorkbookViewSlideInContainerCourse');
		this.eWorkbookViewContent = parentNode.querySelector('.eWorkbookViewContent');
		new eWorkbookTOC(this, this.eWorkbookViewSlideInContainerTOC);
		this.splitViewInstance = new splitView(this, this.eWorkbookViewContent);
		var eWorkbookViewHeaderTOCButton = parentNode.querySelector('.eWorkbookViewHeaderTOCButton');
		eWorkbookViewHeaderTOCButton.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.eWorkbookViewSlideInContainerTOC.style.display = '';
			var animClassName = 'eWorkbookViewSlideFromLeftAnim';
			animSlide.fromLeft({
				leftContentDiv: this.eWorkbookViewSlideInContainerTOC,
				animClassName: animClassName,
				animEndCallback: function(e) {
					cls.remove(this.eWorkbookViewSlideInContainerTOC, animClassName);
					this.eWorkbookViewSlideInContainerCourse.style.display = 'none';
				}.bind(this)
			});
		}.bind(this), false);
		this.eWorkbookViewSlideInContainerCourse.style.display = 'none';
	};

	var p = eWorkbookView.prototype;

	p.showChapter = function(chapterName) {
		var eWorkbookViewContent = this.parentNode.querySelector('.eWorkbookViewContent');
		var eWorkbookViewHeaderChapterTitle = this.parentNode.querySelector('.eWorkbookViewHeaderChapterTitle');
		eWorkbookViewHeaderChapterTitle.textContent = chapterTitleXref[chapterName] || '';
		this.eWorkbookViewSlideInContainerCourse.style.display = '';
		if (this.workbookViewInstance) {
			var workbookId = this.model.currentWorkbookId() || this.model.getFirstWorkbookId();
			if (!workbookId) {
				var workbook = this.model.newWorkbook();
				workbookId = workbook._id;
				var workbooks = {};
				workbooks[workbookId] = workbook;
				this.model.set('workbooks', workbooks);
			}
			var sheetType = this.model.currentSheetType(workbookId);
			if (sheetType != chapterName) {
				sheetType = chapterName;
			}
			var sheetId = this.model.currentSheetId(workbookId, sheetType) || this.model.getFirstSheetId(workbookId, sheetType);
			if (!sheetId) {
				var sheet = this.model.newSheet(workbookId, sheetType);
				sheetId = sheet._id;
				var sheets = {};
				sheets[sheetId] = sheet;
				this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']', sheets);
			}
			this.workbookViewInstance.changeSheet(workbookId, sheetType, sheetId);
		}
		var animClassName = 'eWorkbookViewSlideFromRightAnim';
		animSlide.fromRight({
			leftContentDiv: this.eWorkbookViewSlideInContainerTOC,
			animClassName: animClassName,
			animEndCallback: function(e) {
				cls.remove(this.eWorkbookViewSlideInContainerTOC, animClassName);
				this.eWorkbookViewSlideInContainerTOC.style.display = 'none';
			}.bind(this)
		});
	};

	return eWorkbookView;
});
