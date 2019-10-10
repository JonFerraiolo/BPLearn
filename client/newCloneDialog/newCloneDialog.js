define([
	'../modal/popup',
	'text!./newCloneDialog.html',
	'../util/removeAccidentalWhitespace'
], 
function(
	popup,
	newCloneDialog_html,
	removeAccidentalWhitespace
) {

	/**
	 * Displays a modal newCloneDialogation popup.
	 * @param {object} params Various parameters
	 * @param {string} params.text Inner HTML for the main textual content for the popup
	 * @param {string} [params.yes] Label for the yes button (default: "Yes")
	 * @param {string} [params.yes2] Label for the second yes button (default: doesn't show)
	 * @param {string} [params.no] Label for the yes button (default: "No")
	 * @param {function} callback Callback to call when one of the buttons is clicked
	 */
	return function(params, callback) {
		var yes = params.yes || 'Yes';
		var yes2 = params.yes2 || '';
		var no = params.no || 'No';
		var content = removeAccidentalWhitespace(newCloneDialog_html)
			.replace(/\{\{TEXT\}\}/g, params.text)
			.replace(/\{\{YES\}\}/g, yes)
			.replace(/\{\{YES2\}\}/g, yes2)
			.replace(/\{\{NO\}\}/g, no);
		var popupElem = popup.show({
			content: content,
			clickAwayToClose: false
		});
		var newCloneDialogYes = popupElem.querySelector('.newCloneDialogYes');
		var newCloneDialogYes2 = popupElem.querySelector('.newCloneDialogYes2');
		var newCloneDialogNo = popupElem.querySelector('.newCloneDialogNo');
		if (!yes2) {
			newCloneDialogYes2.style.display = 'none';
		}
		newCloneDialogYes.addEventListener('click', function(e) {
			e.stopPropagation();
			popup.hide();
			callback('yes');
		}, false);
		newCloneDialogYes2.addEventListener('click', function(e) {
			e.stopPropagation();
			popup.hide();
			callback('yes2');
		}, false);
		newCloneDialogNo.addEventListener('click', function(e) {
			e.stopPropagation();
			popup.hide();
			callback('no');
		}, false);
	};
});