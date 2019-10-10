/**
 * XHR request. Modeled after Node.js's request package.
 */
define(function() {

	/**
	 * @param {object} params  Various parameters
	 * @param {string} params.url
	 * @param {string} [params.method]  GET|POST|etc. Default: GET
	 * @param {string} [params.headers]  Associative array for request headers. Indexed by header name. 
	 * @param {string} [params.body]  Body to send with the XHR request. 
	 * @param {function} callback  Has 2 parameters: (statusCode, responseText)
	 */
	return function(params, callback) {
		var url = params.url;
		var method = (params.method || 'GET').toUpperCase();
		var headers = params.headers || {};
		var body = params.body || undefined;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback(xhr.status, xhr.responseText);
			}
		};
		xhr.open(method, url, true);
		for (var i in headers) {
			xhr.setRequestHeader(i, headers[i]);
		}
		xhr.send(body);
	};
});