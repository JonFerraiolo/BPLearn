var logRequest = function(req, res, next) {
try{
	console.log((new Date()).toJSON(), 'logRequest enter. ', req.method, req.url);
	next(); 
	console.log((new Date()).toJSON(), 'logRequest exit. ', req.method, req.url);
} catch(e) {
	console.error((new Date()).toJSON(), 'routes.js logRequest. e='+e);
}
};

module.exports = function(app, context) {
try{
	// Tell express to use the router middleware
	// Tutorial: https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
	// Express4 allows multiple routers, each with a base URL
	var express = require('express'),
		routerRoot = express.Router(),	// Routes that begin with /
		routerXhr = express.Router();	// Routes that begin with /xhr/
	var passport = context.passport;
	app.use('/', routerRoot);
	app.use('/xhr', routerXhr);

	// router middleware that will happen on every request
	routerRoot.use(logRequest);	// Because /, gets called for both /* and /xhr/*
	routerXhr.use(logRequest);	// Only gets called for /xhr/*

	// Define the (relative) routes for routerRoot
	// Handlers are all in ./handlers/*
	var root = require('./handlers/root/root');
	routerRoot.get('/', function(req, res, next) {
try{
		root.get(req, res, next, context);
} catch(e) {
	console.error('routes.js. get / e='+e);
}
	});
	var registerLoginPage = require('./handlers/registerLogin/registerLoginPage');
	routerRoot.get(/^\/startup(\/\d+\/?)?$/, function(req, res, next) {
try{
		registerLoginPage(req, res, next, context);
} catch(e) {
	console.error('routes.js. /startup e='+e);
}
	});

	var registerLoginXhr = require('./handlers/registerLogin/registerLoginXhr');
	routerXhr.post('/register', function(req, res, next) {
try{
		registerLoginXhr.register(req, res, next, context);
} catch(e) {
	console.error('routes.js. /register e='+e);
}
	});

	routerXhr.post('/login', 
		// Special case logic: need to invoke passport.authenticate as middleware for /login
		// See: http://passportjs.org/guide/authenticate/
		passport.authenticate('local'), function(req, res, next) {
try{
			registerLoginXhr.login(req, res, next, context);
} catch(e) {
	console.error('routes.js. /registerLoginXhr.login e='+e);
}
		}
	);
	routerXhr.post('/logout', function(req, res, next) {
try{
		registerLoginXhr.logout(req, res, next, context);
} catch(e) {
	console.error('routes.js. /logout e='+e);
}
	});
	routerXhr.post('/forgotPassword', function(req, res, next) {
try{
		registerLoginXhr.forgotPassword(req, res, next, context);
} catch(e) {
	console.error('routes.js. /forgotPassword e='+e);
}
	});
	routerXhr.post('/resetPassword', function(req, res, next) {
try{
		registerLoginXhr.resetPassword(req, res, next, context);
} catch(e) {
	console.error('routes.js. /resetPassword e='+e);
}
	});
	routerXhr.post('/updateAccount', function(req, res, next) {
try{
		registerLoginXhr.updateAccount(req, res, next, context);
} catch(e) {
	console.error('routes.js. /updateAccount e='+e);
}
	});
	routerXhr.post('/cancelSubscription', function(req, res, next) {
try{
		registerLoginXhr.cancelSubscription(req, res, next, context);
} catch(e) {
	console.error('routes.js. /cancelSubscription e='+e);
}
	});
	var data = require('./handlers/data/data');
	routerXhr.post('/data', function(req, res, next) {
try{
		data.post(req, res, next, context);
} catch(e) {
	console.error('routes.js. /data e='+e);
}
	});
	routerXhr.post('/userDataLastModified', function(req, res, next) {
try{
		data.userDataLastModified(req, res, next, context);
} catch(e) {
	console.error('routes.js. /userDataLastModified e='+e);
}
	});

	// Define routes for assessment feedback
	var assessmentPage = require('./handlers/assessment/assessmentPage');
	routerRoot.get(/^\/assessment\/.*/, function(req, res, next) {
try{
		assessmentPage(req, res, next, context);
} catch(e) {
	console.error('routes.js. get /assessment e='+e);
}
	});
	var assessmentXhr = require('./handlers/assessment/assessmentXhr');
	routerXhr.post(/^\/assessmentFeedback\/.*/, function(req, res, next) {
try{
		assessmentXhr.inviteeFeedback(req, res, next, context);
} catch(e) {
	console.error('routes.js. post /assessmentFeedback e='+e);
}
	});
	routerXhr.post(/^\/consolidateFeedback$/, function(req, res, next) {
try{
		assessmentXhr.consolidateFeedback(req, res, next, context);
} catch(e) {
	console.error('routes.js. post /consolidateFeedback e='+e);
}
	});
} catch(e) {
	console.error('routes.js e='+e);
}

	var helpPage = require('./handlers/about/about');
	routerRoot.get(/^\/about\/?$/, function(req, res, next) {
try{
		helpPage(req, res, next, context);
} catch(e) {
	console.error('routes.js. /about e='+e);
}
	});

};
