define([
	'text!./Assessment_UI.html',
	'text!./Assessment_Form.html',
	'text!./finalizeSuccess.html',
	'../../modal/popup',
	'../../util/request',
	'../../util/elem',
	'../../util/cls',
	'../assessInviteEmail/assessInviteEmail',
	'../../registerLogin/validateRegFields',
	'../../util/removeAccidentalWhitespace'
], function(
	Assessment_UI_html,
	Assessment_Form_html,
	finalizeSuccess_html,
	popup,
	request,
	elem,
	cls,
	assessInviteEmail,
	validateRegFields,
	removeAccidentalWhitespace
) {
	//FIXME: This seems wrong
	var pathRoot = (location.pathname == '/') ? '/' : location.pathname.substr(0, location.pathname.lastIndexOf('/')+1);

	//FIXME: Need to ensure dueDate is in future

	var defaultEmailText = ''+
		'Hi {{INVITEE_FIRSTNAME}},\n\n'+
		'I am using the BrandingPays(TM) Online Tools to improve my personal brand and advance my career. '+
		'It should take just a few minutes - '+
		'just click on the link below:\n\n'+
		'{{FEEDBACK_URL}}\n\n'+
		'Please provide feedback by {{DUEDATE}}.\n\n'+
		'Thank you,\n\n'+
		'{{MY_FIRSTNAME}} {{MY_LASTNAME}}\n\n'+
		'{{MY_EMAIL}}'+
		'';

	var zeroPad2 = function(value) {
		return value<10 ? '0'+value : value;
	};

	return {
		/**
		 * Initialize an Assessment form
		 * @param {object} workbookView The workbookView that will be parent of the form
		 * @param {Element} parentNode The element into which the form should be stuffed as innerHTML
		 */
		init: function(workbookView, parentNode) {
			this.workbookView = workbookView;
			this.model = workbookView.model;
			this.parentNode = parentNode;
			// true if user is providing feedback via special page for providing assessment feedback
			var inviteeFeedbackPage = cls.has(document.body, 'assessmentFeedback');	
			var workbookId = this.model.currentWorkbookId();
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var Assessment = this.Assessment = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']');
			var completedUnfrozen = false;
			if (Assessment && !Assessment._consolidated && Assessment._dueDate) {
				var nowTime = new Date().getTime();
				//FIXME: Need to store user's timezone
				var timeZone = Assessment._timeZone || '-07:00';
				var dueTime = (new Date(Assessment._dueDate + 'T23:59:59.000' + timeZone)).getTime();
				if (nowTime > dueTime) {
					completedUnfrozen = true;
				}
			}
			var dueDate = (Assessment && Assessment._dueDate) || '';
			var numInviteesEmailSent = 0, numRespondees = 0;
			if (Assessment && Assessment._inviteesEmailSent) {
				Assessment._inviteesEmailSent.forEach(function(invitee) {
					numInviteesEmailSent++;
					if (invitee.anyFeedback) {
						numRespondees++;
					}
				});
			}

			parentNode.innerHTML = removeAccidentalWhitespace(
					Assessment_UI_html
						.replace(/\{\{ASSESSMENT_FORM\}\}/g, Assessment_Form_html)
						.replace(/\{\{DUEDATE\}\}/g, (new Date(dueDate)).toDateString())
						.replace(/\{\{NUM_INVITEES\}\}/g, numInviteesEmailSent)
						.replace(/\{\{NUM_RESPONDEES\}\}/g, numRespondees)
				);

			var AssessmentInviter = parentNode.querySelector('.AssessmentInviter');
			// When this is called as part of assessment feedback UI, then the model will have
			// an "inviter" value. If not, then we are in the regular UI, and use the user object
			var inviter = workbookView.model.get('inviter');
			if (!inviter) {
				inviter = window.BrandingPays.user;

			}
			AssessmentInviter.textContent = inviter.firstName + ' ' + inviter.lastName;

			var AssessmentFinalizeBUTTON = parentNode.querySelector('.AssessmentFinalizeBUTTON');
			AssessmentFinalizeBUTTON.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				var body = { workbookId: workbookId, sheetId: sheetId };
				request({
					method: 'POST',
					url: pathRoot+'xhr/consolidateFeedback',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body, null, '\t')
				}, function(status, responseText) {
					if (status == 200) {
						popup.show({
							content: finalizeSuccess_html,
							hideCallback: function() {
								location.reload();
							}
						});
						setTimeout(function() {
							popup.hide();
						}, 5000);
					} else {
						alert('Error in finalizing the assessment. Please send email to info@brandingpays.com');
					}
				});
			}, false);

			var AssessmentTabs = parentNode.querySelector('.AssessmentTabs');
			var AssessmentAbout = parentNode.querySelector('.AssessmentAbout');
			var AssessmentExplanationNew = parentNode.querySelector('.AssessmentExplanationNew');
			var AssessmentExplanationPending = parentNode.querySelector('.AssessmentExplanationPending');
			var AssessmentExplanationCompletedUnfrozen = parentNode.querySelector('.AssessmentExplanationCompletedUnfrozen');
			var AssessmentExplanationCompletedFrozen = parentNode.querySelector('.AssessmentExplanationCompletedFrozen');
			var AssessmentInvitations = parentNode.querySelector('.AssessmentInvitations');
			var AssessmentQuestionnaire = parentNode.querySelector('.AssessmentQuestionnaire');
			var AssessmentForm = parentNode.querySelector('.AssessmentForm');
			var AssessmentTabsDivider = parentNode.querySelector('.AssessmentTabsDivider');
			var AssessmentQuestionnaireTitleSelf = parentNode.querySelector('.AssessmentQuestionnaireTitleSelf');
			var AssessmentQuestionnaireTitleResults = parentNode.querySelector('.AssessmentQuestionnaireTitleResults');
			var AssessmentNoInvitationsYet = parentNode.querySelector('.AssessmentNoInvitationsYet');
			var AssessmentNotFinalized = parentNode.querySelector('.AssessmentNotFinalized');
			var readOnly = false;
			AssessmentExplanationNew.style.display = 'none';
			AssessmentExplanationPending.style.display = 'none';
			AssessmentExplanationCompletedUnfrozen.style.display = 'none';
			AssessmentExplanationCompletedFrozen.style.display = 'none';
			AssessmentNoInvitationsYet.style.display = 'none';
			AssessmentNotFinalized.style.display = 'none';
			AssessmentForm.style.display = 'none';
			if (inviteeFeedbackPage) {
				AssessmentQuestionnaire.style.display = '';
				AssessmentForm.style.display = '';
				AssessmentTabs.style.display = 'none';
				AssessmentAbout.style.display = 'none';
			} else if (Assessment && Assessment._consolidated) {
				AssessmentExplanationCompletedFrozen.style.display = '';
				readOnly = true;
				AssessmentInvitations.style.display = 'none';
				AssessmentQuestionnaire.style.display = '';
				AssessmentForm.style.display = '';
			} else {
				AssessmentInvitations.style.display = '';
				AssessmentQuestionnaire.style.display = '';
				if (completedUnfrozen) {
					AssessmentExplanationCompletedUnfrozen.style.display = '';
					cls.add(AssessmentFinalizeBUTTON, 'AssessmentHighlightButton');
					AssessmentNotFinalized.style.display = '';
				} else if (Assessment && Assessment._inviteesEmailSent) {
					AssessmentExplanationPending.style.display = '';
					AssessmentNotFinalized.style.display = '';
				} else {
					AssessmentExplanationNew.style.display = '';
					AssessmentNoInvitationsYet.style.display = '';
				}
			}
			if (!inviteeFeedbackPage && Assessment && Assessment._currentTab == 'SelfAssessment') {
				AssessmentForm.style.display = '';
			}

			var updateTabVisibility = function(tab, setModel) {
				if (inviteeFeedbackPage) {
					return;
				}
				if (setModel) {
					var workbookId = this.model.currentWorkbookId();
					var sheetType = this.model.currentSheetType(workbookId);
					var sheetId = this.model.currentSheetId(workbookId, sheetType);
					this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._currentTab', tab);
				}
				AssessmentAbout.style.display = (tab == 'About' ? 'block' : 'none');
				AssessmentInvitations.style.display = (tab == 'Invitations' ? 'block' : 'none');
				AssessmentQuestionnaire.style.display = (tab == 'SelfAssessment' || tab == 'Results') ? 'block' : 'none';
				var listitems = AssessmentTabs.querySelectorAll('li');
				for (var i=0; i<listitems.length; i++) {
					var li = listitems[i];
					var tabValue = li.getAttribute('data-bp-tab');
					if (tabValue == tab) {
						cls.add(li, 'AssessmentTabSelected');
					} else {
						cls.remove(li, 'AssessmentTabSelected');
					}
				}
				AssessmentQuestionnaireTitleSelf.style.display = tab == 'SelfAssessment' ? 'block' : 'none';
				AssessmentQuestionnaireTitleResults.style.display = tab == 'Results' ? 'block' : 'none';
				if (Assessment && Assessment._currentTab == 'SelfAssessment') {
					this.workbookView.updateFormFields(AssessmentQuestionnaire, Assessment, this);
					AssessmentNoInvitationsYet.style.display = 'none';
					AssessmentNotFinalized.style.display = 'none';
					AssessmentForm.style.display = '';
				} else if (Assessment && Assessment._currentTab == 'Results') {
					AssessmentNoInvitationsYet.style.display = 'none';
					if (Assessment._consolidated) {
						this.workbookView.updateFormFields(AssessmentQuestionnaire, Assessment._consolidated, this);
					} else {
						AssessmentNotFinalized.style.display = '';
						AssessmentForm.style.display = 'none';
					}
				}
			};
			updateTabVisibility.bind(this)((Assessment && Assessment._currentTab) || 'About', false);
			AssessmentTabs.addEventListener('click', function(e) {
				e.preventDefault();
				var node = e.target;
				while (node && node.tagName != 'BODY') {
					if (node.hasAttribute('data-bp-tab')) {
						break;
					} else {
						node = node.parentNode;
					}
				}
				if (!node) {
					return;
				}
				var tab = node.getAttribute('data-bp-tab');
				if (tab) {
					updateTabVisibility.bind(this)(tab, true);
				}
			}.bind(this), false);

			var existingRows = 0, newRows = 0, totalRows = 0;
			var model = workbookView.model;
			var newDueDate;

			var _this = this;
			var addRow = function(parentNode, newExisting, invitee) {
				var rowNum;
				if (newExisting == 'new') {
					newRows++;
					rowNum = existingRows + newRows;
				} else {
					existingRows++;
					rowNum = existingRows;
				}
				var newTR = elem('tr', { attrs: { 'class': (newExisting == 'new' ? 'assessInviteesNewEntryTR' : 'assessInviteesExistingEntryTR')}});
				var td;
				elem('td', { attrs: { 'class': 'assessInviteesNumberTD'}, children: rowNum.toString() }, newTR);
				if (newExisting == 'existing') {
					td = elem('td', { attrs: { 'class': 'assessInviteesFirstNameTD'}, children: invitee.firstName }, newTR);
					td = elem('td', { attrs: { 'class': 'assessInviteesLastNameTD'}, children: invitee.lastName }, newTR);
					td = elem('td', { attrs: { 'class': 'assessInviteesEmailTD'}, children: invitee.email }, newTR);
				} else {
					td = elem('td', { attrs: { 'class': 'assessInviteesFirstNameTD'}, 
						children: [ elem('input', { attrs: { 'class': 'assessInviteesFirstName', value: invitee.firstName||'' }})]
					}, newTR);
					td = elem('td', { attrs: { 'class': 'assessInviteesLastNameTD'}, 
						children: [ elem('input', { attrs: { 'class': 'assessInviteesLastName', value: invitee.lastName||''  }})]
					}, newTR);
					td = elem('td', { attrs: { 'class': 'assessInviteesEmailTD'}, 
						children: [ elem('input', { attrs: { 'class': 'assessInviteesEmail', value: invitee.email||''  }})]
					}, newTR);
				}
				td = elem('td', { attrs: { 'class': 'assessInviteesCustomInviteTD'} }, newTR);
				if (newExisting == 'new') {
					var span = elem('span', { attrs: { 'class': 'assessInviteesCustomInviteSPAN'} }, td);
					var user = window.BrandingPays.user;
 					var button = elem('button', { 
						attrs: { 'class': 'assessInviteesCustomEmailBUTTON'}, 
						children: "Customize Invitation...",
						events: { click: function(i, e) {
							e.preventDefault();
							e.stopPropagation();
							var invitee = (Assessment._inviteesPending && Assessment._inviteesPending[i]) || {};
							var emailText = invitee.emailText || defaultEmailText;
							var emailTextSubstituted = emailText
								.replace(/\{\{INVITEE_FIRSTNAME\}\}/g, invitee.firstName || '(unknown)')
								.replace(/\{\{INVITEE_LASTNAME\}\}/g, invitee.lastName || '(unknown)')
								.replace(/\{\{MY_FIRSTNAME\}\}/g, user.firstName)
								.replace(/\{\{MY_LASTNAME\}\}/g, user.lastName)
								.replace(/\{\{MY_EMAIL\}\}/g, user.email)
								.replace(/\{\{DUEDATE\}\}/g, (new Date(Assessment._dueDate)).toDateString())
								;
							var newDueDate = assessInviteesDueDate.value;
							assessInviteEmail.show(emailTextSubstituted, function(newEmailText) {
								// newEmail==null => no changes
								if (newEmailText && newEmailText != emailTextSubstituted) {
									invitee.emailText = newEmailText;
								// Empty string means revert to default
								} else if (newEmailText === '') {
									delete invitee.emailText;
								}
							}.bind(this));
						}.bind(_this, newRows-1)}
					}, span);
					if (readOnly) {
						button.disabled = true;
					}
				}
				parentNode.appendChild(newTR);
			};

			var anyErrors = false;

			var addErrorMessage = function(errorElem, field, msg) {
				var errorFields = assessInvitees.querySelectorAll('.assessInviteesInvalidField');
				for (var i=0; i<errorFields.length; i++) {
					cls.remove(errorFields[i], 'assessInviteesInvalidField');
				}
				errorElem.innerHTML = msg;
				cls.add(field, 'assessInviteesInvalidField');
				anyErrors = true;
			};
			var checkForErrors = function() {
				anyErrors = false;
				assessInviteesErrors.innerHTML = '';
				var trs = assessInviteesNewTABLE.querySelectorAll('.assessInviteesNewEntryTR');
				for (var i=0; i<trs.length; i++) {
					var tr = trs[i];
					var assessInviteesFirstName = tr.querySelector('.assessInviteesFirstName');
					var assessInviteesLastName = tr.querySelector('.assessInviteesLastName');
					var assessInviteesEmail = tr.querySelector('.assessInviteesEmail');
					if (i<trs.length-1 || assessInviteesFirstName.value || assessInviteesLastName.value || assessInviteesEmail.value) {
						if (!assessInviteesFirstName.value) {
							addErrorMessage(assessInviteesErrors, assessInviteesFirstName, 'One or more fields is empty.');
							return;
						}
						if (!assessInviteesLastName.value) {
							addErrorMessage(assessInviteesErrors, assessInviteesLastName, 'One or more fields is empty.');
							return;
						}
						if (!validateRegFields.isValidEmail(assessInviteesEmail.value)) {
							addErrorMessage(assessInviteesErrors, assessInviteesEmail, 'Invalid email address');
							return;
						}
					}
				}

				var invitees = assessment._inviteesEmailSent.concat(assessment._inviteesPending);
				for (var i=0; i<invitees.length; i++) {
					var invitee = invitees[i];
					if (invitee.email == assessInviteesEmail.value) {
						addErrorMessage(assessInviteesErrors, assessInviteesEmail, 'Email address already used.');
						return;
					}
				}
			};

			var assessInvitees = parentNode.querySelector('.assessInvitees');
			assessInvitees.addEventListener('click', function(e) {
				// prevent click on white space of dialog from closing dialog
				e.stopPropagation();
			}, false);

			var assessInviteesErrors = assessInvitees.querySelector('.assessInviteesErrors');
			var assessInviteesDueDateError = assessInvitees.querySelector('.assessInviteesDueDateError');
			var assessInviteesExistingTABLE = assessInvitees.querySelector('.assessInviteesExistingTABLE');
			var assessInviteesExistingTBODY = assessInviteesExistingTABLE.querySelector('tbody');
			var assessInviteesNewTABLE = assessInvitees.querySelector('.assessInviteesNewTABLE');
			var assessInviteesNewTBODY = assessInviteesNewTABLE.querySelector('tbody');
			var assessInviteesExistingDIV = assessInvitees.querySelector('.assessInviteesExistingDIV');
			var assessInviteesExistingEntryTR = assessInvitees.querySelector('.assessInviteesExistingEntryTR');
			var assessInviteesNewEntryTR = assessInvitees.querySelector('.assessInviteesNewEntryTR');
			var assessInviteesNewDIV = assessInvitees.querySelector('.assessInviteesNewDIV');
			var assessInviteesUpdateBUTTON = assessInvitees.querySelector('.assessInviteesUpdateBUTTON');

			var workbookId = this.model.currentWorkbookId();
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var oldAssessment = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']');

			var assessment = oldAssessment
				? JSON.parse(JSON.stringify(oldAssessment)) //clone
				: {};
			assessment._inviteesEmailSent = assessment._inviteesEmailSent || [];
			assessment._inviteesPending = assessment._inviteesPending || [];
			if (assessment._inviteesEmailSent.length == 0) {
				assessInviteesExistingDIV.style.display = 'none';
			} else {
				for (var i=0; i<assessment._inviteesEmailSent.length; i++) {
					addRow(assessInviteesExistingTBODY, 'existing', assessment._inviteesEmailSent[i]);
				}
			}
			for (var i=0; i<assessment._inviteesPending.length; i++) {
				addRow(assessInviteesNewTBODY, 'new', assessment._inviteesPending[i]);
			}
			var ensureExtraRow = function() {
				var needExtraRow = true;
				var trs = assessInviteesNewTABLE.querySelectorAll('.assessInviteesNewEntryTR');
				if (trs.length > 0) {
					var lastTr = trs[trs.length-1];
					var assessInviteesFirstName = lastTr.querySelector('.assessInviteesFirstName');
					var assessInviteesLastName = lastTr.querySelector('.assessInviteesLastName');
					var assessInviteesEmail = lastTr.querySelector('.assessInviteesEmail');
					needExtraRow = (assessInviteesFirstName.value && assessInviteesLastName.value && validateRegFields.isValidEmail(assessInviteesEmail.value));
				} else {
					needExtraRow = true;
				}
				if (needExtraRow) {
					addRow(assessInviteesNewTBODY, 'new', {});
					var trs = assessInviteesNewTABLE.querySelectorAll('.assessInviteesNewEntryTR');
					if (trs.length > 0) {
						var lastTr = trs[trs.length-1];
						var assessInviteesNumberTD = lastTr.querySelector('.assessInviteesNumberTD');
						assessInviteesNumberTD.style.opacity = 0;
					}
				}
			};
			var updatePending = function() {
				var inviteesPending = Assessment._inviteesPending ? JSON.parse(JSON.stringify(Assessment._inviteesPending)) : [];
				var trs = assessInviteesNewTABLE.querySelectorAll('.assessInviteesNewEntryTR');
				for (var i=0; i<trs.length; i++) {
					var tr = trs[i];
					var assessInviteesFirstName = tr.querySelector('.assessInviteesFirstName');
					var assessInviteesLastName = tr.querySelector('.assessInviteesLastName');
					var assessInviteesEmail = tr.querySelector('.assessInviteesEmail');
					if (assessInviteesFirstName.value || assessInviteesLastName.value || assessInviteesEmail.value) {
						if (!inviteesPending[i]) {
							inviteesPending[i] = {
								firstName: assessInviteesFirstName.value,
								lastName: assessInviteesLastName.value,
								email: assessInviteesEmail.value
							};
						} else {
							inviteesPending[i].firstName = assessInviteesFirstName.value;
							inviteesPending[i].lastName = assessInviteesLastName.value;
							inviteesPending[i].email = assessInviteesEmail.value;
						}
					}
				}
				if (trs.length > 0) {
					var lastTr = trs[trs.length-1];
					var assessInviteesNumberTD = lastTr.querySelector('.assessInviteesNumberTD');
					var assessInviteesFirstName = lastTr.querySelector('.assessInviteesFirstName');
					var assessInviteesLastName = lastTr.querySelector('.assessInviteesLastName');
					var assessInviteesEmail = lastTr.querySelector('.assessInviteesEmail');
					if (assessInviteesFirstName.value || assessInviteesLastName.value || assessInviteesEmail.value) {
						assessInviteesNumberTD.style.opacity = '';
					} else {
						assessInviteesNumberTD.style.opacity = 0;
					}
				}
				this.model.set('workbooks['+workbookId+'].sheets.Assessment['+sheetId+']._inviteesPending', inviteesPending);
			};
			var updateButtons = function() {
				var trs = assessInviteesNewTABLE.querySelectorAll('.assessInviteesNewEntryTR');
				var anyPending = false;
				var anyPartial = false;
				for (var i=0; i<trs.length; i++) {
					var tr = trs[i];
					var assessInviteesFirstName = tr.querySelector('.assessInviteesFirstName');
					var assessInviteesLastName = tr.querySelector('.assessInviteesLastName');
					var assessInviteesEmail = tr.querySelector('.assessInviteesEmail');
					var assessInviteesCustomEmailBUTTON = tr.querySelector('.assessInviteesCustomEmailBUTTON');
					if (assessInviteesFirstName.value || assessInviteesLastName.value || assessInviteesEmail.value) {
						if (assessInviteesFirstName.value && assessInviteesLastName.value && validateRegFields.isValidEmail(assessInviteesEmail.value)) {
							assessInviteesCustomEmailBUTTON.style.visibility = 'visible';
							anyPending = true;
						} else {
							anyPartial = true;
							assessInviteesCustomEmailBUTTON.style.visibility = 'hidden';
						}
					} else {
						assessInviteesCustomEmailBUTTON.style.visibility = 'hidden';
					}
				}
				assessInviteesUpdateBUTTON.disabled = !anyPending || anyPartial;
			};
			var newEntryChangeOrBlur = function(e) {
				e.preventDefault();
				e.stopPropagation();
				updatePending.bind(this)();
				ensureExtraRow.bind(this)();
				updateButtons.bind(this)();
			};
			assessInviteesNewTABLE.addEventListener('change', newEntryChangeOrBlur.bind(this), false);
			assessInviteesNewTABLE.addEventListener('blur', newEntryChangeOrBlur.bind(this), false);
			assessInviteesNewTABLE.addEventListener('keyup', newEntryChangeOrBlur.bind(this), false);
			assessInviteesNewTABLE.addEventListener('paste', newEntryChangeOrBlur.bind(this), false);
			ensureExtraRow.bind(this)();
			updateButtons.bind(this)();

			var assessInviteesDueDate = assessInvitees.querySelector('.assessInviteesDueDate');
			assessInviteesDueDate.value = newDueDate || oldDueDate || '';
			assessInviteesDueDate.addEventListener('change', function(e) {
				updateButtons();
				if (assessInviteesDueDate.value) {
					assessInviteesDueDateNote.textContent = '';
					assessInviteesDueDateError.innerHTML = '';
				} else {
					assessInviteesDueDateNote.textContent = suggestedDueDate;
					addErrorMessage(assessInviteesDueDateError, assessInviteesDueDate, mustProvideDueDate);
				}
			}, false);
			var newDueDate;
			var oldDueDate = assessment ? assessment._dueDate : '';
			var suggestedDueDate = '(Suggested: one week from today)';
			var mustProvideDueDate = 'You must provide a due date.';
			var assessInviteesDueDateNote = assessInvitees.querySelector('.assessInviteesDueDateNote');
			if (!newDueDate) {
				assessInviteesDueDateNote.textContent = suggestedDueDate;
			}
			if (readOnly) {
				assessInviteesDueDate.disabled = true;
			}

			assessInviteesDueDateNote.disabled = (assessment._inviteesEmailSent.length == 0 && assessment._inviteesPending.length == 0) || readOnly;
			assessInviteesUpdateBUTTON.addEventListener('click', function(e) {
				e.stopPropagation();
				checkForErrors();
				if (anyErrors) {
					return;
				}
				if (!assessInviteesDueDate || assessInviteesDueDate.value == '') {
					addErrorMessage(assessInviteesDueDateError, assessInviteesDueDate, mustProvideDueDate);
					assessInviteesDueDateError.style.display = 'block';
					return;
				} else {
					assessInviteesDueDateError.style.display = 'none';
				}
				var invitees = assessment._inviteesEmailSent.concat(assessment._inviteesPending);
				assessment._inviteesEmailSent = invitees;
				assessment._dueDate = assessInviteesDueDate.value;
				if (!assessment._assessmentId) {
					assessment._assessmentId = Math.ceil(Math.random()*10000000000);
				}
				var params = JSON.parse(JSON.stringify( {		// clone everything
					newAssessmentInvitations: {
						newInvitees: assessment._inviteesPending,
						defaultEmailText: defaultEmailText,
						dueDate: assessment._dueDate,
						assessmentId: assessment._assessmentId
					}
				}));
				delete assessment._inviteesPending;
				this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']', assessment, params);
				setTimeout(function() {
					//FIXME: don't refresh - do it with logic
					// Refresh the browser page so that the title info on the Assessment page can be properly updated.
					location.reload();
				}, 100);
			}.bind(this), false);
			if (readOnly) {
				assessInviteesUpdateBUTTON.style.display = 'none';
				assessInviteesDueDateNote.style.display = 'none';
				assessInviteesNewDIV.style.display = 'none';
				// setTimeout because sometimes the textareas have been assigned values yet.
				// If disabled too soon, the assignments fail.
				setTimeout(function() {
					var textareas = AssessmentForm.querySelectorAll('textarea');
					for (var i=0; i<textareas.length; i++) {
						textareas[i].disabled = true;
					}
				}, 0);
			}
		},

		/**
		 * Update the TEXTAREA form fields to contain data passed as the second parameter.
		 * @param {Element} parentNode Parent node for all of the TEXTAREA elements
		 * @param {object} Object containing the data to stuff into the TEXTAREA elements
		 */
		updateFormFields: function(parentNode, formData) {
			this.workbookView.updateFormFields(parentNode, 
				this.Assessment._currentTab == 'Results' ? formData._consolidated : formData, this);
		},

		/**
		 * Form-specific logic for printing a page, overrides the default logic found in workbookView.js.
		 * @param {Element} container Container element into which the print content should go
		 * @param {object} workbookView The workbookView object
		 * @param {string} workbookId Id of the workbook to print
		 * @param {string} sheetType Type of sheet (should be 'Assessment' here)
		 * @param {number} sheetId id of the sheet to print
		 */
		printPage: function(container, workbookView, workbookId, sheetType, sheetId) {
			var Assessment = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']');
			if (Assessment) {
				var container1 = elem('div', {}, container);
				elem('div', { attrs: { 'class': 'AssessmentQuestionnaireTitleInvitations' }, children: 'Assessment Setup'}, container1);
				var Title = Assessment.Title || '(no title)';
				var FormTitleDIV = elem('div', { attrs: { 'class': 'FormTitleDIV' }}, container1);
				//FIXME: This is duplicated from Assessment_Form.html
				FormTitleDIV.innerHTML = ""+
					"<div class='FormTitleMainContent'>"+
					"	<span class='FormTitleLabelContainer'>"+
					"		<span class='FormTitleLabel'>Assessment Title:</span>"+
					"	</span>"+
					"	<span class='FormTitleFieldSpan'>"+
					"		<span class='FormTitleTextArea'>"+Title+"</span>"+
					"	</span>"+
					"</div>";
				if (Assessment._inviteesEmailSent && Assessment._inviteesEmailSent.length > 0) {
					var assessInviteesTableDIV = elem('div', { attrs: { 'class': 'assessInviteesTableDIV' }}, container1);
					//FIXME: This is duplicated from Assessment_Form.html
					assessInviteesTableDIV.innerHTML = ""+
						"<div class='assessInviteesExistingDIV'>"+
						"	<div class='assessInviteesExistingLabel'>Previous invitations - invitations have already been sent to these people:</div>"+
						"	<table class='assessInviteesTABLE assessInviteesExistingTABLE'>"+
						"		<tr>"+
						"			<th class='assessInviteesNumberTD'></th>"+
						"			<th class='assessInviteesFirstNameTD'>First name</th>"+
						"			<th class='assessInviteesLastNameTD'>Last name</th>"+
						"			<th class='assessInviteesEmailTD'>Email</th>"+
						"			<th class='assessInviteesAnyFeedbackTD'>Any feedback?</th>"+
						"		</tr>"+
						"	</table>"+
						"</div>";
					var assessInviteesExistingTABLE = container1.querySelector('.assessInviteesExistingTABLE');
					var nInvitees = 0;
					for (var i=0; i<Assessment._inviteesEmailSent.length; i++) {
						nInvitees++;
						var invitee = Assessment._inviteesEmailSent[i];
						var tr = elem('tr', { attrs: { 'class': 'assessInviteesExistingEntryTR' }}, assessInviteesExistingTABLE);
						elem('td', { attrs: { 'class': 'assessInviteesNumberTD' }, children: nInvitees+'' }, tr);
						elem('td', { attrs: { 'class': 'assessInviteesFirstNameTD' }, children: invitee.firstName }, tr);
						elem('td', { attrs: { 'class': 'assessInviteesLastNameTD' }, children: invitee.lastName }, tr);
						elem('td', { attrs: { 'class': 'assessInviteesEmailTD' }, children: invitee.email }, tr);
						elem('td', { attrs: { 'class': 'assessInviteesAnyFeedbackTD' }, children: invitee.anyFeedback ? 'Yes' : 'No' }, tr);
					}
				} else {
					var assessInviteesTableDIV = elem('div', { attrs: { 'class': 'assessInviteesTableDIV' }, children: 'No invitations have been sent yet.'}, container1);
				}
				if (Assessment._inviteesPending && Assessment._inviteesPending.length > 0) {
					var assessInviteesTableDIV = elem('div', { attrs: { 'class': 'assessInviteesTableDIV' }}, container1);
					//FIXME: This is duplicated from Assessment_Form.html
					assessInviteesTableDIV.innerHTML = ""+
						"<div class='assessInviteesNewDIV'>"+
						"	<div class='assessInviteesNewLabel'>New invitations - will be sent when you click \"Send invitations\":</div>"+
						"	<table class='assessInviteesTABLE assessInviteesNewTABLE'>"+
						"		<tr>"+
						"			<th class='assessInviteesNumberTD'></th>"+
						"			<th class='assessInviteesFirstNameTD'>First name</th>"+
						"			<th class='assessInviteesLastNameTD'>Last name</th>"+
						"			<th class='assessInviteesEmailTD'>Email</th>"+
						"			<th class='assessInviteesAnyFeedbackTD'>Any feedback?</th>"+
						"		</tr>"+
						"	</table>"+
						"</div>";
					var assessInviteesNewTABLE = container1.querySelector('.assessInviteesNewTABLE');
					var nInvitees = 0;
					for (var i=0; i<Assessment._inviteesPending.length; i++) {
						nInvitees++;
						var invitee = Assessment._inviteesPending[i];
						var tr = elem('tr', { attrs: { 'class': 'assessInviteesNewEntryTR' }}, assessInviteesNewTABLE);
						elem('td', { attrs: { 'class': 'assessInviteesNumberTD' }, children: nInvitees+'' }, tr);
						elem('td', { attrs: { 'class': 'assessInviteesFirstNameTD' }, children: invitee.firstName }, tr);
						elem('td', { attrs: { 'class': 'assessInviteesLastNameTD' }, children: invitee.lastName }, tr);
						elem('td', { attrs: { 'class': 'assessInviteesEmailTD' }, children: invitee.email }, tr);
						elem('td', { attrs: { 'class': 'assessInviteesAnyFeedbackTD' }, children: invitee.anyFeedback ? 'Yes' : 'No' }, tr);
					}
				}
				var assessInviteesDueDateDIV = elem('div', { attrs: { 'class': 'assessInviteesDueDateDIV' }}, container1);
				var assessInviteesDueDateDIV = elem('label', { attrs: { 'class': 'assessInviteesDueDateLABEL' }, children:'Due date:'}, assessInviteesDueDateDIV);
				var assessInviteesDueDate = elem('span', { attrs: { 'class': 'assessInviteesDueDate' }, children:Assessment._dueDate }, assessInviteesDueDateDIV);

				var container2 = elem('div', { attrs: { 'class': 'pageBreak' }}, container);
				var titleDiv = elem('div', { attrs: { 'class': 'AssessmentQuestionnaireTitleSelf' }, children: 'Self-Assessment (optional)'}, container2);
				var contentDiv = elem('div', {}, container2);
				contentDiv.innerHTML = removeAccidentalWhitespace(Assessment_Form_html);
				workbookView.updateFormFields(contentDiv, Assessment, this);

				if (Assessment._consolidated) {
					var container3 = elem('div', { attrs: { 'class': 'pageBreak' }}, container);
					var titleDiv = elem('div', { attrs: { 'class': 'AssessmentQuestionnaireTitleResults' }, children: 'Consolidated Feedback'}, container3);
					var contentDiv = elem('div', {}, container3);
					contentDiv.innerHTML = removeAccidentalWhitespace(Assessment_Form_html);
					workbookView.updateFormFields(contentDiv, Assessment._consolidated, this);
				}
			}
		},

		/**
		 * Form-specific logic that is called after duplicating a sheet, allowing for form-specific fixups on the duplicated data.
		 * @param {object} sheet The new/duplicated sheet
		 * @param {string} workbookId id of the workbook containing the duplicated sheet
		 * @param {string} sheetType Type of sheet (should be 'Assessment' here)
		 * @param {number} sheetId id of the duplicated sheet
		 */
		duplicateWorkbookPostProcess: function(Assessment, workbookId, sheetType, sheetId) {
			Assessment._assessmentId = Math.ceil(Math.random()*10000000000);
			delete Assessment._dueDate;
			delete Assessment._consolidated;
			delete Assessment._currentTab;
			if (Assessment._inviteesEmailSent && Assessment._inviteesEmailSent.length>0 && Assessment._inviteesPending && Assessment._inviteesPending.length>0) {
				Assessment._inviteesPending = Assessment._inviteesEmailSent.concat(Assessment._inviteesPending);
			} else if (Assessment._inviteesEmailSent && Assessment._inviteesEmailSent.length>0) {
				Assessment._inviteesPending = Assessment._inviteesEmailSent;
			}
			delete Assessment._inviteesEmailSent;
			if (Assessment._inviteesPending && Assessment._inviteesPending.length>0) {
				for (var i=0; i<Assessment._inviteesPending; i++) {
					var invitee = Assessment._inviteesPending[i];
					delete invitee.anyFeedback;
				}
			}
		}
	};
});
