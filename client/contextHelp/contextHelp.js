define([
	'text!./contextHelp.html',
	'./helpData',
	'../util/cls',
	'../util/elem',
	'../util/removeAccidentalWhitespace',
	'../util/animProps'
], function(
	contextHelp_html,
	helpData,
	cls,
	elem,
	removeAccidentalWhitespace,
	animProps
) {

	return {
		show: function(parentNode, helpFieldId, params) {
			this.hide();
			this.lastParentNode = parentNode;
			this.lastHelpFieldId = helpFieldId;
			this.workbookView = params.workbookView;
			this.htmlTemplate = params.htmlTemplate;

			var examplesClickListener = null;

			var showSheet = function(sheetId, fieldId) {
				var helpMain = helpData.main[sheetId]._sheet;
				this.contextHelpContentText.innerHTML = helpMain.text;
				var params = { elem:this.contextHelpDIV, animClassName:'contextHelpGrowAnim', animEndCallback: function() {
					cls.remove(params.elem, params.animClassName);
				}.bind(this)};
				this.contextHelpDIV.style.display = 'block';
				animProps(params);
				this.contextHelpContentText.style.display = '';
				buildSheetExamples.call(this, sheetId, fieldId);
			};

			var buildSheetExamples = function(sheetId, fieldId) {
				this.contextHelpExamplesText.innerHTML = removeAccidentalWhitespace(this.htmlTemplate);
				var contextHelpExamplesSELECT = this.contextHelpDIV.querySelector('.contextHelpExamplesSELECT');
				contextHelpExamplesSELECT.innerHTML = '';
				var helpExamples = helpData.examples[sheetId];
				if (helpExamples) {
					var helpMain = helpData.main[sheetId][fieldId];
					var firstJobTitleUnderscores;
					for (var jobTitleUnderscores in helpExamples) {
						if (!firstJobTitleUnderscores) {
							firstJobTitleUnderscores = jobTitleUnderscores;
						}
						var jobTitle = jobTitleUnderscores.replace(/_/g, ' ');
						elem('option', {attrs:{value:jobTitleUnderscores}, children:jobTitle }, contextHelpExamplesSELECT);
					}
					var formData = helpExamples[firstJobTitleUnderscores];
					this.workbookView.updateFormFields(this.contextHelpExamplesText, formData);
					contextHelpExamplesSELECT.addEventListener('change', function(e) {
						var formData = helpExamples[contextHelpExamplesSELECT.value];
						this.workbookView.updateFormFields(this.contextHelpExamplesText, formData);
					}.bind(this), false);
				} else {
					this.contextHelpContentTD.style.width = '100%';
					this.contextHelpContentTD.style.borderRight = 'none';
					this.contextHelpExamplesTD.style.display = 'none';
				}
			};

			var showField = function(sheetId, fieldId) {
				var helpMain = helpData.main[sheetId][fieldId];
				this.contextHelpContentText.innerHTML = helpMain.text;
				var params = { elem:this.contextHelpDIV, animClassName:'contextHelpGrowAnim', animEndCallback: function() {
					cls.remove(params.elem, params.animClassName);
				}.bind(this)};
				this.contextHelpDIV.style.display = 'block';
				animProps(params);
				this.contextHelpContentText.style.display = '';
				var anyExamples = false;
				if (helpData.examples[sheetId]) {
					for (var jobTitleUnderscores in helpData.examples[sheetId]) {
						var example = helpData.examples[sheetId][jobTitleUnderscores];
						if (example[fieldId]) {
							anyExamples = true;
							break;
						}
					}
				}
				if (!anyExamples) {
					this.contextHelpExamplesText.style.display = 'none';
				} else {
					this.contextHelpExamplesText.style.display = '';
					var helpExamples = helpData.examples[sheetId];
					this.contextHelpExamplesText.innerHTML = '';
					var contextHelpFieldExamplesTABLE = elem('table', {attrs:{'class':'contextHelpFieldExamplesTABLE'}}, this.contextHelpExamplesText);
					for (var jobTitleUnderscores in helpExamples) {
						var jobTitle = jobTitleUnderscores.replace(/_/g, ' ');
						var contextHelpFieldExamplesTR = elem('tr', {attrs:{'class':'contextHelpFieldExamplesTR'}}, contextHelpFieldExamplesTABLE);
						elem('td', {attrs:{'class':'contextHelpFieldExamplesLabelTD'}, children: jobTitle}, contextHelpFieldExamplesTR);
						elem('td', {attrs:{'class':'contextHelpFieldExamplesValueTD'}, children: helpExamples[jobTitleUnderscores][fieldId]}, contextHelpFieldExamplesTR);
					}
				}
			};

			parentNode.innerHTML = removeAccidentalWhitespace(contextHelp_html);

			this.contextHelpDIV = parentNode.querySelector('.contextHelpDIV');
			this.contextHelpContentTD = this.contextHelpDIV.querySelector('.contextHelpContentTD');
			this.contextHelpExamplesTD = this.contextHelpDIV.querySelector('.contextHelpExamplesTD');
			this.contextHelpContentText = parentNode.querySelector('.contextHelpContentText');
			this.contextHelpExamplesText = parentNode.querySelector('.contextHelpExamplesText');

			var tokens = helpFieldId.split('.');
			var sheetId = tokens[0];
			var fieldId = tokens[1];
			if (helpData.main[sheetId] && helpData.main[sheetId][fieldId] && helpData.main[sheetId][fieldId].text) {
				if (fieldId == '_sheet') {
					showSheet.call(this, sheetId, fieldId);
				} else {
					showField.call(this, sheetId, fieldId);
				}
			} else {
				this.hide(parentNode);
			}
			parentNode.style.display = '';
		},

		hide: function(callback) {
			if (this.lastParentNode) {
				//FIXME: Add animations
				var params = { elem:this.contextHelpDIV, animClassName:'contextHelpShrinkAnim', animEndCallback: function() {
					cls.remove(params.elem, params.animClassName);
					this.contextHelpDIV.style.display = 'none';
					this.lastParentNode.innerHTML = '';
					this.lastParentNode = this.lastHelpFieldId = null;
					if (callback) {
						callback();
					}
				}.bind(this)};
				animProps(params);
			}
		}
	}
});
