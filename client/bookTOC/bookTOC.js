define([
	'text!./bookTOC.html',
	'../util/cls',
	'../util/elem',
	'../util/removeAccidentalWhitespace'
], function(
	bookTOC_html,
	cls,
	elem,
	removeAccidentalWhitespace
) {
	var bookTOCSelectedClass = 'bookTOCSelected';

/*FIXME: do we want to show progress?
	var chapters = [ 'Introduction', 'TakeCharge', 'Step1', 'Step2', 'Step3', 'Step4', 'Step5' ];

	//FIXME: Only showing dummy progress data so far
	var showProgress = function(progressSpan, chapter) {
		progressSpan.innerHTML = '';
		var svg = elem('svg:svg', {
			attrs: { 'class': 'bookTOCProgressSVG', viewBox: '0 0 100 100' }
		}, progressSpan);
		var cx = 50, cy = cx;
		var r1 = 30, r2 = 45;
		var progress = chapter.id == 'overview' ? 1 : (chapter.id == 'intro' ? .8 : 0);
		if (progress > .9999 || progress < .0001) {
			var className = progress > .9999 ? 'bookTOCComplete' : 'bookTOCIncomplete';
			var circle1 = elem('svg:circle', {
				attrs: { 'class': className, cx: cx, cy: cy, r:r2 }}, svg);
			var circle2 = elem('svg:circle', {
				attrs: { 'class': 'bookTOCDonutHole', cx: cx, cy: cy, r:r1 }}, svg);
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
				attrs: { 'class': 'bookTOCIncomplete', d: d1 }}, svg);
			var d2 = 'M'+cx+','+(cy-r1)+
						'V'+(cx-r2)+
						//A rx ry x-axis-rotation large-arc-flag sweep-flag x y
						'A'+r2+','+r2+',-90,'+largeArcFlag2+',1,'+x2+','+y2+
						'L'+x1+','+y1+
						'A'+r1+','+r1+',-90,'+largeArcFlag2+',0,'+cx+','+(cy-r1)+
						'z';
			var path = elem('svg:path', {
				attrs: { 'class': 'bookTOCComplete', d: d2 }}, svg);
		}
		var textOffset = 8;
		var text = elem('svg:text', {
			attrs: { 'class': 'bookTOCProgressLabel', x: cx, y: cy+textOffset }, children: Math.round(progress*100)+'%'}, svg);
	};
	var updateProgress = function() {
		for (var i=0; i<this.courseOutline.chapters.length; i++) {
			var chapter = this.courseOutline.chapters[i];
			var chapterDiv = this.parentNode.querySelector("[data-bp-chapter='"+chapter.id+"']");
			if (chapterDiv) {
				var progressSpan = chapterDiv.querySelector('.bookTOCChapterProgress');
				if (progressSpan) {
					showProgress(progressSpan, chapter);
				}
			}
		}
	};
*/

	var bookTOC = function(bookViewInstance, parentNode, courseOutline) {
		this.bookViewInstance = bookViewInstance;
		this.model = bookViewInstance.model;
		this.parentNode = parentNode;
		this.courseOutline = courseOutline;
		parentNode.innerHTML = removeAccidentalWhitespace(bookTOC_html);
		var bookTOC = parentNode.querySelector('.bookTOC');
		courseOutline.chapters.forEach(function(chapter, i) {
			var bookTOCChapter = elem('div', { attrs: { 'class':'bookTOCChapter', 'data-bp-chapter':chapter.id }}, bookTOC);
/*FIXME: do we want to show progress?
			var bookTOCChapterProgress = elem('span', { attrs: { 'class':'bookTOCChapterProgress' }}, bookTOCChapter);
*/
			var bookTOCChapterLink = elem('a', { attrs: { 'class':'bookTOCChapterTitle', href:'' }, children: chapter.label }, bookTOCChapter);
			if (chapter.modules) {
				var bookTOCModules = elem('div', { attrs: { 'class':'bookTOCModules' }}, bookTOCChapter);
				chapter.modules.forEach(function(mod, i) {
					var bookTOCModule = elem('div', { attrs: { 'class':'bookTOCModule', 'data-bp-module':mod.id }}, bookTOCModules);
					var bookTOCModuleDIV = elem('div', { attrs: { 'class':'bookTOCModuleDIV' }}, bookTOCModule);
					var bookTOCModuleLink = elem('a', { attrs: { 'class':'bookTOCModuleTitle', href:'' }, children: mod.label }, bookTOCModuleDIV);
				});
			}
		});
/*FIXME: do we want to show progress?
		updateProgress.bind(this)();
*/
		bookTOC.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var node = e.target;
			var chapterId = null,
				moduleId = null;
			while (node && node.tagName != 'BODY') {
				if (!moduleId) {
					moduleId = node.getAttribute('data-bp-module');
				}
				chapterId = node.getAttribute('data-bp-chapter');
				if (chapterId) {
					break;
				} else {
					node = node.parentNode;
				}
			}
			if (chapterId && moduleId) {
				var chapter = this.bookViewInstance.findChapterById(chapterId);
				var moduleIndex = this.bookViewInstance.findModuleIndex(chapter, moduleId);
				this.bookViewInstance.showModuleByIndex(chapter, moduleIndex);
			} else if (chapterId) {
				this.bookViewInstance.showChapterById(chapterId);
			}
		}.bind(this), false);
	};

	var p  = bookTOC.prototype;

	p._highlightScrollToModule = function(chapterId, moduleId) {
		var existingHighlights = this.parentNode.querySelectorAll('.'+bookTOCSelectedClass);
		for (var i=0; i<existingHighlights.length; i++) {
			cls.remove(existingHighlights[i], bookTOCSelectedClass);
		}
		if (moduleId) {
			var moduleNode = this.parentNode.querySelector('[data-bp-chapter="'+chapterId+'"] [data-bp-module="'+moduleId+'"]');
			cls.add(moduleNode, bookTOCSelectedClass);
			var newTop = Math.max(moduleNode.offsetTop - (this.parentNode.offsetHeight/2), 0);
			this.parentNode.scrollTop = newTop;
		} else {
			var chapterNode = this.parentNode.querySelector('[data-bp-chapter="'+chapterId+'"]');
			cls.add(chapterNode, bookTOCSelectedClass);
			var newTop = Math.max(chapterNode.offsetTop - (this.parentNode.offsetHeight/2), 0);
			this.parentNode.scrollTop = newTop;
		}
	};

	return bookTOC;
});
