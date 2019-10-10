/**
 * Parses URL parameters, stores as object in window.BrandingPays.urlParams
 */
define(function() {
	return function() {
		if (!window.BrandingPays) {
			window.BrandingPays = {};
		}
		var urlParams = window.BrandingPays.urlParams = {};
		if (location.search.length > 0) {
			var params = location.search.substr(1).split('&');
			for (var i=0; i<params.length; i++) {
				var tokens = params[i].split('=');
				urlParams[decodeURIComponent(tokens[0])] = decodeURIComponent(tokens[1]);
			}
		}
	};
});