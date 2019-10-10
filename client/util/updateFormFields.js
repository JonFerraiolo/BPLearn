/**
 * Update all of the form fields that descend from parentNode
 * using the data from formData.
 * @param {Element} parentNode Root node for the form
 * @param {object} full copy of the formData to use as the data
 * @param {function} sheetClass	One of the sheetId classes, eg., Positioning_Statement
 **/
define(function() {
	return function(parentNode, formData, sheetClass) {
		var formFieldContainers = parentNode.querySelectorAll('[data-bp-field]');
		for (var i=0; i<formFieldContainers.length; i++) {
			var formFieldContainer = formFieldContainers[i];
			var formFieldId = formFieldContainer.getAttribute('data-bp-field');
			var shortedFormFieldId = formFieldId.substr(formFieldId.indexOf('.')+1);
			var modelField = sheetClass.formToModel ? sheetClass.formToModel(shortedFormFieldId) : null;
			var value = undefined;
			if (formData) {
				if (shortedFormFieldId == '_sheet') {
					value = formData.Title;
				} else if (modelField && modelField.type == 'arrayItem') {
					if (formData[modelField.arrayName]) {
						value = formData[modelField.arrayName][modelField.arrayIndex];
					}
				} else if (modelField && modelField.modelPropName) {
					var tokens = modelField.modelPropName.split('.');
					if (formData) {
						var parentObj = formData;
						for (var j=0; j<tokens.length-1; j++) {
							parentObj = parentObj[tokens[j]];
							if (!parentObj) {
								break;
							}
						}
						if (parentObj) {
							value = parentObj[tokens[tokens.length-1]];
						}
					}
				} else {
					value = formData[shortedFormFieldId];
				}
			}
			var formElem = formFieldContainer.querySelector("textarea") || formFieldContainer.querySelector("input");
			if (formElem) {
				formElem.value = value || '';
			}
		}
	};
});