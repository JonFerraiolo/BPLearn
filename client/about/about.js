define([
	'text!./about.html',
	'../util/removeAccidentalWhitespace'
], function(
	about_html,
	removeAccidentalWhitespace
) {

	var about = function(model, parentNode) {
		this.model = model;
		this.parentNode = parentNode;
		parentNode.innerHTML = removeAccidentalWhitespace(about_html);
	};

	return about;
});
