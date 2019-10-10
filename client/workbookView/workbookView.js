define([
	'text!./workbookView.html',
	'../chapterTabs/chapterTabs',
	'../assess/Assessment/Assessment',
	'../fiveSteps/Positioning_Statement/Positioning_Statement',
	'../fiveSteps/Elevator_Pitch/Elevator_Pitch',
	'../fiveSteps/Brand_Strategy/Brand_Strategy',
	'../fiveSteps/Ecosystem_Model/Ecosystem_Model',
	'../fiveSteps/Action_Plan/Action_Plan',
	'text!../assess/Assessment/Assessment_Form.html',
	'text!../fiveSteps/Positioning_Statement/Positioning_Statement_Form.html',
	'text!../fiveSteps/Elevator_Pitch/Elevator_Pitch_Form.html',
	'text!../fiveSteps/Brand_Strategy/Brand_Strategy_Form.html',
	'text!../fiveSteps/Ecosystem_Model/Ecosystem_Model_Form.html',
	'text!../fiveSteps/Action_Plan/Action_Plan_Form.html',
	'../contextHelp/contextHelp',
	'../util/elem',
	'../util/cls',
	'../util/request',
	'../util/removeAccidentalWhitespace',
	'../util/resizeableTextarea',
	'../util/sheetTypeToClass',
	'../util/sheetTypeToHtmlTemplate',
	'../util/updateFormFields',
	'../workbooksMenu/workbooksMenu'
], function(
	workbookView_html,
	chapterTabs,
	Assessment,
	Positioning_Statement,
	Elevator_Pitch,
	Brand_Strategy,
	Ecosystem_Model,
	Action_Plan,
	Assessment_Form_html,
	Positioning_Statement_Form_html,
	Elevator_Pitch_Form_html,
	Brand_Strategy_Form_html,
	Ecosystem_Model_Form_html,
	Action_Plan_Form_html,
	contextHelp,
	elem,
	cls,
	request,
	removeAccidentalWhitespace,
	resizeableTextarea,
	sheetTypeToClass,
	sheetTypeToHtmlTemplate,
	updateFormFields,
	workbooksMenu
) {

	//FIXME: This seems wrong
	var pathRoot = location.pathname;
	if (pathRoot[pathRoot.length-1] != '/') {
		pathRoot += '/';
	}

	var workbookView = function(params, parentNode) {
		this.model = params.model;
		this.viewId = params.viewId;
		this.workbookId = params.workbookId;
		this.sheetType = params.sheetType;
		this.sheetId = params.sheetId;
		if (!this.workbookId) {
			this.workbookId = this.model.getFirstWorkbookId();
			this.model.set('nav.workbookId', this.workbookId);
		}
		if (!this.sheetType) {
			this.sheetType = 'Positioning_Statement';
			this.model.set('nav.currentSheetType['+this.workbookId+']', this.sheetType);
		}
		if (!this.sheetId) {
			this.sheetId = this.model.getFirstSheetId(this.workbookId, this.sheetType);
			this.model.set('nav.currentSheetId['+this.workbookId+']['+this.sheetType+']', this.sheetId);
		}
		var sheet = this.model.sheetById(this.workbookId, this.sheetType, this.sheetId);
		if (!sheet) {
			if (!this.workbookId) {
				var workbook = this.model.newWorkbook();
				this.workbookId = workbook._id;
				this.model.set('nav.workbookId', this.workbookId);
				this.model.set('workbooks['+this.workbookId+']', workbook);
			}
			if (!this.sheetId) {
				sheet = this.model.newSheet(this.workbookId, this.sheetType);
				this.sheetId = sheet._id;
				this.model.set('nav.currentSheetId['+this.workbookId+']['+this.sheetType+']', this.sheetId);
				this.model.set('workbooks['+this.workbookId+'].sheets['+this.sheetType+']['+this.sheetId+']', sheet);
			}
		}
		this.parentNode = parentNode;
		this.parentNode.innerHTML = removeAccidentalWhitespace(workbookView_html);
		var chapterTabsParentNode = this.parentNode.querySelector('.workbookViewTabsTD');
		this.chapterTabs = new chapterTabs(this, this.workbookId, this.sheetType, this.sheetId, chapterTabsParentNode);
		this.sheetParentNode = this.parentNode.querySelector('.workbookViewBody');
		this.module = sheetTypeToClass[this.sheetType];
		if (this.module) {
			this.module.init(this, this.sheetParentNode);
		} else {
			console.error('workbookView - unknown sheetType:'+this.sheetType);
		}
		var formData = this.model.get('workbooks['+this.workbookId+'].sheets['+this.sheetType+']['+this.sheetId+']') || this.model.newSheet(this.workbookId, this.sheetType);
		if (this.module.updateFormFields) {
			// If module has an override routine for updateFormFields, then call it.
			this.module.updateFormFields(this.sheetParentNode, formData);
		} else {
			// Else call the standard updateFormFields routine
			this.updateFormFields(this.sheetParentNode, formData);
		}
		var textareas = this.sheetParentNode.querySelectorAll('textarea');
		for (var i=0; i<textareas.length; i++) {
			resizeableTextarea(textareas[i]);
		}

		var checkClickHelpIcon = function(e) {
			if (cls.has(e.target, 'ContextHelpIcon')) {
				var node = e.target;
				while (node && node.tagName != 'BODY') {
					var helpFieldAttr = node.getAttribute('data-bp-help');
					var formFieldId = node.getAttribute('data-bp-field');
					helpFieldAttr = helpFieldAttr || formFieldId;
					if (helpFieldAttr) {
						if (this.module) {
							var helpFieldNode = this.module.formIdToHelpNode ? this.module.formIdToHelpNode(helpFieldAttr) : null;
							if (!helpFieldNode) {
								helpFieldNode = node.querySelector('.ContextHelpContent');
							}
							if (helpFieldNode) {
								var helpFieldId = this.module.formIdToHelpId ? this.module.formIdToHelpId(helpFieldAttr) : helpFieldAttr;
								this.activateHelpField(helpFieldNode, helpFieldId);
							}
						} else {
							console.error('workbookView - unknown sheetType:'+this.sheetType);
						}
						break;
					} else {
						node = node.parentNode;
					}
				} 
			}
		}.bind(this);
		this.sheetParentNode.addEventListener('click', checkClickHelpIcon, true);

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
			var sid = tokens[0];
			var shortedFormFieldId = tokens[1];
			if (sid == 'Workbook') {	// Initially coded to handle case "Workbook.Title"
				var wIndex = this.model.get('nav.workbookId');
				this.model.set('workbooks['+wIndex+'].'+shortedFormFieldId, formElem.value);
			} else {
				var modelField = this.module.formToModel ? this.module.formToModel(shortedFormFieldId) : null;
				if (modelField && modelField.type == 'arrayItem') {
					this.set(modelField.arrayName+'['+modelField.arrayIndex+']', formElem.value);
				} else if (!modelField) {
					this.set(shortedFormFieldId, formElem.value);
				}
			}
		}.bind(this);
		this.sheetParentNode.addEventListener('blur', valueChanged, false);
		this.sheetParentNode.addEventListener('keyup', valueChanged, false);

		var workbook = this.model.get('workbooks['+this.workbookId+']') || this.model.newWorkbook();
		var workbookName = this.parentNode.querySelector('.workbookName');
		workbookName.value = workbook.Title || '';
		workbookName.addEventListener('blur', valueChanged, false);
		workbookName.addEventListener('keyup', valueChanged, false);

		var workbookIcon = document.querySelector('.workbookIcon');
		workbookIcon.addEventListener('click', function(e) {
			e.preventDefault();
			workbooksMenu.show(workbookIcon, this);
		}.bind(this), false);
	};

	var getFullPropName = function(prop) {
		return 'workbooks['+this.workbookId+'].sheets['+this.sheetType+']['+this.sheetId+'].'+prop;
	};

	var p = workbookView.prototype;

	p.get = function(prop) {
		var fullPropName = getFullPropName.bind(this)(prop);
		return this.model.get(fullPropName);
	};

	p.set = function(prop, value) {
		var fullPropName = getFullPropName.bind(this)(prop);
		this.model.set(fullPropName, value);
	};

	p.changeSheet = function(workbookId, sheetType, sheetId) {
		this.workbookId = workbookId;
		this.sheetType = sheetType;
		this.sheetId = sheetId;
		this.model.set('nav.workbookId', workbookId);
		this.model.set('nav.currentSheetType['+workbookId+']', sheetType);
		this.model.set('nav.currentSheetId['+workbookId+']['+sheetType+']', sheetId);
		var newHelpFieldId = null;
		this.module = sheetTypeToClass[this.sheetType];
		if (this.module) {
			this.module.init(this, this.sheetParentNode);
			var formData = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']') || this.model.newSheet(workbookId, sheetType);
			if (this.module.updateFormFields) {
				// If module has an override routine for updateFormFields, then call it.
				this.module.updateFormFields(this.sheetParentNode, formData);
			} else {
				// Else call the standard updateFormFields routine
				this.updateFormFields(this.sheetParentNode, formData);
			}
			var textareas = this.sheetParentNode.querySelectorAll('textarea');
			for (var i=0; i<textareas.length; i++) {
				resizeableTextarea(textareas[i]);
			}
		} else {
			console.error('workbookView - unknown sheetType:'+this.sheetType);
		}
		var workbook = this.model.get('workbooks['+this.workbookId+']') || this.model.newWorkbook();
		var workbookName = this.parentNode.querySelector('.workbookName');
		workbookName.value = workbook.Title || '';
		this.chapterTabs.update();
	};

	var lastHelpFieldNode = null;
	var lastHelpFieldId = null;

	p.activateHelpField = function(helpFieldNode, helpFieldId) {
		if (helpFieldId == lastHelpFieldId) {
			lastHelpFieldId = lastHelpFieldNode = null;
			contextHelp.hide(function() {
				if (this.module.helpHide) {
					this.module.helpHide(helpFieldId);
				}
			}.bind(this));
		} else {
			lastHelpFieldNode = helpFieldNode;
			lastHelpFieldId = helpFieldId;
			if (this.module.helpShow) {
				this.module.helpShow(helpFieldId);
			}
			contextHelp.show(helpFieldNode, helpFieldId, { workbookView: this, htmlTemplate: sheetTypeToHtmlTemplate[this.sheetType] });
			var contextHelpIconSPAN = helpFieldNode.querySelector('.contextHelpIconSPAN');
			contextHelpIconSPAN.addEventListener('click', function(e) {
				lastHelpFieldId = lastHelpFieldNode = null;
				contextHelp.hide(function() {
					if (this.module.helpHide) {
						this.module.helpHide(helpFieldId);
					}
				}.bind(this));
			}.bind(this), false);
 		}
	};

	p.updateFormFields = function(parentNode, formData) {
		updateFormFields(parentNode, formData, this.module);
	};

	return workbookView;
});
