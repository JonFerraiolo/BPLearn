define([
	'text!./Positioning_Statement_Form.html',
	'../../util/cls',
	'../../util/removeAccidentalWhitespace'
], function(
	Positioning_Statement_Form_html,
	cls,
	removeAccidentalWhitespace
) {
	return {
		/**
		 * Initialize a Positioning_Statement form
		 * @param {object} workbookView The workbookView that will be parent of the form
		 * @param {Element} parentNode The element into which the form should be stuffed as innerHTML
		 */
		init: function(workbookView, parentNode) {
			this.workbookView = workbookView;
			this.parentNode = parentNode;
			parentNode.innerHTML = removeAccidentalWhitespace(Positioning_Statement_Form_html);
		},

		/**
		 * Determine if any special transformation logic is needed when converting from a form input field
		 * into the model's data structure.
		 * @param {string} formFieldId The value of the data-bp-field attribute for the given form field
		 * @returns {null|object} If not special transformation required, returns null. Else, returns an object
		 *   { type: {string} So far, only type supported is 'arrayItem'
		 *     arrayName: {string} Name of model array
		 *     arrayIndex {number} Index of this form item into the model array
		 *   }
		 */
		formToModel: function(formFieldId) {
			var evidenceMatch = formFieldId.match(/^Evidence_(\d+)$/);
			if (evidenceMatch) {
				return {
					type: 'arrayItem',
					arrayName: 'Evidence',
					arrayIndex: parseInt(evidenceMatch[1])
				}
			} else {
				return null;
			}
		},

		/**
		 * Return the helpFieldId string from the form input field name (data-bp-field)
		 * @param {string} formFieldId The value of the data-bp-field attribute for the given form field
		 * @returns {string} corresponding helpFieldId
		 */
		formIdToHelpId: function(formFieldId) {
			var tokens = formFieldId.split('.');
			var token2 = tokens[1] || '';
			var evidenceMatch = token2.match(/^Evidence_(\d+)$/);
			if (evidenceMatch) {
				return tokens[0]+'.Evidence';
			} else {
				return formFieldId;
			}
		}
	};
});
