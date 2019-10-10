define([
	'../workbooksMenu/workbooksMenu',
	'text!./eWorkbookTOC.html',
	'../util/sheetTypeToClass',
	'../util/elem',
	'../util/removeAccidentalWhitespace',
	'../util/sheetTypeToHtmlTemplate',
	'../util/updateFormFields'
], function(
	workbooksMenu,
	eWorkbookTOC_html,
	sheetTypeToClass,
	elem,
	removeAccidentalWhitespace,
	sheetTypeToHtmlTemplate,
	updateFormFields
) {
	var chapters = [ 'MyStory', 'Introduction', 'Step1', 'Step2', 'Step3', 'Step4', 'Step5' ];

	//FIXME: Only showing dummy progress data so far
	var showProgress = function(progressSpan, chapter) {
		progressSpan.innerHTML = '';
		var svg = elem('svg:svg', {
			attrs: { 'class': 'eWorkbookTOCProgressSVG', viewBox: '0 0 100 100' }
		}, progressSpan);
		var cx = 50, cy = cx;
		var r1 = 30, r2 = 45;
		var progress = chapter == 'MyStory' ? 1 : (chapter == 'Introduction' ? .8 : 0);
		if (progress > .9999 || progress < .0001) {
			var className = progress > .9999 ? 'eWorkbookTOCComplete' : 'eWorkbookTOCIncomplete';
			var circle1 = elem('svg:circle', {
				attrs: { 'class': className, cx: cx, cy: cy, r:r2 }}, svg);
			var circle2 = elem('svg:circle', {
				attrs: { 'class': 'eWorkbookTOCDonutHole', cx: cx, cy: cy, r:r1 }}, svg);
		} else {
			var angle = 360 * progress;
			var radians = (angle-90) * Math.PI / 180;
			var largeArcFlag1 = angle > 180 ? 0 : 1;
			var largeArcFlag2 = angle > 180 ? 1 : 0;
			var x1 = cx + Math.cos(radians) * r1;
			var y1 = cy + Math.sin(radians) * r1;
			var x2 = cx + Math.cos(radians) * r2;
			var y2 = cy + Math.sin(radians) * r2;
			var d1 = 'M'+cx+','+(cy-r1)+
						'V'+(cx-r2)+
						//A rx ry x-axis-rotation large-arc-flag sweep-flag x y
						'A'+r2+','+r2+',-90,'+largeArcFlag1+',0,'+x2+','+y2+
						'L'+x1+','+y1+
						'A'+r1+','+r1+',-90,'+largeArcFlag1+',1,'+cx+','+(cy-r1)+
						'z';
			var path = elem('svg:path', {
				attrs: { 'class': 'eWorkbookTOCIncomplete', d: d1 }}, svg);
			var d2 = 'M'+cx+','+(cy-r1)+
						'V'+(cx-r2)+
						//A rx ry x-axis-rotation large-arc-flag sweep-flag x y
						'A'+r2+','+r2+',-90,'+largeArcFlag2+',1,'+x2+','+y2+
						'L'+x1+','+y1+
						'A'+r1+','+r1+',-90,'+largeArcFlag2+',0,'+cx+','+(cy-r1)+
						'z';
			var path = elem('svg:path', {
				attrs: { 'class': 'eWorkbookTOCComplete', d: d2 }}, svg);
		}
		var textOffset = 8;
		var text = elem('svg:text', {
			attrs: { 'class': 'eWorkbookTOCProgressLabel', x: cx, y: cy+textOffset }, children: Math.round(progress*100)+'%'}, svg);
	};
	var updateProgress = function() {
		for (var i=0; i<chapters.length; i++) {
			var chapter = chapters[i];
			var chapterDiv = this.parentNode.querySelector("[data-bp-chapter='"+chapter+"']");
			if (chapterDiv) {
				var progressSpan = chapterDiv.querySelector('.eWorkbookTOCChapterProgress');
				if (progressSpan) {
					showProgress(progressSpan, chapter);
				}
			}
		}
	};

	var eWorkbookTOC = function(bookViewInstance, parentNode) {
		this.bookViewInstance = bookViewInstance;
		this.model = bookViewInstance.model;
		this.parentNode = parentNode;
		parentNode.innerHTML = removeAccidentalWhitespace(eWorkbookTOC_html);
		updateProgress.bind(this)();
		var eWorkbookTOC = parentNode.querySelector('.eWorkbookTOC');
		eWorkbookTOC.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var node = e.target;
			var chapterName = null;
			while (node && node.tagName != 'BODY') {
				chapterName = node.getAttribute('data-bp-chapter');
				if (chapterName) {
					break;
				} else {
					node = node.parentNode;
				}
			}
			if (chapterName) {
				this.bookViewInstance.showChapter(chapterName);
			}
		}.bind(this), false);

		var workbookId = this.model.get('nav.workbookId');
		var workbook = (workbookId && this.model.get('workbooks['+workbookId+']')) || this.model.newWorkbook();
		this.eWorkbookTOCName = parentNode.querySelector('.eWorkbookTOCName');
		this.eWorkbookTOCName.value = (workbook && workbook.Title) || '';
		var workbookNameChanged = function(e) {
			var workbookId = this.model.get('nav.workbookId');
			this.model.set('workbooks['+workbookId+'].Title', eWorkbookTOCName.value);
		}.bind(this);
		this.eWorkbookTOCName.addEventListener('change', workbookNameChanged, false);
		this.eWorkbookTOCName.addEventListener('keyup', workbookNameChanged, false);

		var eWorkbookTOCIcon = parentNode.querySelector('.eWorkbookTOCIcon');
		eWorkbookTOCIcon.addEventListener('click', function(e) {
			e.preventDefault();
			workbooksMenu.show(eWorkbookTOCIcon, this);
		}.bind(this), false);
	};

	var p = eWorkbookTOC.prototype;

	p.updateFormFields = function(parentNode, formData) {
		var workbookId = this.model.currentWorkbookId();
		var sheetType = this.model.currentSheetType(workbookId);
		var module = sheetTypeToClass[sheetType];
		updateFormFields(parentNode, formData, module);
	};

	p.changeSheet = function(workbookId, sheetType, sheetId) {
		this.model.set('nav.workbookId', workbookId);
		var workbook = this.model.get('workbooks['+workbookId+']') || this.model.newWorkbook();
		this.eWorkbookTOCName.value = (workbook && workbook.Title) || '';
	};

	return eWorkbookTOC;
});
