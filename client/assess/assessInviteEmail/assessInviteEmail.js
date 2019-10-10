define([
	'../../modal/popup',
	'text!./assessInviteEmail.html',
	'../../util/removeAccidentalWhitespace'
], function(
	popup,
	assessInviteEmail_html,
	removeAccidentalWhitespace
) {

	return {
		/**
		 * Show a dialog that allows the user to customize the email text sent with
		 * a personal brand assessment questionnaire invitation.
		 * @param {string} oldEmailText  Current email text
		 * @param {function} callback  Callback that is invoked when the dialog goes down
		 *    One parameter to the callback: newEmailText, which if false|null|undefined
		 *    means no changes have been made
		 */
		show: function(oldEmailText, callback) {
			var popupElem = popup.show({
				content: removeAccidentalWhitespace(assessInviteEmail_html),
				clickAwayToClose: false
			});
			var assessInviteEmailDefaultEmailText = popupElem.querySelector('.assessInviteEmailDefaultEmailText');
			assessInviteEmailDefaultEmailText.value = oldEmailText;
			var assessInviteEmail = popupElem.querySelector('.assessInviteEmail');
			assessInviteEmail.addEventListener('click', function(e) {
				// prevent click on white space of dialog from closing dialog
				e.stopPropagation();
			}, false);
			var assessInviteEmailUpdateBUTTON = popupElem.querySelector('.assessInviteEmailUpdateBUTTON');
			assessInviteEmailUpdateBUTTON.addEventListener('click', function(e) {
				e.stopPropagation();
				if (assessInviteEmailDefaultEmailText.value.length == 0) {
					alert('Cannot send an email with no body content');
				} else if (assessInviteEmailDefaultEmailText.value.indexOf('{{FEEDBACK_URL}}')<0) {
					alert('Email content must have the variable {{FEEDBACK_URL}} somewhere within its content.');
				} else {
					popup.hide();
					callback(assessInviteEmailDefaultEmailText.value);
				}
			}, false);
			var assessInviteEmailCancelBUTTON = popupElem.querySelector('.assessInviteEmailCancelBUTTON');
			assessInviteEmailCancelBUTTON.addEventListener('click', function(e) {
				e.stopPropagation();
				popup.hide();
				callback(null);
			}, false);
		}
	}
	
});
