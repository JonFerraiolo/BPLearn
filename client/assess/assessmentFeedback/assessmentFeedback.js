define([
	'text!./assessmentFeedback.html',
	'../../mvc/mvcbase',
	'../assessView/assessView',
	'../../util/cls',
	'../../util/removeAccidentalWhitespace'
], function(
	assessmentFeedback_html,
	mvcbase,
	assessView,
	cls,
	removeAccidentalWhitespace
) {
	return function() {
		cls.add(document.body, 'assessmentFeedback');
		document.body.innerHTML = removeAccidentalWhitespace(assessmentFeedback_html);
		var pageHeaderUserName = document.querySelector('.pageHeaderUserName');
		if (!window.BrandingPays || !window.BrandingPays.inviter || !window.BrandingPays.inviter) {
			alert('Error - missing user object - please send email to info@brandingpays.com, including this URL:'+window.location.href);
			return;
		} else if (window.BrandingPays.invitee) {
			var model = new mvcbase({
				inviter:window.BrandingPays.inviter, 
				invitee:window.BrandingPays.invitee, 
				Assessment:window.BrandingPays.Assessment });
		}
		var tokens = window.location.pathname.split('/');
		var assessmentIndex = tokens.lastIndexOf('assessment');
		var invitationId = tokens[assessmentIndex+1];
		if (!invitationId) {
			alert('Error - invalid URL - missing invitationID in /assessment/{invitationId}');
			return;
		}
		window.BrandingPays.uniqId = Math.ceil(Math.random()*1000000000000);
		pageHeaderUserName.textContent = window.BrandingPays.invitee.firstName || '';
		var assessViewParentNode = document.querySelector('.pageTableBodyTD');
		var assessViewInstance = new assessView(model, invitationId, assessViewParentNode);
		var socket = window.BrandingPays.socket = io.connect(location.href);
		socket.on('dataUpdate', function (data) {
			console.log('Client socket received: '+JSON.stringify(data, null, '\t'));
			// We just received a socket message from server saying data has changed
			// for the current email. Refresh the current page to get the new data
			// if the payload's sid does not match this browser sessions sid
			if (window.BrandingPays.uniqId != data.uniqId) {
				location.reload();	
			}
		});
	};
});
