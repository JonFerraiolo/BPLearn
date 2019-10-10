define([
	'../util/request',
	'../util/cls',
	'../modal/popup',
	'text!./helpOverview.html',
	'../util/removeAccidentalWhitespace'
], function(
	request,
	cls,
	popup,
	helpOverview_html,
	removeAccidentalWhitespace
) {

	var pathRoot = (location.pathname == '/') ? '/' : location.pathname.substr(0, location.pathname.lastIndexOf('/')+1);
	var zeroPad = function(num, size) {	// size must be <=10, if num has more dijits than size it will only return rightmost <size> digits
	    var s = "0000000000" + num;
	    return s.substr(s.length-size);
	};

	return {
		show: function(user) {

			var popupElem = popup.show({
				content: removeAccidentalWhitespace(helpOverview_html),
				clickAwayToClose: false
			});
			var fullScreenModalCloseButton = popupElem.querySelector('.fullScreenModalCloseButton');
			fullScreenModalCloseButton.addEventListener('click', function(e) {
				e.stopPropagation();
				popup.hide();
			}, false);
			var helpOverviewGotoWelcome = popupElem.querySelector('.helpOverviewGotoWelcome');
			helpOverviewGotoWelcome.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				popup.hide();
				setTimeout(function() {
					// Can't put helpWelcome in top-level dependencies because of circular
					// logic where helpWelcome calls helpOverview and vice versa.
					// One of them can't call the other in top-level dependencies.
					require(['./helpWelcome/helpWelcome'], function(helpWelcome) {
						helpWelcome.show();
					});
				}, 500);
			}, false);
		}
	}
	
});