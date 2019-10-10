/**
 * login/register POST commands, issued via XHR POST's from the browser
 */

var sendMail = require('../util/sendMail'),
	billing = require('../util/billing'),
	nodePromise = require('node-promise');

var Promise = nodePromise.Promise,
	AllOrNone = nodePromise.allOrNone;

var isStringNotEmpty = function(value) {
	return typeof value == 'string' && value.length > 0;
};
var validateName = function(value) {
	return isStringNotEmpty(value);
};
var zeroPad = function(num, size) {	// size must be <=10, if num has more dijits than size it will only return rightmost <size> digits
    var s = "0000000000" + num;
    return s.substr(s.length-size);
};

//FIXME: remove 'normalAnnualSubscription'
var regTypes = [ 'normalAnnualSubscription', '30daytrial' ];
var oneDayMilliseconds = 24 * 60 * 60 * 1000;
var thiryDaysMilliseconds = 30 * oneDayMilliseconds;

var forgotPasswordIncrement = 1;

module.exports = {

	init: function(context, callback) {
		var db = context.db;
		var returnCheck = function() {
			if (usersReady && resetReady) {
				callback();
			}
		};
		var usersReady = false, resetReady = false;
		db.createCollection('users', {strict:true}, function(err, userCollection) {
			if (err) {	// err==null means the collection did not already exist
				var usersCollection = db.collection('users');
				usersCollection.ensureIndex( { "email": 1 } );	
			}
			usersReady = true;
			returnCheck();
		});
		db.createCollection('resetPassword', {strict:true}, function(err, resetCollection) {
			if (err) {	// err==null means the collection did not already exist
				var resetCollection = db.collection('resetPassword');
				resetCollection.ensureIndex( { "timestamp": 1 }, { expireAfterSeconds: 86400 } );	//86400=60x60x24
			}
			resetReady = true;
			returnCheck();
		});
	},

	register: function(req, res, next, context) {
		var db = context.db;
		var validateRegFields = context.validateRegFields;
		if (typeof req.body != 'object' || !validateRegFields.isValidEmail(req.body.email)) {
			res.send(400, '(register) request body not correct'); // 400=BadRequest
			return;
		}
		var obj = { subscription: {} };
		obj.subscription.regType = req.body.regType;
		obj.firstName = req.body.firstName.trim();
		obj.lastName = req.body.lastName.trim();
		obj.email = req.body.email.trim();
		obj.password = req.body.password;
		obj.ccNumber = req.body.ccNumber;
		obj.ccExpires = req.body.ccExpires;
		obj.ccCVV = req.body.ccCVV;
		var now = new Date();
		obj.registerTime = now;
		obj.subscription.trialDays = obj.subscription.regType == '30daytrial' ? 30 : 0;
		obj.subscription.discountCode = req.body.discountCode;

		var tomorrow = new Date(now.valueOf() + oneDayMilliseconds);
		var dayAfter = new Date(now.valueOf() + oneDayMilliseconds + oneDayMilliseconds);
		var thirtyDaysLater = new Date(now.valueOf() + thiryDaysMilliseconds);
		var oneYearLater = new Date((parseInt(tomorrow.getUTCFullYear())+1) + '/' + zeroPad(tomorrow.getUTCMonth()+1, 2) + '/' + zeroPad(tomorrow.getUTCDate(), 2));
		if (req.body.discountCode == 'jkffree') {
			obj.subscription.regType = 'normalAnnualSubscription';
			obj.subscription.recurringPeriod = 'YEAR';
			obj.subscription.firstPayment = 0;
			obj.subscription.recurringPayment = 0;
			obj.subscription.firstPaymentDate = now;
			obj.subscription.firstRecurringPaymentDate = oneYearLater;
		} else if (req.body.discountCode == 'jkfdays') {
			obj.subscription.recurringPeriod = 'DAYS';
			if (obj.subscription.regType == '30daytrial') {
				obj.subscription.firstPayment = 0;
				obj.subscription.recurringPayment = 0.01;
				obj.subscription.firstPaymentDate = null;
				obj.subscription.firstRecurringPaymentDate = tomorrow;
			} else {
				obj.subscription.firstPayment = 0.10;
				obj.subscription.recurringPayment = 0.01;
				obj.subscription.firstPaymentDate = tomorrow;
				obj.subscription.firstRecurringPaymentDate = dayAfter;
			}
		} else {
			obj.subscription.recurringPeriod = 'YEAR';
			if (obj.subscription.regType == '30daytrial') {
				obj.subscription.firstPayment = 0;
				obj.subscription.recurringPayment = 9.99;
				obj.subscription.firstPaymentDate = null;
				// Annual recurring billing starts 30 days from today
				obj.subscription.firstRecurringPaymentDate = thirtyDaysLater;
			} else {
				obj.subscription.firstPayment = 9.99;
				obj.subscription.recurringPayment = 9.99;
				obj.subscription.firstPaymentDate = tomorrow;
				obj.subscription.firstRecurringPaymentDate = oneYearLater;
			}
		}

		if (regTypes.indexOf(obj.subscription.regType) >= 0 &&
				validateName(obj.firstName) && validateName(obj.lastName) && 
				validateRegFields.isValidEmail(obj.email) && validateName(obj.password) && 
				validateRegFields.isValidCCN(obj.ccNumber) && 
				validateRegFields.isValidExpiration(obj.ccExpires) && 
				validateRegFields.isValidCVV(obj.ccNumber, obj.ccCVV) ) {
			var collection = db.collection('users');
			collection.find({email:obj.email}).toArray(function(err, docs) {
				if (err) {
					res.send(500, '(find)'+err);	// 500=InternalServerError
				} else if (docs.length>0) {
					res.send(403, 'email "'+obj.email+'" already registered');	// 403=Forbidden
				} else {
					collection.insert(obj, function(err, result) {
						if (err) {
							res.send(500, '(insert)'+err); // 500=InternalServerError
						} else {
							var billingDone = function(err, body) {
								body = body || '';
								//FIXME: Send SMS or email each time someone registers
								if (err) {
									console.error('PayPal failure. err='+err+', body=');
									console.dir(body);
									res.send(403, 'registration failure: credit card error');	// 403=Forbidden
									collection.remove({email: obj.email});
								} else {
									collection.update({email: obj.email}, {$set: {billingResponse: body}}, function(err) {
										if (err) {
											console.error('register collection update err= '+err);
										}
									});
									var name = obj.firstName+' '+obj.lastName;
									var params = {
										html: '<p>Welcome to BrandingPays!</p><p>Your account registration was successful ('+name+' &lt;'+obj.email+'&gt;)</p>',
										text: 'Welcome to BrandingPays!\n\nAccount registration successful ('+name+' <'+obj.email+'>)\n\n',
										subject: 'Registration successful',
										email: obj.email,
										name: name
									};
									sendMail(params, function(err, result) {
										if (err) {
											console.error('sendMail failed! err='+JSON.stringify(err));
										}
										res.send("");
									});
								}
							};
							if (obj.subscription.firstPayment == 0 && obj.subscription.recurringPayment == 0) {
								billingDone(null, null);
							} else {
								billing.subscribe(obj, billingDone);
							}
						}
					});
				}
			});
		} else {
			res.send(400, "register: Request body did not validate");	// 400=BadRequest
		}
	},

	// This assume higher-level routine (routes.js) attached passport.authenticate middleware
	login: function(req, res, next, context) {
		var db = context.db;
		var validateRegFields = context.validateRegFields;
		if (typeof req.body != 'object' || !validateRegFields.isValidEmail(req.body.email)) {
			res.send(400, '(login) request body not correct'); // 400=BadRequest
			return;
		}
		// Tell passport that the login was successful
		//FIXME: is this really needed?
		req.login(req.user, function(err) {
			if (err) {
				res.send(401, 'req.login failure');
			} else {
				res.send('');
			}
		});
	},

	logout: function(req, res, next, context){
		req.logout();
		res.send('');
	},

	forgotPassword: function(req, res, next, context) {
		var db = context.db;
		var validateRegFields = context.validateRegFields;
		if (typeof req.body != 'object' || !validateRegFields.isValidEmail(req.body.email)) {
			res.send(400, '(forgotPassword) request body not correct'); // 400=BadRequest
			return;
		}
		var usersCollection = db.collection('users');
		usersCollection.find({email:req.body.email}).toArray(function (err, docs) {
		 	if (err) {
				res.send(500, '(forgotPassword collection.find)'+err); // 500=InternalServerError
				return;
		 	}
			if (docs.length != 1) {
				res.send(400, 'email "'+req.body.email+'" is not registered'); // 400=BadRequest
				return;
			}
			var user = docs[0];
			var timestamp = new Date();
			var now = timestamp.valueOf();
			var time = zeroPad(now, 13);
			var incr = zeroPad(forgotPasswordIncrement, 3);
			forgotPasswordIncrement++;
			var id = time+incr;
			var resetObj = {
				_id: id,
				email: req.body.email,
				timestamp: timestamp
			};
			var resetCollection = db.collection('resetPassword');
			resetCollection.insert(resetObj, function(err, result) {
				if (err) {
					res.send(500, '(insert)'+err); // 500=InternalServerError
				} else {
					var url = req.protocol + '://' + req.get('host') + context.pathPrefix + 'startup/' + resetObj._id;
					var params = {
						html: '<p>To reset your password, please click on this link:</p><p><a href="'+url+'">'+url+'</a></p>',
						text: 'To reset your password, go to this URL in your web browser:\n\n'+url,
						subject: 'Reset password',
						email: user.email,
						name: user.firstName+' '+user.lastName
					};
					sendMail(params, function(err, result) {
						if (err) {
							console.error('sendMail failed! e='+JSON.stringify(e));
						}
						res.send("");
					});
				}
			});
		});
	},

	resetPassword: function(req, res, next, context) {
		if (typeof req.body != 'object' || !validateName(req.body._id) || !validateName(req.body.password)) {
			res.send(400, '(resetPassword) request body not correct'); // 400=BadRequest
			return;
		}
		var db = context.db;
		var resetCollection = db.collection('resetPassword');
		resetCollection.find({_id:req.body._id}).toArray(function (err, docs) {
		 	if (err) {
				res.send(500, '(resetPassword reset collection.find)'+err); // 500=InternalServerError
				return;
		 	}
			if (docs.length != 1) {
				res.send(400, 'Reset id "'+req.body._id+'" not found. Expired?'); // 400=BadRequest
				return;
			}
			var resetObj = docs[0];
			var email = resetObj.email;
			var usersCollection = db.collection('users');
			usersCollection.update({email:email}, {$set: {password:req.body.password}}, function(err, count) {
			 	if (err) {
					res.send(500, '(resetPassword user collection.update)'+err); // 500=InternalServerError
					return;
			 	}
			 	res.send(email);
			});
		});
	},

	updateAccount: function(req, res, next, context) {
		if (typeof req.body != 'object') {
			res.send(403, '(resetPassword) request body not correct'); // 400=BadRequest
			return;
		}
		if (typeof req.user != 'object' || !req.user.email) {
			res.send(403, ''); // 403=Forbidden
			return;
		}
		var db = context.db;
		var usersCollection = db.collection('users');
		usersCollection.find({email: req.user.email}).toArray(function (err, docs) {
		 	if (err) {
				res.send(500, '(updateAccount collection.find)'+err); // 500=InternalServerError
				return;
		 	}
			if (docs.length != 1) {
				res.send(400, 'updateAccount email "'+req.user.email+'" not found.'); // 400=BadRequest
				return;
			}
			var user = docs[0];
			var anyChanges = false;
			var obj = {};
			var rootFields = ['firstName', 'lastName', 'email', 'password', 'ccNumber', 'ccExpires', 'ccCVV'];
			for (var i in req.body) {
				if (rootFields.indexOf(i)>=0) {
					obj[i] = req.body[i];
				} else {
					console.error('updateAccount: bad field "'+i+'" in req.body');
				}
			}
			var doUpdate = function() {
				usersCollection.update({email: req.user.email}, {$set: obj}, function(err, count) {
				 	if (err) {
						res.send(500, '(updateAccount user collection.update)'+err); // 500=InternalServerError
						return;
				 	}
				 	res.send('');
				});
			};
			if (obj.email) {
				usersCollection.find({email: obj.email}).toArray(function (err, docs) {
				 	if (err) {
						res.send(500, '(updateAccount check dupliate collection.find)'+err); // 500=InternalServerError
						return;
				 	}
					if (docs.length > 0) {
						res.send(400, 'email "'+obj.email+'" already registered'); // 400=BadRequest
						return;
					}
					doUpdate();
					var msg = 'Your registered email address for BrandingPays.com has changed from '+req.user.email+' to '+obj.email+'. If you did not authorize this change, please send email to admin@brandingpays.com.';
					var params = {
						html: '<p>'+msg+'</p>',
						text: msg,
						subject: 'Your BrandingPays email has been changed',
						email: req.user.email,
						name: req.user.firstName+' '+req.user.lastName
					};
					sendMail(params, function(err, result) {
						if (err) {
							console.error('sendMail failed! e='+JSON.stringify(e));
						}
					});
				});
			} else {
				doUpdate();
			}
		});
	},

	cancelSubscription: function(req, res, next, context) {
		if (typeof req.user != 'object' || !req.user.email) {
			res.send(403, ''); // 403=Forbidden
			return;
		}
		var db = context.db;
		var usersCollection = db.collection('users');
		usersCollection.find({email: req.user.email}).toArray(function (err, docs) {
		 	if (err) {
				res.send(500, 'cancelSubscription collection.find error: '+err); // 500=InternalServerError
				return;
		 	}
			if (docs.length != 1) {
				res.send(400, 'cancelSubscription email "'+req.user.email+'" not found'); // 400=BadRequest
				return;
			}
			var user = docs[0];
			var profileid = user.billingResponse && user.billingResponse.profileid;
			if (!profileid) {
				res.send(500, 'cancelSubscription - no profileid'); // 500=InternalServerError
				return;
			}
			var billingPromise = new Promise();
			var removePromise = new Promise();
			var insertPromise = new Promise();
			var cancelPromises = [ billingPromise, removePromise, insertPromise ];
			var error = null;
			var sendEmailToAdmin = function() {
				var params = {
					html: 'Account cancellation. email:'+user.email+', error='+error,
					text: 'Account cancellation. email:'+user.email+', error='+error,
					subject: 'Account cancellation for email:'+user.email,
					email: 'admin@brandingpays.com'
				};
				sendMail(params, function(err, result) {
					if (err) {
						console.error('sendMail failed! e='+JSON.stringify(e));
					}
				});
			};
			AllOrNone(cancelPromises).then(function(results) {
				sendEmailToAdmin();
				res.send('');
			}, function() {
				sendEmailToAdmin();
				res.send(500, error); // 500=InternalServerError
			});
			billing.unsubscribe(profileid, function(err) {
				if (err) {
					error = 'cancelSubscription unsubscribe error: '+err;
					billingPromise.reject();
				} else {
					billingPromise.resolve();
				}
			});
			usersCollection.remove({email: req.user.email}, function(err, result) {
				if (err) {
					error = 'cancelSubscription remove error: '+err;
					removePromise.reject();
				} else {
					removePromise.resolve();
				}
			});
			var cancelledUsersCollection = db.collection('cancelledUsers');
			cancelledUsersCollection.insert(user, function(err, result) {
				if (err) {
					error = 'cancelSubscription insert error: '+err;
					insertPromise.reject();
				} else {
					insertPromise.resolve();
				}
			});
		});
	}
};
