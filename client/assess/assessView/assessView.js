define([
	'text!./assessView.html',
	'../Assessment/Assessment',
	'../../contextHelp/contextHelp',
	'../../util/request',
	'../../util/cls',
	'../../util/removeAccidentalWhitespace',
	'../../util/sheetTypeToHtmlTemplate'
], function(
	assessView_html,
	Assessment,
	Assessment_Form_html,
	contextHelp,
	request,
	cls,
	removeAccidentalWhitespace,
	sheetTypeToHtmlTemplate
) {

	//FIXME: This seems wrong
	var pathRoot = location.pathname.substr(0, location.pathname.lastIndexOf('/assessment')+1);

	var assessView = function(model, invitationId, parentNode) {
		this.model = model;
		this.parentNode = parentNode;
		this.invitationId = invitationId;
		this.sheetType = 'Assessment';
		this.module = Assessment;
		parentNode.innerHTML = removeAccidentalWhitespace(assessView_html);
		this.sheetParentNode = parentNode.querySelector('.assessViewTD_workbook');
/*FIXME: remove this?
		this.helpViewParentNode = parentNode.querySelector('.assessViewTD_help');
		this.helpViewInstance = new helpView(model, this.helpViewParentNode);
		var showHelpField = function(e) {
			var node = e.target;
			while (node && node.tagName != 'BODY') {
				var formFieldId = node.getAttribute('data-bp-field');
				if (formFieldId) {
					this.activateHelpField(formFieldId);
					break;
				} else {
					node = node.parentNode;
				}
			} 
		}.bind(this);
		this.sheetParentNode.addEventListener('focus', showHelpField, true);
		this.sheetParentNode.addEventListener('click', showHelpField, true);
*/
/*
		var checkClickHelpIcon = function(e) {
			if (cls.has(e.target, 'ContextHelpIcon')) {
				var node = e.target;
				while (node && node.tagName != 'BODY') {
					var formFieldId = node.getAttribute('data-bp-field');
					if (formFieldId) {
						if (this.module) {
							var helpFieldNode = node.querySelector('.ContextHelpContent');
							if (helpFieldNode) {
								var helpFieldId = this.module.formIdToHelpId ? this.module.formIdToHelpId(formFieldId) : formFieldId;
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
*/
		//FIXME: duplicate logic in workbookView
		var checkClickHelpIcon = function(e) {
			if (cls.has(e.target, 'ContextHelpIcon')) {
				var node = e.target;
				while (node && node.tagName != 'BODY') {
					var formFieldId = node.getAttribute('data-bp-field');
					if (formFieldId) {
						if (this.module) {
							var helpFieldNode = this.module.formIdToHelpNode ? this.module.formIdToHelpNode(formFieldId) : null;
							if (!helpFieldNode) {
								helpFieldNode = node.querySelector('.ContextHelpContent');
							}
							if (helpFieldNode) {
								var helpFieldId = this.module.formIdToHelpId ? this.module.formIdToHelpId(formFieldId) : formFieldId;
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


		Assessment.init(this, this.sheetParentNode);
		this.updateFormFields();
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
			this.model.set('Assessment.'+shortedFormFieldId, formElem.value);
		}.bind(this);
		this.sheetParentNode.addEventListener('blur', valueChanged, true);
		this.sheetParentNode.addEventListener('keyup', valueChanged, true);

		model.watch(/^Assessment.*/, function(oldValue, newValue) {
			var payload = {
				data: this.model.get(''),
				params: undefined
			};
			request({
				url: pathRoot+'xhr/assessmentFeedback/'+this.invitationId,
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload, null, '\t')
			}, function(status, responseText) {
				if (status === 200) {
					// Send socket message to the server so that server can emit messages
					// to other browser sessions corresponding to the same email
					//FIXME: Need to figure out what to do with sockets
					//window.BrandingPays.socket.emit('dataUpdate', {uniqId:window.BrandingPays.uniqId});
				} else {
					console.error('xhr/data unexpected response. status='+status+', responseText='+responseText);
				}
			});
		}.bind(this));
	};

	var p = assessView.prototype;

	var lastHelpFieldNode = null;
	var lastHelpFieldId = null;

	//FIXME: duplicate of workbookView
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

	p.updateFormFields = function() {
		var formFieldContainers = this.sheetParentNode.querySelectorAll('[data-bp-field]');
		for (var i=0; i<formFieldContainers.length; i++) {
			var formFieldContainer = formFieldContainers[i];
			var formFieldId = formFieldContainer.getAttribute('data-bp-field');
			var value = this.model.get(formFieldId);
			var formElem = formFieldContainer.querySelector("textarea") || formFieldContainer.querySelector("input");
			if (formElem) {
				formElem.value = value || '';
			}
		}
	};

	return assessView;
});
