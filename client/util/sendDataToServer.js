/**
 * Push most recent data block to the server
 */
define([
	'./request'
], function(request) {
	return function(model, pathRoot, prop, oldValue, newValue, params) {
		var payload = {
			data: model.get(''),
			params: params
		};
		request({
			url: pathRoot+'xhr/data',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload, null, '\t')
		}, function(status, responseText) {
			if (status === 200) {
				// Send socket message to the server so that server can emit messages
				// to other browser sessions corresponding to the same email
				window.BrandingPays.socket.emit('dataUpdate', {uniqId:window.BrandingPays.uniqId});
			} else {
				console.error('xhr/data unexpected response. status='+status+', responseText='+responseText);
			}
		});
	};
});
