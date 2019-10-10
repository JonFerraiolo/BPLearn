define([
	'../util/request',
	'../util/cls',
	'../modal/popup',
	'../registerLogin/validateRegFields',
	'text!./myAccount.html',
	'../util/removeAccidentalWhitespace'
], function(
	request,
	cls,
	popup,
	validateRegFields,
	myAccount_html,
	removeAccidentalWhitespace
) {

	var pathRoot = (location.pathname == '/') ? '/' : location.pathname.substr(0, location.pathname.lastIndexOf('/')+1);
	var invalidFieldClass = 'myAccountInvalidField';
	var zeroPad = function(num, size) {	// size must be <=10, if num has more dijits than size it will only return rightmost <size> digits
	    var s = "0000000000" + num;
	    return s.substr(s.length-size);
	};

	return {
		show: function(user, pendingChanges, initialTab) {

			var currentTab = initialTab || 'Personal';
			var pendingChanges = pendingChanges || {};
			var unsavedChanges = [];
			for (var i in pendingChanges) {
				unsavedChanges.push(i);
			}
			var updatePendingChanges = function() {
				pendingChanges = {};
				unsavedChanges.forEach(function(field){
					var value = popupElem.querySelector('[data-bp-myAccountINPUT='+field+']').value;
					pendingChanges[field] = value;
				});
			};
			var enableFieldChange = function(field, initialValue) {
				var myAccountBUTTON = popupElem.querySelector('[data-bp-myAccountChangeBUTTON='+field+']');
				var myAccountSPAN = popupElem.querySelector('[data-bp-myAccountSPAN='+field+']');
				var myAccountINPUT = popupElem.querySelector('[data-bp-myAccountINPUT='+field+']');
				myAccountBUTTON.disabled = true;
				myAccountCancelBUTTON.textContent = 'Cancel';
				myAccountSPAN.style.display = 'none';
				myAccountINPUT.style.display = '';
				myAccountUpdateBUTTON.disabled = false;
				if (field == 'password') {
					myAccountRepeatPasswordTR.style.visibility = '';
					popupElem.querySelector('[data-bp-myAccountINPUT=password2]').style.display = '';
				} else if (field == 'ccNumber') {
					myAccountExpiresTR.style.visibility = '';
					myAccountCVVTR.style.visibility = '';
					popupElem.querySelector('[data-bp-myAccountINPUT=ccExpires]').style.display = '';
					popupElem.querySelector('[data-bp-myAccountINPUT=ccCVV]').style.display = '';
				}
			};

			var emptyField = function(elem) {
				return (elem.value.length == 0);
			};

			var verifyInputFields = function() {
				var addErrorMessage = function(elem, field, msg) {
					if (!anyErrors) {
						myAccountErrors.innerHTML = msg;
						anyErrors = true;
						makeFieldVisible(field);
					}
				};
				for (var i=0; i<myAccountINPUTs.length; i++) {
					var inputElem = myAccountINPUTs[i];
					cls.remove(inputElem, invalidFieldClass);
				}
				var anyErrors = false;
				myAccountErrors.innerHTML = '';
				unsavedChanges.forEach(function(field) {
					var inputElem = popupElem.querySelector('[data-bp-myAccountINPUT='+field+']');
					cls.remove(inputElem, invalidFieldClass);
					if (emptyField(inputElem)) {
						cls.add(inputElem, invalidFieldClass);
						addErrorMessage(inputElem, field, 'One or more fields is empty.');
					}
					var value = inputElem.value;
					if (field == 'email' && !validateRegFields.isValidEmail(value)) {
						cls.add(inputElem, invalidFieldClass);
						addErrorMessage(inputElem, field, 'Invalid email address.');
					}
					if (field == 'password') {
						var pw1Elem = popupElem.querySelector('[data-bp-myAccountINPUT=password]');
						var pw2Elem = popupElem.querySelector('[data-bp-myAccountINPUT=password2]');
						var pw1 = pw1Elem.value;
						var pw2 = pw2Elem.value;
						if (pw1 != pw2) {
							cls.add(pw1Elem, invalidFieldClass);
							cls.add(pw2Elem, invalidFieldClass);
							addErrorMessage(pw1Elem, field, 'Passwords do not match.');
						}
						if (pw1.length < 8 || pw2.length < 8) {
							cls.add(pw1Elem, invalidFieldClass);
							cls.add(pw2Elem, invalidFieldClass);
							addErrorMessage(pw1Elem, field, 'Passwords must be at least 8 characters long.');
						}
					}
					if (field == 'ccNumber') {
						var ccnElem = popupElem.querySelector('[data-bp-myAccountINPUT=ccNumber]');
						var ccn = ccnElem.value;
						if (!validateRegFields.isValidCCN(ccn)) {
							cls.add(ccnElem, invalidFieldClass);
							addErrorMessage(ccnElem, field, 'Invalid credit card number.');
						}
						var expiresElem = popupElem.querySelector('[data-bp-myAccountINPUT=ccExpires]');
						var expires = expiresElem.value;
						if (!validateRegFields.isValidExpiration(expires)) {
							cls.add(expiresElem, invalidFieldClass);
							addErrorMessage(expiresElem, field, 'Invalid expiration date. Must be mm/yy.');
						}
						var cvvElem = popupElem.querySelector('[data-bp-myAccountINPUT=ccCVV]');
						var cvv = cvvElem.value;
						if (!validateRegFields.isValidCVV(ccn, cvv)) {
							cls.add(cvvElem, invalidFieldClass);
							addErrorMessage(cvvElem, field, 'Invalid card verification value (CVV).');
						}
					}
				});
				if (!anyErrors) {
					myAccountErrors.innerHTML = '';
				}
				return anyErrors;
			};

			var currentTabClassName = 'myAccountActive';
			var changeTabBar = function(tabToShow) {
				currentTab = tabToShow;
				for (var i=0; i<myAccountTabBarTDs.length; i++) {
					var myAccountTabBarTD = myAccountTabBarTDs[i];
					var id = myAccountTabBarTD.getAttribute('data-bp-myAccountTab');
					if (id == tabToShow) {
						cls.add(myAccountTabBarTD, currentTabClassName);
					} else {
						cls.remove(myAccountTabBarTD, currentTabClassName);
					}
				}
				for (var i=0; i<myAccountFieldsDIVs.length; i++) {
					var myAccountFieldsDIV = myAccountFieldsDIVs[i];
					var id = myAccountFieldsDIV.getAttribute('data-bp-myAccountDIV');
					if (id == tabToShow) {
						cls.add(myAccountFieldsDIV, currentTabClassName);
					} else {
						cls.remove(myAccountFieldsDIV, currentTabClassName);
					}
				}
				var myAccountButtonDIV = popupElem.querySelector('.myAccountButtonDIV');
				myAccountButtonDIV.style.display = tabToShow == 'Subscription' ? 'none' : '';
			};
			var makeFieldVisible = function(field) {
				if (['firstName', 'lastName', 'email', 'password'].indexOf(field) >= 0) {
					changeTabBar('Personal');
				} else if (field == 'ccNumber') {
					changeTabBar('Payment');
				}
			};
			var popupElem = popup.show({
				content: removeAccidentalWhitespace(myAccount_html),
				clickAwayToClose: false
			});

			['firstName', 'lastName', 'email'].forEach(function(field) {
				popupElem.querySelector('[data-bp-myAccountSPAN='+field+']').textContent = user[field];
				popupElem.querySelector('[data-bp-myAccountINPUT='+field+']').value = user[field];
			});
			popupElem.querySelector('[data-bp-myAccountSPAN=password]').textContent = '********';
			popupElem.querySelector('[data-bp-myAccountSPAN=ccNumber]').textContent = user.ccNumber;

			var myAccount = popupElem.querySelector('.myAccount');
			myAccount.addEventListener('click', function(e) {
				// prevent click on white space of dialog from closing dialog
				e.stopPropagation();
			}, false);
			var myAccountErrors = popupElem.querySelector('.myAccountErrors');
			myAccountErrors.innerHTML = '';
			var myAccountTabBarTDs = popupElem.querySelectorAll('.myAccountTabBarTD');
			var myAccountFieldsDIVs = popupElem.querySelectorAll('.myAccountFieldsDIV');
			var myAccountSPANs = popupElem.querySelectorAll('.myAccountSPAN');
			var myAccountINPUTs = popupElem.querySelectorAll('.myAccountINPUT');
			var myAccountChangeBUTTONs = popupElem.querySelectorAll('.myAccountChangeBUTTON');
			for (var i=0; i<myAccountINPUTs.length; i++) {
				var myAccountINPUT = myAccountINPUTs[i];
				myAccountINPUT.style.display = 'none';
			}
			var myAccountRepeatPasswordTR = popupElem.querySelector('.myAccountRepeatPasswordTR');
			myAccountRepeatPasswordTR.style.visibility = 'hidden';
			var myAccountExpiresTR = popupElem.querySelector('.myAccountExpiresTR');
			myAccountExpiresTR.style.visibility = 'hidden';
			var myAccountCVVTR = popupElem.querySelector('.myAccountCVVTR');
			myAccountCVVTR.style.visibility = 'hidden';
			for (var i=0; i<myAccountChangeBUTTONs.length; i++) {
				var myAccountChangeBUTTON = myAccountChangeBUTTONs[i];
				myAccountChangeBUTTON.addEventListener('click', function(e) {
					// prevent click on white space of dialog from closing dialog
					e.stopPropagation();
					var field = e.currentTarget.getAttribute('data-bp-myAccountChangeBUTTON');
					unsavedChanges.push(field);
					var myAccountSPAN = popupElem.querySelector('[data-bp-myAccountSPAN='+field+']');
					enableFieldChange(field, myAccountSPAN.textContent);
					setTimeout(function() {
						myAccountINPUT.focus();
					}, 0);
				}, false);
			}
			changeTabBar(currentTab);
			for (var i=0; i<myAccountTabBarTDs.length; i++) {
				var myAccountTabBarTD = myAccountTabBarTDs[i];
				myAccountTabBarTD.addEventListener('click', function(e) {
					e.stopPropagation();
					var id = e.currentTarget.getAttribute('data-bp-myAccountTab');
					changeTabBar(id);
				}, false);
			}
			var myAccountUpdateBUTTON = popupElem.querySelector('.myAccountUpdateBUTTON');
			myAccountUpdateBUTTON.disabled = true;
			myAccountUpdateBUTTON.addEventListener('click', function(e) {
				if (!verifyInputFields()) {
					updatePendingChanges();
					request({
						url: pathRoot+'xhr/updateAccount',
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(pendingChanges, null, '\t')
					}, function(status, responseText) {
						if (status == 200) {
							popup.hide();
							if (pendingChanges.email) {
								localStorage.lastLogin = pendingChanges.email;
							}
							// Refresh the browser after a slight delay to get a fresh new user object
							setTimeout(function() {
								location.reload();
							}, 10);
						} else {
							myAccountErrors.textContent = responseText;
						}
					});
				}
			}, false);
			var myAccountCancelBUTTON = popupElem.querySelector('.myAccountCancelBUTTON');
			myAccountCancelBUTTON.addEventListener('click', function(e) {
				e.stopPropagation();
				popup.hide();
			}, false);

			for (var field in pendingChanges) {
				var myAccountSPAN = popupElem.querySelector('[data-bp-myAccountSPAN='+field+']');
				enableFieldChange(field, myAccountSPAN.textContent);
			}
		}
	}
	
});
