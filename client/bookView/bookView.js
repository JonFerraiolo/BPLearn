define([
	'text!./bookView.html',
	'text!./course_outline.json',
	'text!./chapters/intro/intro.html',
	'text!./chapters/tc/tc_assessment.html',
	'text!./chapters/tc/tc_benefits.html',
	'text!./chapters/tc/tc_cake_icing.html',
	'text!./chapters/tc/tc_five_steps.html',
	'text!./chapters/tc/tc_journey.html',
	'text!./chapters/tc/tc_myths.html',
	'text!./chapters/tc/tc_political.html',
	'text!./chapters/tc/tc_throughout_life.html',
	'text!./chapters/tc/tc_what_is.html',
	'text!./chapters/tc/tc_your_goal.html',
	'text!./chapters/posn/posn_posn_stmt.html',
	'text!./chapters/posn/posn_your_goal.html',
	'text!./chapters/posn/posn_target.html',
	'text!./chapters/posn/posn_problem.html',
	'text!./chapters/posn/posn_category.html',
	'text!./chapters/posn/posn_value_prop.html',
	'text!./chapters/posn/posn_differentiation.html',
	'text!./chapters/posn/posn_evidence.html',
	'text!./chapters/posn/posn_iterate.html',
	'../bookTOC/bookTOC',
	'../assess/Assessment/Assessment',
	'../fiveSteps/Positioning_Statement/Positioning_Statement',
	'../fiveSteps/Elevator_Pitch/Elevator_Pitch',
	'../fiveSteps/Brand_Strategy/Brand_Strategy',
	'../fiveSteps/Ecosystem_Model/Ecosystem_Model',
	'../fiveSteps/Action_Plan/Action_Plan',
	'../util/animSlide',
	'../util/elem',
	'../util/cls',
	'../util/resizeableTextarea',
	'../util/updateFormFields',
	'../util/removeAccidentalWhitespace'
], function(
	bookView_html,
	course_outline_json,
	intro,
	tc_assessment,
	tc_benefits,
	tc_cake_icing,
	tc_five_steps,
	tc_journey,
	tc_myths,
	tc_political,
	tc_throughout_life,
	tc_what_is,
	tc_your_goal,
	posn_posn_stmt,
	posn_your_goal,
	posn_target,
	posn_problem,
	posn_category,
	posn_value_prop,
	posn_differentiation,
	posn_evidence,
	posn_iterate,
	bookTOC,
	Assessment,
	Positioning_Statement,
	Elevator_Pitch,
	Brand_Strategy,
	Ecosystem_Model,
	Action_Plan,
	animSlide,
	elem,
	cls,
	resizeableTextarea,
	updateFormFields,
	removeAccidentalWhitespace
) {
	var bookDir = '../../../ebook/xhtml/';
	var chapterDir = '../../../client/bookView/chapters/';
	var CourseScriptControlsArrowVisibleClass = 'CourseScriptControlsArrowVisible';

	var moduleXref = {
		'intro': intro,
		'tc_assessment': tc_assessment,
		'tc_benefits': tc_benefits,
		'tc_cake_icing': tc_cake_icing,
		'tc_five_steps': tc_five_steps,
		'tc_journey': tc_journey,
		'tc_myths': tc_myths,
		'tc_political': tc_political,
		'tc_throughout_life': tc_throughout_life,
		'tc_what_is': tc_what_is,
		'tc_your_goal': tc_your_goal,
		'posn_posn_stmt': posn_posn_stmt,
		'posn_your_goal': posn_your_goal,
		'posn_target': posn_target,
		'posn_problem': posn_problem,
		'posn_category': posn_category,
		'posn_value_prop': posn_value_prop,
		'posn_differentiation': posn_differentiation,
		'posn_evidence': posn_evidence,
		'posn_iterate': posn_iterate
	};

	var chapterIdToClass = {
		'assess': Assessment,
		'posn': Positioning_Statement,
		'ep': Elevator_Pitch,
		'bs': Brand_Strategy,
		'eco': Ecosystem_Model,
		'ap': Action_Plan
	};

	var chapterIdToSheetType = {
		'assess': 'Assessment',
		'posn': 'Positioning_Statement',
		'ep': 'Elevator_Pitch',
		'bs': 'Brand_Strategy',
		'eco': 'Ecosystem_Model',
		'ap': 'Action_Plan'
	};

	var sentenceStartTimes = null;
	var scriptHighlightInterval = null;
	var scriptContent = null;

	var clearScriptHighlights = function() {
		if (sentenceStartTimes) {
			for (var i in sentenceStartTimes) {
				cls.remove(sentenceStartTimes[i], 'CourseScriptHighlight');
			}
		}
	};
	var updateScriptHighlightsLastNode = null;
	var updateScriptHighlights = function() {
		if (window.BrandingPays.youtube.player && sentenceStartTimes) {
			var currentVideoSeconds = window.BrandingPays.youtube.player.getCurrentTime();
			clearScriptHighlights();
			if (sentenceStartTimes) {
				var foundNode = null;
				for (var i in sentenceStartTimes) {
					var seconds = i-0;	// convert to number
					if (seconds <= currentVideoSeconds) {
						foundNode = sentenceStartTimes[i];
					} else {
						break;
					}
				}
				if (foundNode) {
					cls.add(foundNode, 'CourseScriptHighlight');
					if (scriptContent && foundNode != updateScriptHighlightsLastNode) {
						updateScriptHighlightsLastNode = foundNode;
						var newTop = Math.max(foundNode.offsetTop - scriptContent.offsetTop - 20, 0);
						scriptContent.scrollTop = newTop;
					}
				}
				if (!scriptHighlightInterval) {
					scriptHighlightInterval = setInterval(updateScriptHighlights, 100);
				}
			}
		}
	};
	var pauseScriptHighlights = function() {
		if (scriptHighlightInterval) {
			clearInterval(scriptHighlightInterval);
			scriptHighlightInterval = null;
		}
	};

	var onStopVideo = function() {
		sentenceStartTimes = null;
		scriptContent = null;
		if (scriptHighlightInterval) {
			clearInterval(scriptHighlightInterval);
			scriptHighlightInterval = null;
		}
		delete window.BrandingPays.youtube.onPlayingCallback;
		delete window.BrandingPays.youtube.onPauseCallback;
		delete window.BrandingPays.youtube.onEndCallback;
		delete window.BrandingPays.youtube.onStopVideoCallback;
	};

	var CourseOutline = JSON.parse(course_outline_json);

	var fixVideos = function(CourseVideoVideo, CourseScriptContent, chapterId, moduleId) {
		var videoId = CourseVideoVideo.getAttribute('data-bp-videoId');
		var size = CourseVideoVideo.getAttribute('data-bp-size');
		var sizes = size.split('x');
		var w = sizes[0];
		var h = sizes[1];
		if (videoId && size) {
			var id = 'video_'+moduleId;
			var videoContentOuterWrapperDIV = elem('div', {
				attrs: { 
					'class': 'videoContentOuterWrapperDIV', 
					'data-bp-moduleId': moduleId, 
					'data-bp-videoId': videoId, 
					'data-bp-size': size
				},
				styles: { width: w+'px', height: h+'px', position: 'relative' }
			}, CourseVideoVideo);
			var videoContent = elem('div', { 
				attrs: { id: id, 'class': 'videoContent' },
				styles: { width: w+'px', height: h+'px' }
			}, videoContentOuterWrapperDIV);
			var videoContentThumb = elem('span', { 
				attrs: { 'class': 'videoContentThumb videoContentThumb_'+moduleId },
				styles: { width: w+'px', height: h+'px' }
			}, videoContentOuterWrapperDIV);
			var videoPlayButton = elem('span', { 
				attrs: { 'class': 'videoPlayButton' },
				styles: { width: w+'px', height: h+'px' }
			}, videoContentOuterWrapperDIV);
			videoContentOuterWrapperDIV.addEventListener('click', function(CourseScriptContent, e) {
				var videoContentOuterWrapperDIV = e.currentTarget;
				var videoContentThumb = videoContentOuterWrapperDIV.querySelector('.videoContentThumb');
				var videoPlayButton = videoContentOuterWrapperDIV.querySelector('.videoPlayButton');
				videoContentThumb.style.display = 'none';
				videoPlayButton.style.display = 'none';
				var moduleId = videoContentOuterWrapperDIV.getAttribute('data-bp-moduleId');
				var id = 'video_'+moduleId;
				var videoId = videoContentOuterWrapperDIV.getAttribute('data-bp-videoId');
				var size = videoContentOuterWrapperDIV.getAttribute('data-bp-size');
				if (id && videoId && size && window.BrandingPays.youtube.ready) {
					var sizes = size.split('x');
					var w = sizes[0];
					var h = sizes[1];
					if (window.BrandingPays.youtube.player) {
						window.stopVideo();
					}
					scriptContent = CourseScriptContent;
					window.BrandingPays.youtube.onPlayingCallback = updateScriptHighlights;
					window.BrandingPays.youtube.onPauseCallback = pauseScriptHighlights;
					window.BrandingPays.youtube.onEndCallback = clearScriptHighlights;
					window.BrandingPays.youtube.onStopVideoCallback = onStopVideo;
					window.BrandingPays.youtube.player = new window.YT.Player(id, {
						height: h,
						width: w,
						videoId: videoId,
						events: {
							'onReady': window.onPlayerReady,
							'onStateChange': window.onPlayerStateChange
						}
					});
				} else {
					console.error('Unable to play video. id='+id+', videoId='+videoId+', size:'+size+', youtube.ready='+(window.BrandingPays.youtube.ready?'true':'false'));
				}
			}.bind(this, CourseScriptContent), false);
		} else {
			console.error('Unable to prepare video. videoId='+videoId+', size:'+size);
		}
	};

	var fixScriptControls = function(parentNode, CourseScriptControls, chapterId, moduleId) {
		var CourseScriptContent = CourseScriptControls.parentNode.querySelector('.CourseScriptContent');
		if (CourseScriptContent) {
			if (CourseScriptControls.childNodes.length == 0) {
				var div = elem('div', { attrs: { 'class': 'CourseScriptControlsDIV' }}, CourseScriptControls);
				var a = elem('a', { attrs: { 'class': 'CourseScriptControlsLink' }}, div);
				var arrow = elem('span', { attrs: { 'class': 'CourseScriptControlsArrow' } }, a);
				var label = elem('span', { attrs: { 'class': 'CourseScriptControlsLabel' }, children: 'Transcript' }, a);
				CourseScriptControls.addEventListener('click', function(CourseScriptContent, arrow, e) {
					e.preventDefault();
					e.stopPropagation();
					if (CourseScriptContent.style.display == 'none') {
						CourseScriptContent.style.display = '';
						cls.add(arrow, CourseScriptControlsArrowVisibleClass);
					} else {
						CourseScriptContent.style.display = 'none';
						cls.remove(arrow, CourseScriptControlsArrowVisibleClass);
					}
				}.bind(this, CourseScriptContent, arrow), false);
			}
			CourseScriptContent.style.display = 'none';
			var startTimeNodes = CourseScriptContent.querySelectorAll('[data-bp-start-time]');
			if (!window.BrandingPays.youtube) {
				window.BrandingPays.youtube = {};
			}
			if (!sentenceStartTimes) {
				sentenceStartTimes = {};
			}
			for (var i=0; i<startTimeNodes.length; i++) {
				var startTimeNode = startTimeNodes[i];
				var startTime = startTimeNode.getAttribute('data-bp-start-time');
				sentenceStartTimes[startTime] = startTimeNode;
			}
			CourseScriptContent.addEventListener('click', function(sentenceStartTimes, e) {
				e.preventDefault();
				e.stopPropagation();
				if (window.BrandingPays.youtube.player) {
					var startTime = e.target.getAttribute('data-bp-start-time');
					if (startTime) {
						startTime = startTime - 0;	// convert to number
						window.BrandingPays.youtube.player.seekTo(startTime);
					}
				}
			}.bind(this, sentenceStartTimes), false);
		}
	};

	/**
	 * Called whenever a form field on screen has a new keystroke (keyup) event or blur event
	 * Updates the model
	 * @param {object} e Event object
	 */
	var valueChanged = function(e) {
		var formElem = e.target;
		if (formElem.tagName != 'TEXTAREA' && formElem.tagName != 'INPUT') {
			return;
		}
		var node = formElem;
		var formFieldContainer, formFieldId;
		while (node && node.tagName != 'BODY') {
			formFieldId = node.getAttribute('data-bp-field');
			if (formFieldId) {
				formFieldContainer = node;
				break;
			} else {
				node = node.parentNode;
			}
		}
		if (!formFieldContainer) {
			console.error('valueChanged error. Could not find container for input element. formElem.outerHTML='+formElem.outerHTML);
			return;
		}
		var tokens = formFieldId.split('.');
		var sType = tokens[0];
		var shortedFormFieldId = tokens[1];
		var workbookId = this.model.get('nav.workbookId');
		var sheetType = sType;
		var sheetId = this.model.currentSheetId(workbookId, sheetType);
		if (sType == 'Workbook') {	// Initially coded to handle case "Workbook.Title"
			this.model.set('workbooks['+workbookId+'].'+shortedFormFieldId, formElem.value);
		} else {
			var modelField = this.  ggomodule.formToModel ? this.module.formToModel(shortedFormFieldId) : null;
			if (modelField && modelField.type == 'arrayItem') {
				this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+'].'+modelField.arrayName+'['+modelField.arrayIndex+']', formElem.value);
			} else if (!modelField) {
				this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+'].'+shortedFormFieldId, formElem.value);
			}
		}
	};

	var bookView = function(model, parentNode) {
		this.model = model;
		this.parentNode = parentNode;
		parentNode.innerHTML = removeAccidentalWhitespace(bookView_html);
		this.bookViewSlideParent = parentNode.querySelector('.bookViewSlideParent');
		this.bookViewSlideInContainerTOC = parentNode.querySelector('.bookViewSlideInContainerTOC');
		this.bookViewSlideInContainerCourse = parentNode.querySelector('.bookViewSlideInContainerCourse');
		this.bookTOC = new bookTOC(this, this.bookViewSlideInContainerTOC, CourseOutline);
		var chapterId = this.model.get('nav.chapterId') || 'intro';	//FIXME: should start with very first chapter
		var moduleId = this.model.get('nav.moduleId');	//FIXME: should start with very first chapter
		if (moduleId) {
			var chapter = this.findChapterById(chapterId);
			var moduleIndex = this.findModuleIndex(chapter, moduleId);
			this.showModuleByIndex(chapter, moduleIndex);
		} else {
			this.showChapterById(chapterId);
		}
	};

	var p = bookView.prototype;

	p.showChapterById = function(chapterId) {
		updateScriptHighlightsLastNode = null;
		if (window.stopVideo) {
			window.stopVideo();
		}
		var bookViewChapterContent = this.parentNode.querySelector('.bookViewChapterContent');
		var found = false;
		this.model.set('nav.chapterId', chapterId);
		bookViewChapterContent.style.display = '';
		var chapterIndex = this.findChapterIndex(chapterId);
		var chapter = (typeof chapterIndex == 'number' && CourseOutline.chapters[chapterIndex]) || undefined;
		var modul = (chapter && chapter.modules) ? chapter.modules[0] : undefined;
		var moduleId = modul && modul.id;
		if (chapter) {
			this._prepareModuleContent(bookViewChapterContent, chapter, moduleId);
			this.bookTOC._highlightScrollToModule(chapter.id, moduleId);
		}
	};

	p.showModuleByIndex = function(chapter, moduleIndex) {
		updateScriptHighlightsLastNode = null;
		if (window.stopVideo) {
			window.stopVideo();
		}
		var bookViewChapterContent = this.parentNode.querySelector('.bookViewChapterContent');
		var modul = chapter.modules[moduleIndex];
		this.model.set('nav.chapterId', chapter.id);
		var moduleId = modul && modul.id;
		this.model.set('nav.moduleId', moduleId);
		this._prepareModuleContent(bookViewChapterContent, chapter, moduleId);
		this.bookTOC._highlightScrollToModule(chapter.id, moduleId);
	};

	p._prepareModuleContent = function(parentNode, chapter, moduleId) {
		var contentId = moduleId || chapter.id;
		var sheetClass = chapterIdToClass[chapter.id];
		var content = moduleXref[contentId];
		if (!content) {
			return;
		}
		parentNode.innerHTML = removeAccidentalWhitespace(content)
			.replace(/\.\.\/images\//g, 'client/bookView/chapters/images/');
		var CourseVideoVideos = parentNode.querySelectorAll('.CourseVideoVideo');
		var CourseScriptControls = parentNode.querySelectorAll('.CourseScriptControls');
		var CourseScriptContents = parentNode.querySelectorAll('.CourseScriptContent');
		for (var i=0; i<CourseScriptControls.length; i++) {
			fixScriptControls(parentNode, CourseScriptControls[i], chapter.id, moduleId);
		}
		for (var i=0; i<CourseVideoVideos.length; i++) {
			fixVideos(CourseVideoVideos[i], CourseScriptContents[i], chapter.id, moduleId);
		}
		var workbookId = this.model.get('nav.workbookId');
		var sheetType = chapterIdToSheetType[chapter.id];
		var sheetId = this.model.currentSheetId(workbookId, sheetType);
		var formData = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']') || this.model.newSheet(workbookId, sheetType);
		if (sheetClass && sheetClass.updateFormFields) {
			// If module has an override routine for updateFormFields, then call it.
			sheetClass.updateFormFields(parentNode, formData);
		} else {
			// Else call the standard updateFormFields routine
			updateFormFields(parentNode, formData, sheetClass);
		}
		var textareas = parentNode.querySelectorAll('textarea');
		for (var i=0; i<textareas.length; i++) {
			resizeableTextarea(textareas[i]);
		}
		this.module = chapterIdToClass[chapter.id];
		parentNode.addEventListener('blur', valueChanged.bind(this), false);
		parentNode.addEventListener('keyup', valueChanged.bind(this), false);
	};

	p.findChapterById = function(chapterId) {
		for (var i=0; i<CourseOutline.chapters.length; i++) {
			var chapter = CourseOutline.chapters[i];
			if (chapter.id == chapterId) {
				return chapter;
			}
		}
	};

	p.findChapterIndex = function(chapterId) {
		for (var i=0; i<CourseOutline.chapters.length; i++) {
			var chapter = CourseOutline.chapters[i];
			if (chapter.id == chapterId) {
				return i;
			}
		}
	};

	p.findModuleIndex = function(chapter, moduleId) {
		for (var i=0; i<chapter.modules.length; i++) {
			var modul = chapter.modules[i];
			if (modul.id == moduleId) {
				return i;
			}
		}
	};

	return bookView;
});
