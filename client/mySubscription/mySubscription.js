define([
	'../util/request',
	'../util/cls',
	'../modal/popup',
	'text!./mySubscription.html',
	'text!./cancellationSuccess.html',
	'../util/removeAccidentalWhitespace'
], function(
	request,
	cls,
	popup,
	mySubscription_html,
	cancellationSuccess_html,
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
				content: removeAccidentalWhitespace(mySubscription_html),
				clickAwayToClose: false
			});
			var mySubscriptionCancelSubscriptionBUTTON = popupElem.querySelector('.mySubscriptionCancelSubscriptionBUTTON');
			mySubscriptionCancelSubscriptionBUTTON.addEventListener('click', function(e) {
				request({
					url: pathRoot+'xhr/cancelSubscription',
					method: 'POST',
					body: ''
				}, function(status, responseText) {
					popup.hide();
					if (status == 200) {
						popup.show({
							content: cancellationSuccess_html,
							hideCallback: function() {
								location.href = pathRoot;
							}
						});
						setTimeout(function() {
							popup.hide();
						}, 5000);
					} else {
						alert('Account cancellation error: '+responseText);
					}
				});
			}, false);
			var mySubscriptionCloseBUTTON = popupElem.querySelector('.mySubscriptionCloseBUTTON');
			mySubscriptionCloseBUTTON.addEventListener('click', function(e) {
				e.stopPropagation();
				popup.hide();
			}, false);
			var today = new Date();
			var firstRecurringPaymentDate = new Date(user.subscription.firstRecurringPaymentDate);
			if (user.subscription.regType == '30daytrial' && firstRecurringPaymentDate > today) {
				var mySubscriptionNormalAnnual = popupElem.querySelector('.mySubscriptionNormalAnnual');
				mySubscriptionNormalAnnual.style.display = 'none';
				var mySubscriptionFirstChargeAmount = popupElem.querySelector('.mySubscriptionFirstChargeAmount');
				mySubscriptionFirstChargeAmount.textContent = '$'+(user.subscription.recurringPayment||0.00)+' (USD)';
				var mySubscriptionFirstChargeDate = popupElem.querySelector('.mySubscriptionFirstChargeDate');
				if (user.subscription.firstRecurringPaymentDate) {
					mySubscriptionFirstChargeDate.textContent = firstRecurringPaymentDate.getUTCFullYear() + '/' + 
						zeroPad(firstRecurringPaymentDate.getUTCMonth()+1, 2) + '/' + 
						zeroPad(firstRecurringPaymentDate.getUTCDate(), 2);
				} else {
					mySubscriptionFirstChargeDate.textContent = '(never)';
				}
			} else {
				var mySubscription30DayTrial = popupElem.querySelector('.mySubscription30DayTrial');
				mySubscription30DayTrial.style.display = 'none';
				var mySubscriptionStartDate = popupElem.querySelector('.mySubscriptionStartDate');
				var firstPaymentDate = new Date(user.subscription.firstPaymentDate);
				mySubscriptionStartDate.textContent = firstPaymentDate.getUTCFullYear() + '/' + 
					zeroPad(firstPaymentDate.getUTCMonth()+1, 2) + '/' + 
					zeroPad(firstPaymentDate.getUTCDate(), 2);
				var mySubscriptionSubsequentChargeAmount = popupElem.querySelector('.mySubscriptionSubsequentChargeAmount');
				mySubscriptionSubsequentChargeAmount.textContent = '$'+(user.subscription.recurringPayment||0.00)+' (USD)';
			}
		}
	}
	
});