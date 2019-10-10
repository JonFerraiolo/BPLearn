define([
	'../util/request',
	'../util/cls',
	'../modal/popup',
	'text!./helpWelcome.html',
	'../util/removeAccidentalWhitespace',
	'../helpOverview/helpOverview'
], function(
	request,
	cls,
	popup,
	helpWelcome_html,
	removeAccidentalWhitespace,
	helpOverview
) {

	var pathRoot = (location.pathname == '/') ? '/' : location.pathname.substr(0, location.pathname.lastIndexOf('/')+1);
	var zeroPad = function(num, size) {	// size must be <=10, if num has more dijits than size it will only return rightmost <size> digits
	    var s = "0000000000" + num;
	    return s.substr(s.length-size);
	};

	return {
		show: function() {

			var popupElem = popup.show({
				content: removeAccidentalWhitespace(helpWelcome_html),
				clickAwayToClose: false,
				underlayOpacity: .2
			});
			var helpWelcomeCloseButton = popupElem.querySelector('.helpWelcomeCloseButton');
			helpWelcomeCloseButton.addEventListener('click', function(e) {
				e.stopPropagation();
				popup.hide();
			}, false);
		}
	}
	
});