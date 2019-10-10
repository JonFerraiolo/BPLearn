define([
	'text!./Brand_Strategy_Form.html',
	'../../util/cls',
	'../../util/removeAccidentalWhitespace'
], function(
	Brand_Strategy_Form_html,
	cls,
	removeAccidentalWhitespace
) {
	var topLevelHelpIds = [
		'Brand_Strategy.Core_Values',
		'Brand_Strategy.Strengths',
		'Brand_Strategy.Personality',
		'Brand_Strategy.Brand_Image',
		'Brand_Strategy.Brand_Promise'
	];

	return {
		/**
		 * Initialize a Brand_Strategy form
		 * @param {object} workbookView The workbookView that will be parent of the form
		 * @param {Element} parentNode The element into which the form should be stuffed as innerHTML
		 */
		init: function(workbookView, parentNode) {
			this.workbookView = workbookView;
			this.parentNode = parentNode;
			parentNode.innerHTML = removeAccidentalWhitespace(Brand_Strategy_Form_html);
		},

		/**
		 * Perform any special logic when help information is about to show. 
		 * @param {string} formFieldId The value of the data-bp-field attribute for the given form field
		 */
		helpShow: function(formFieldId) {
			if (topLevelHelpIds.indexOf(formFieldId) >= 0) {
				var tr = this.parentNode.querySelector('.Brand_Strategy_Help_TR');
				tr.style.display = 'table-row';
			}
		},

		/**
		 * Perform any special logic when help information has just been hidden.
		 * @param {string} formFieldId The value of the data-bp-field attribute for the given form field
		 */
		helpHide: function(formFieldId) {
			if (topLevelHelpIds.indexOf(formFieldId) >= 0) {
				var tr = this.parentNode.querySelector('.Brand_Strategy_Help_TR');
				tr.style.display = 'none';
			}
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
			var coreValuesMatch = formFieldId.match(/^Core_Values_(\d+)$/);
			var keyDescriptorsMatch = formFieldId.match(/^Key_Brand_Descriptors_(\d+)$/);
			if (coreValuesMatch) {
				return {
					type: 'arrayItem',
					arrayName: 'Core_Values',
					arrayIndex: parseInt(coreValuesMatch[1])
				}
			} else if (keyDescriptorsMatch) {
				return {
					type: 'arrayItem',
					arrayName: 'Key_Brand_Descriptors',
					arrayIndex: parseInt(keyDescriptorsMatch[1])
				}
			} else {
				return null;
			}
		},

		/**
		 * Override function which returns the node which should contain the help content, 
		 * based on helpFieldId string from the form input field name (data-bp-field).
		 * 
		 * If this routine is not supplied, or this routine returns null,
		 * then default logic is used (where we look for '.ContextHelpContent' descendant 
		 * from node have a data-bp-field attribute)
		 *
		 * @param {string} formFieldId The value of the data-bp-field attribute for the given form field
		 * @returns {Element|null} helpFieldNode
		 */
		formIdToHelpNode: function(formFieldId) {
			if (topLevelHelpIds.indexOf(formFieldId) >= 0) {
				return this.parentNode.querySelector('.Brand_Strategy_Help_TR .ContextHelpContent');
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
			var coreValuesMatch = token2.match(/^Core_Values_(\d+)$/);
			var keyDescriptorsMatch = token2.match(/^Key_Brand_Descriptors_(\d+)$/);
			if (keyDescriptorsMatch) {
				return tokens[0]+'.Core_Values';
			} else if (keyDescriptorsMatch) {
				return tokens[0]+'.Key_Brand_Descriptors';
			} else {
				return formFieldId;
			}
		}
	};
});
