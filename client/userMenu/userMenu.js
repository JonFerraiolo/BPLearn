define([
	'../util/request',
	'../util/cls',
	'../modal/popup',
	'text!./userMenu.html',
	'../util/removeAccidentalWhitespace',
	'../myAccount/myAccount',
	'../mySubscription/mySubscription'
], function(
	request,
	cls,
	popup,
	userMenu_html,
	removeAccidentalWhitespace,
	myAccount,
	mySubscription
) {

	var pathRoot = (location.pathname == '/') ? '/' : location.pathname.substr(0, location.pathname.lastIndexOf('/')+1);

	return {
		show: function(refNode, user) {
			var popupElem = popup.show({
				content: removeAccidentalWhitespace(userMenu_html),
				refNode: refNode,
				refX: 'right',
				popupX: 'right',
				refY: 'bottom',
				popupY: 'top',
				underlayOpacity: '0.0',
				hideCallback: function() {
					cls.remove(refNode, 'popupMenuShowing');
				}
			});
			cls.add(refNode, 'popupMenuShowing');
			// In case user clicks on a part of menu that doesn't map to a command
			popupElem.addEventListener('click', function(e) {
				popup.hide();
			}, false);
			var myAccountElem = popupElem.querySelector('[data-bp-value=myAccount]');
			myAccountElem.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				popup.hide();
				myAccount.show(user);
			});
			var mySubscriptionElem = popupElem.querySelector('[data-bp-value=mySubscription]');
			mySubscriptionElem.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				popup.hide();
				mySubscription.show(user);
			});
			var logoutElem = popupElem.querySelector('[data-bp-value=logout]');
			logoutElem.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				popup.hide();
				var sendRequest = function() {
					request({
						method: 'POST',
						url: '/xhr/logout'
					}, function(status, responseText) {
						location.href = pathRoot + 'startup';
					});
				};
				if (window.BrandingPays.socket) {
					window.BrandingPays.socket.emit('logout', null, function() {
						sendRequest();
					});
				} else {
					sendRequest();
				}
			}, false);
		}
	}
	
});