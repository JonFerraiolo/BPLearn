define([
	'./validateRegFields',
	'text!./registerLogin.html',
	'../util/urlParams',
	'../util/cls',
	'../util/removeAccidentalWhitespace',
	'../util/request',
	'../util/animSlide',
	'../modal/popup',
	'text!./registrationSuccess.html'
], function(
	validateRegFields,
	registerLogin_html,
	urlParams,
	cls,
	removeAccidentalWhitespace,
	request,
	animSlide,
	popup,
	registrationSuccess_html
) {
	var transferChildren = function(oldDiv, newDiv) {
		newDiv.innerHTML = '';
		for (var i=oldDiv.childNodes.length-1; i>=0; i--) {
			newDiv.insertBefore(oldDiv.childNodes[i], newDiv.firstChild);
		}
	};

	var regType = '30daytrial';
	var registerLoginPageOuter, registerErrors, paymentErrors;
	var inputs = {};
	var registerUserInfo = [ 'registerInputFirstName', 'registerInputLastName', 
		'registerInputEmail', 'registerInputPassword1', 'registerLoginTOSCheckbox' ];
	var registerUserInfoRequired = [ 'registerInputFirstName', 'registerInputLastName', 
		'registerInputEmail', 'registerInputPassword1' ];
	var registerPayment = [ 'registerInputCCN', 'registerInputExpires', 'registerInputCVV',
		'registerInputDiscountCode' ];
	var registerPaymentRequired = [ 'registerInputCCN', 'registerInputExpires', 'registerInputCVV' ];
	var postFieldsXref = {
		registerInputFirstName: 'firstName', 
		registerInputLastName: 'lastName', 
		registerInputEmail: 'email', 
		registerInputCCN: 'ccNumber', 
		registerInputExpires: 'ccExpires', 
		registerInputCVV: 'ccCVV', 
		registerInputDiscountCode: 'discountCode'
	};
	var loginFields = ['loginInputEmail', 'loginInputPassword' ];
	var forgotPasswordFields = ['loginInputEmail' ];
	var resetPasswordFields = ['resetPasswordInputPassword1'];
	var emptyField = function(elem) {
		return (elem.value.length == 0);
	};
	var invalidFieldClass = 'registerLoginInvalidField';
	var verifyRegisterUserInfo = function() {
		var addErrorMessage = function(elem, msg) {
			if (!anyErrors) {
				userInfoErrors.innerHTML = msg;
				anyErrors = true;
				elem.focus();
			}
		};
		var anyErrors = false;
		registerUserInfo.forEach(function(registerField) {
			var inputElem = inputs[registerField];
			if (registerUserInfoRequired.indexOf(registerField)>=0 && emptyField(inputElem)) {
				cls.add(inputElem, invalidFieldClass);
				addErrorMessage(inputElem, 'One or more fields is empty.');
			} else {
				cls.remove(inputElem, invalidFieldClass);
			}
		});
		var emailElem = inputs.registerInputEmail;
		var email = emailElem.value;
		if (!validateRegFields.isValidEmail(email)) {
			cls.add(emailElem, invalidFieldClass);
			addErrorMessage(emailElem, 'Invalid email address.');
		}
		var pw1Elem = inputs.registerInputPassword1;
		var pw1 = pw1Elem.value;
		if (pw1.length < 8) {
			cls.add(pw1Elem, invalidFieldClass);
			addErrorMessage(pw1Elem, 'Passwords must be at least 8 characters long.');
		}
		if (!inputs.registerLoginTOSCheckbox.checked) {
			cls.add(inputs.registerLoginTOSCheckbox, invalidFieldClass);
			addErrorMessage(pw1Elem, 'You must agree to the Terms of Service.');
		}
		if (!anyErrors) {
			userInfoErrors.innerHTML = '';
		}
		return anyErrors;
	};
	var verifyRegisterPayment = function() {
		var addErrorMessage = function(elem, msg) {
			if (!anyErrors) {
				paymentErrors.innerHTML = msg;
				anyErrors = true;
				elem.focus();
			}
		};
		var anyErrors = false;
		registerPayment.forEach(function(registerField) {
			var inputElem = inputs[registerField];
			if (registerPaymentRequired.indexOf(registerField)>=0 && emptyField(inputElem)) {
				cls.add(inputElem, invalidFieldClass);
				addErrorMessage(inputElem, 'One or more fields is empty.');
			} else {
				cls.remove(inputElem, invalidFieldClass);
			}
		});
		var ccnElem = inputs.registerInputCCN;
		var ccn = ccnElem.value;
		if (!validateRegFields.isValidCCN(ccn)) {
			cls.add(ccnElem, invalidFieldClass);
			addErrorMessage(ccnElem, 'Invalid credit card number.');
		}
		var expiresElem = inputs.registerInputExpires;
		var expires = expiresElem.value;
		if (!validateRegFields.isValidExpiration(expires)) {
			cls.add(expiresElem, invalidFieldClass);
			addErrorMessage(expiresElem, 'Invalid expiration date. Must be mm/yy.');
		}
		var cvvElem = inputs.registerInputCVV;
		var cvv = cvvElem.value;
		if (!validateRegFields.isValidCVV(ccn, cvv)) {
			cls.add(cvvElem, invalidFieldClass);
			addErrorMessage(cvvElem, 'Invalid card verification value (CVV).');
		}
		if (!anyErrors) {
			userInfoErrors.innerHTML = '';
		}
		return anyErrors;
	};
	var verifyLoginFields = function() {
		var addErrorMessage = function(elem, msg) {
			if (!anyErrors) {
				loginErrors.innerHTML = msg;
				anyErrors = true;
				elem.focus();
			}
		};
		var anyErrors = false;
		loginFields.forEach(function(loginField) {
			var inputElem = inputs[loginField];
			cls.remove(inputElem, invalidFieldClass);
			if (emptyField(inputElem)) {
				cls.add(inputElem, invalidFieldClass);
				addErrorMessage(inputElem, 'One or more fields is empty.');
			} else {
				cls.remove(inputElem, invalidFieldClass);
			}
		});
		var emailElem = inputs.loginInputEmail;
		var email = emailElem.value;
		if (!validateRegFields.isValidEmail(email)) {
			cls.add(emailElem, invalidFieldClass);
			addErrorMessage(emailElem, 'Invalid email address.');
		}
		if (!anyErrors) {
			loginErrors.innerHTML = '';
		}
		return anyErrors;
	};
	//FIXME: consolidate the verify functions
	var verifyForgotPasswordFields = function() {
		var addErrorMessage = function(elem, msg) {
			if (!anyErrors) {
				loginErrors.innerHTML = msg;
				anyErrors = true;
				elem.focus();
			}
		};
		var anyErrors = false;
		forgotPasswordFields.forEach(function(loginField) {
			var inputElem = inputs[loginField];
			cls.remove(inputElem, invalidFieldClass);
			if (emptyField(inputElem)) {
				cls.add(inputElem, invalidFieldClass);
				addErrorMessage(inputElem, 'One or more fields is empty.');
			} else {
				cls.remove(inputElem, invalidFieldClass);
			}
		});
		var emailElem = inputs.loginInputEmail;
		var email = emailElem.value;
		if (!validateRegFields.isValidEmail(email)) {
			cls.add(emailElem, invalidFieldClass);
			addErrorMessage(emailElem, 'Invalid email address.');
		}
		if (!anyErrors) {
			loginErrors.innerHTML = '';
		}
		return anyErrors;
	};
	var verifyResetPasswordFields = function() {
		var addErrorMessage = function(elem, msg) {
			if (!anyErrors) {
				resetPasswordErrors.innerHTML = msg;
				anyErrors = true;
				elem.focus();
			}
		};
		var anyErrors = false;
		resetPasswordFields.forEach(function(resetField) {
			var inputElem = inputs[resetField];
			cls.remove(inputElem, invalidFieldClass);
			if (emptyField(inputElem)) {
				cls.add(inputElem, invalidFieldClass);
				addErrorMessage(inputElem, 'One or more fields is empty.');
			} else {
				cls.remove(inputElem, invalidFieldClass);
			}
		});
		var pw1Elem = inputs.resetPasswordInputPassword1;
		var pw1 = pw1Elem.value;
		if (pw1.length < 8) {
			cls.add(pw1Elem, invalidFieldClass);
			addErrorMessage(pw1Elem, 'Passwords must be at least 8 characters long.');
		}
		if (!anyErrors) {
			resetPasswordErrors.innerHTML = '';
		}
		return anyErrors;
	};

	var pathRoot = location.pathname.substr(0, location.pathname.lastIndexOf('/startup')+1);

	return function() {
		urlParams();
		if (window.BrandingPays.urlParams.clearLocalStorage=='1') {
			localStorage.clear();
		}
		cls.add(document.documentElement, 'registerLogin');
		cls.add(document.body, 'registerLogin');
		document.body.innerHTML = removeAccidentalWhitespace(registerLogin_html);
		registerLoginPageOuter = document.querySelector('.registerLoginPageOuter');
		userInfoErrors = registerLoginPageOuter.querySelector('.userInfoErrors');
		paymentErrors = registerLoginPageOuter.querySelector('.paymentErrors');
		loginErrors = registerLoginPageOuter.querySelector('.loginErrors');
		resetPasswordErrors = registerLoginPageOuter.querySelector('.resetPasswordErrors');
		registerUserInfo.forEach(function(registerField) {
			inputs[registerField] = registerLoginPageOuter.querySelector('.'+registerField);
		});
		registerPayment.forEach(function(registerField) {
			inputs[registerField] = registerLoginPageOuter.querySelector('.'+registerField);
		});
		loginFields.forEach(function(loginField) {
			inputs[loginField] = registerLoginPageOuter.querySelector('.'+loginField);
		});
		resetPasswordFields.forEach(function(resetField) {
			inputs[resetField] = registerLoginPageOuter.querySelector('.'+resetField);
		});
		var registerLoginBannerANCHOR = registerLoginPageOuter.querySelector('.registerLoginBannerANCHOR');
		registerLoginBannerANCHOR.addEventListener('click', function(e) {
			e.preventDefault();
			location.href = pathRoot+location.search;
		}, false);
		var registerLoginShowPasswordCheckbox = registerLoginPageOuter.querySelector('.registerLoginShowPasswordCheckbox');
		registerLoginShowPasswordCheckbox.addEventListener('change', function(e) {
			e.preventDefault();
			inputs.registerInputPassword1.type = (e.target.checked ? 'text' : 'password');
		}, false);
		var resetPasswordShowPasswordCheckbox = registerLoginPageOuter.querySelector('.resetPasswordShowPasswordCheckbox');
		resetPasswordShowPasswordCheckbox.addEventListener('change', function(e) {
			e.preventDefault();
			inputs.resetPasswordInputPassword1.type = (e.target.checked ? 'text' : 'password');
		}, false);
		var registerSlideInContainer = registerLoginPageOuter.querySelector('.registerSlideInContainer');
		var loginSlideInContainer = registerLoginPageOuter.querySelector('.loginSlideInContainer');
		var registerPaymentSlideInContainer = registerLoginPageOuter.querySelector('.registerPaymentSlideInContainer');
		var resetPasswordSlideInContainer = registerLoginPageOuter.querySelector('.resetPasswordSlideInContainer');
		var alreadyRegistered = (localStorage.lastLogin ? true : false);
		var resetPasswordId;
		var matches = location.pathname.match(/\/startup\/(\d+)/);
		if (matches) {
			// the URL is of form /startup/NNNNN, which means a reset password request
			resetPasswordId = matches[1];
			registerSlideInContainer.style.display = 'none';
			loginSlideInContainer.style.display = 'none';
			registerPaymentSlideInContainer.style.display = 'none';
			resetPasswordSlideInContainer.style.display = '';
		} else {
			if (alreadyRegistered) {
				registerSlideInContainer.style.display = 'none';
				loginSlideInContainer.style.display = '';
				inputs.loginInputEmail.value = localStorage.lastLogin || '';
			} else {
				registerSlideInContainer.style.display = '';
				loginSlideInContainer.style.display = 'none';
			}
			registerPaymentSlideInContainer.style.display = 'none';
			resetPasswordSlideInContainer.style.display = 'none';
		}
		var gotoLoginANCHOR = registerLoginPageOuter.querySelector('.gotoLoginANCHOR');
		gotoLoginANCHOR.addEventListener('click', function(e) {
			e.preventDefault();
			loginSlideInContainer.style.display = 'inline-block';
			registerPaymentSlideInContainer.style.display = 'none';
			resetPasswordSlideInContainer.style.display = 'none';
			var animClassName = 'registerLoginSlideFromRightAnim';
			animSlide.fromRight({
				leftContentDiv: registerSlideInContainer,
				animClassName: animClassName,
				animEndCallback: function(e) {
					cls.remove(registerSlideInContainer, animClassName);
					registerSlideInContainer.style.display = 'none';
				}
			});
		}, false);
		var gotoRegisterANCHOR = registerLoginPageOuter.querySelector('.gotoRegisterANCHOR');
		gotoRegisterANCHOR.addEventListener('click', function(e) {
			e.preventDefault();
			returnToRegister(loginSlideInContainer);
		}, false);
		var gotoPayment = function() {
			registerSlideInContainer.style.display = 'inline-block';
			loginSlideInContainer.style.display = 'none';
			registerPaymentSlideInContainer.style.display = 'inline-block';
			resetPasswordSlideInContainer.style.display = 'none';
			var animClassName = 'registerLoginSlideFromRightAnim';
			animSlide.fromRight({
				leftContentDiv: registerSlideInContainer,
				animClassName: animClassName,
				animEndCallback: function(e) {
					cls.remove(registerSlideInContainer, animClassName);
					registerSlideInContainer.style.display = 'none';
				}
			});
		};
		var registerFreeTrialBUTTON = registerLoginPageOuter.querySelector('.registerFreeTrialBUTTON');
		registerFreeTrialBUTTON.addEventListener('click', function(e) {
			var anyErrors = verifyRegisterUserInfo();
			if (!anyErrors) {
				gotoPayment();
			}
		});
		var registerGoBackBUTTON = registerLoginPageOuter.querySelector('.registerGoBackBUTTON');
		registerGoBackBUTTON.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			returnToRegister(registerPaymentSlideInContainer, inputs.registerInputFirstName, null);
		});
		var returnToRegister = function(rightContainerElem, focusElem, errMsg) {
			registerSlideInContainer.style.display = 'inline-block';
			loginSlideInContainer.style.display = 'none';
			registerPaymentSlideInContainer.style.display = 'none';
			resetPasswordSlideInContainer.style.display = 'none';
			rightContainerElem.style.display = 'inline-block';
			var animClassName = 'registerLoginSlideFromLeftAnim';
			animSlide.fromLeft({
				leftContentDiv: registerSlideInContainer,
				animClassName: animClassName,
				animEndCallback: function(e) {
					cls.remove(registerSlideInContainer, animClassName);
					rightContainerElem.style.display = 'none';
					if (errMsg) {
						userInfoErrors.innerHTML = errMsg;
						paymentErrors.innerHTML = errMsg;
					}
					if (focusElem) {
						focusElem.focus();
					}
				}
			});
		};
		var registerPaymentFinishBUTTON = registerLoginPageOuter.querySelector('.registerPaymentFinishBUTTON');
		registerPaymentFinishBUTTON.addEventListener('click', function(e) {
			var anyErrors = verifyRegisterPayment();
			if (anyErrors) {
				return;
			}
			var obj = { 
				regType: regType,
				password: inputs.registerInputPassword1.value
			};
			registerUserInfo.forEach(function(registerField) {
				if (registerField.indexOf('Password') < 0) {
					obj[postFieldsXref[registerField]] = inputs[registerField].value;
				}
			});
			registerPayment.forEach(function(registerField) {
				obj[postFieldsXref[registerField]] = inputs[registerField].value;
			});
			request({
				url: pathRoot+'xhr/register',
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(obj, null, '\t')
			}, function(status, responseText) {
				if (status == 200) {
					var loginObj = { email: obj.email, password: obj.password };
					request({
						url: pathRoot+'xhr/login',
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(loginObj, null, '\t')
					}, function(status, responseText) {
						if (status == 200) {
							popup.show({
								content: registrationSuccess_html,
								hideCallback: function() {
									location.href = pathRoot+location.search;
								}
							});
							setTimeout(function() {
								popup.hide();
							}, 5000);
						} else {
							returnToRegister(registerPaymentSlideInContainer, inputs.registerInputEmail, responseText);
						}
					});
				} else {
					returnToRegister(registerPaymentSlideInContainer, inputs.registerInputEmail, responseText);
				}
			});
		});
		var loginBUTTON = registerLoginPageOuter.querySelector('.loginBUTTON');
		loginBUTTON.addEventListener('click', function(e) {
			var anyErrors = verifyLoginFields();
			if (!anyErrors) {
				var loginObj = { email: inputs.loginInputEmail.value, password: inputs.loginInputPassword.value };
				request({
					url: pathRoot+'xhr/login',
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(loginObj, null, '\t')
				}, function(status, responseText) {
					if (status == 200) {
						cls.remove(inputs.loginInputEmail, invalidFieldClass);
						cls.remove(inputs.loginInputPassword, invalidFieldClass);
						location.href = pathRoot+location.search;
					} else {
						if (status == 401) {
							loginErrors.innerHTML = 'Incorrect password';
							cls.remove(inputs.loginInputEmail, invalidFieldClass);
							cls.add(inputs.loginInputPassword, invalidFieldClass);
							inputs.loginInputPassword.focus();
						} else {
							loginErrors.innerHTML = responseText;
							cls.add(inputs.loginInputEmail, invalidFieldClass);
							cls.remove(inputs.loginInputPassword, invalidFieldClass);
							inputs.loginInputEmail.focus();
						}
					}
				});
			}
		});
		var loginForgotPasswordANCHOR = registerLoginPageOuter.querySelector('.loginForgotPasswordANCHOR');
		loginForgotPasswordANCHOR.addEventListener('click', function(e) {
			e.preventDefault();
			var anyErrors = verifyForgotPasswordFields();
			if (!anyErrors) {
				var forgotPasswordObj = { email: inputs.loginInputEmail.value };
				request({
					url: pathRoot+'xhr/forgotPassword',
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(forgotPasswordObj, null, '\t')
				}, function(status, responseText) {
					if (status == 200) {
						loginErrors.innerHTML = 'Email sent with instructions to reset password'
					} else {
						loginErrors.innerHTML = responseText;
					}
				});
			}
		}, false);
		var resetPasswordUpdatePasswordBUTTON = registerLoginPageOuter.querySelector('.resetPasswordUpdatePasswordBUTTON');
		resetPasswordUpdatePasswordBUTTON.addEventListener('click', function(e) {
			e.preventDefault();
			var anyErrors = verifyResetPasswordFields();
			if (!anyErrors) {
				var resetPasswordObj = { _id: resetPasswordId, password: inputs.resetPasswordInputPassword1.value };
				request({
					url: pathRoot+'xhr/resetPassword',
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(resetPasswordObj, null, '\t')
				}, function(status, responseText) {
					if (status == 200) {
						cls.remove(inputs.resetPasswordInputPassword1, invalidFieldClass);
						var loginObj = { email: responseText, password: inputs.resetPasswordInputPassword1.value };
						request({
							url: pathRoot+'xhr/login',
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(loginObj, null, '\t')
						}, function(status, responseText) {
							if (status == 200) {
								location.href = pathRoot+location.search;
							} else {
								resetPasswordErrors = responseText;
							}
						});
					} else {
						resetPasswordErrors = responseText;
					}
				});
			}
		});
		var resetPasswordReturnBUTTON = registerLoginPageOuter.querySelector('.resetPasswordReturnBUTTON');
		resetPasswordReturnBUTTON.addEventListener('click', function(e) {
			registerSlideInContainer.style.display = 'none';
			loginSlideInContainer.style.display = 'inline-block';
			registerPaymentSlideInContainer.style.display = 'none';
			resetPasswordSlideInContainer.style.display = 'inline-block';
			var animClassName = 'registerLoginSlideFromLeftAnim';
			animSlide.fromLeft({
				leftContentDiv: loginSlideInContainer,
				animClassName: animClassName,
				animEndCallback: function(e) {
					cls.remove(loginSlideInContainer, animClassName);
					resetPasswordSlideInContainer.style.display = 'none';
				}
			});
		});
	};
});