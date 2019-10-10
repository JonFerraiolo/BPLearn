define([
	'text!./helpGeneral.html',
	'../util/urlParams',
	'../util/cls',
	'../util/removeAccidentalWhitespace'
], function(
	helpGeneral_html,
	urlParams,
	cls,
	removeAccidentalWhitespace
) {

	var pathRoot = location.pathname.substr(0, location.pathname.lastIndexOf('/startup')+1);

	return function() {
		urlParams();
		if (window.BrandingPays.urlParams.clearLocalStorage=='1') {
			localStorage.clear();
		}
		cls.add(document.documentElement, 'helpGeneral');
		cls.add(document.body, 'helpGeneral');
		document.body.innerHTML = removeAccidentalWhitespace(helpGeneral_html);
	};
});