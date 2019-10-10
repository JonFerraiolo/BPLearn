define([
	'text!./Action_Plan_Form.html',
	'../../util/removeAccidentalWhitespace'
], function(
	Action_Plan_Form_html,
	removeAccidentalWhitespace
) {
	return {
		/**
		 * Initialize an Action_Plan form
		 * @param {object} workbookView The workbookView that will be parent of the form
		 * @param {Element} parentNode The element into which the form should be stuffed as innerHTML
		 */
		init: function(workbookView, parentNode) {
			this.workbookView = workbookView;
			this.parentNode = parentNode;
			parentNode.innerHTML = removeAccidentalWhitespace(Action_Plan_Form_html);
		},

		/**
		 * Return the helpFieldId string from the form input field name (data-bp-field)
		 * @param {string} formFieldId The value of the data-bp-field attribute for the given form field
		 * @returns {string} corresponding helpFieldId
		 */
		formIdToHelpId: function(formFieldId) {
			var tokens = formFieldId.split('.');
			var token2 = tokens[1] || '';
			if (token2 == 'Five_Second') {
				return tokens[0]+'.What_I_Do_(or_Want_to_Do)';
			} else if (token2 == 'Fifteen_Second') {
				return tokens[0]+'.Context_and_Value';
			} else if (token2 == 'Thirty_Second') {
				return tokens[0]+'.Evidence';
			} else {
				return formFieldId;
			}
		}
	};
});
