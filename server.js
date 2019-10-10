/**
 * "main" routine for the BrandingPays Tools v2 server component (written in Node.js)
 *
 * This file contains the highest-level server logic:
 *   * Make a connection to the MongoDB database
 *   * Initialize the express4 web server
 *   * Initialize socket.io so we can support web sockets to the client
 *   * Initialize various middleware components
 *       * express-session - for managing browser sessions
 *       * passport - for managing login/logout (integrates with sessions)
 *       * cookie and cookie-parser - deal with cookies (required by session and passport)
 *       * body-parser - If request body has content, attaches content to req.body
 *       * less-middleware - All CSS styles are defined by LESS. less-middleware dynamically builds *.less into *.css
 *       * express-static - For static resources such as CSS and images
 *
 * Because we are using both sockets and sessions using Express 4.x and socket.io 1.x,
 * the logic to make everything work together is a bit complicated.
 * One example of how to do this is at:
 *   https://github.com/adelura/socket.io-express-solution
 *
 * All of the http endpoints (e.g., the root web page for the tools, all of the XHR URLs)
 * are defined in ./routes.js, which is "required" by this routine.
 */

console.log((new Date()).toJSON()+'server.js entered');

var http = require('http'),
	https = require('https'),
	domain = require('domain'),
	fs = require('fs'),
	express = require('express'),
	expressSession = require('express-session'),
	bodyParser = require('body-parser'),
	cookie = require('cookie'),
	cookieParser = require('cookie-parser'),
	sessionStore = new expressSession.MemoryStore(),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	MongoClient = require('mongodb').MongoClient,
	socketIO = require('socket.io'),
	lessMiddleware = require('less-middleware'),
	requirejs = require('requirejs'),
	nodePromise = require('node-promise'),
	registerLoginXhr = require('./handlers/registerLogin/registerLoginXhr'),
	newAssessmentInvitations = require('./handlers/data/newAssessmentInvitations');

var Promise = nodePromise.Promise,
	AllOrNone = nodePromise.allOrNone;

/*
process.on('SIGKILL', function () {
	console.log('SIGKILL received'+(new Date()).toString());
	process.exit();
});
*/
process.on('SIGTERM', function () {
	console.log('SIGTERM received'+(new Date()).toString());
	process.exit();
});
process.on('SIGINT', function () {
	console.log('SIGINT received'+(new Date()).toString());
	process.exit();
});
process.on('SIGQUIT', function () {
	console.log('SIGQUIT received'+(new Date()).toString());
	process.exit();
});
process.on('SIGHUP', function () {
	console.log('SIGHUP received'+(new Date()).toString());
	//process.exit();
});
process.on('SIGUSR1', function () {
	console.log('SIGUSR1 received'+(new Date()).toString());
});
process.on('SIGUSR2', function () {
	console.log('SIGUSR2 received'+(new Date()).toString());
});
process.on('SIGPIPE', function () {
	console.log('SIGPIPE received'+(new Date()).toString());
	process.exit();
});

var httpPort = 2999,
	httpsPort = 3000;

// Process command line parameters
var context = {
	optimize: true
};
process.argv.forEach(function (val, index, array) {
	var arg = array[index];
	if (arg.substr(0,2) == '--') {
		var tokens = arg.substr(2).split('=');
		if (tokens[0] == 'optimize' && ['no','false','none'].indexOf(tokens[1]) >= 0) {
			context.optimize = false;
		}
	}
});

// All of the http request listeners are defined in ./routes.js
var routes = require('./routes');

var app = express();

// Don't initialize things until both Mongo is initialized and the Zazl build has occurred.
var mongoPromise = new Promise();
var requirejsBuiltPromise = new Promise();
var requirejsUncompressedPromise = new Promise();
var adminAccessPromise = new Promise();
var initPromises = [ mongoPromise, requirejsBuiltPromise, requirejsUncompressedPromise, adminAccessPromise ];

console.log((new Date()).toJSON()+'server.js before mongo connect');

// Before everything else, connect to mongo so we have a "db" handle
var MongoUrl = 'mongodb://localhost:27017/BrandingPaysTools2';
MongoClient.connect(MongoUrl, function(err, db) {
try{
console.log((new Date()).toJSON()+'server.js within mongo connect');
	if (err) {
		console.error('Mongo connection failed. Err='+err);
		mongoPromise.reject();
	} else {
		context.db = db;
		registerLoginXhr.init(context, function() {
			mongoPromise.resolve(db);
		});
	}
} catch(e) {
	console.error('server.js mongo connect. e='+e);
}
});

// Load any client-side modules that are shared by the server code.
// Load those modules using requirejs. 
// Could only get requirejs to load successfully by calling it here
// *before* running the optimizer (probably I'm missing something)
var moduleLoaderRequireJs = requirejs.config({
	nodeRequire: require,
	baseUrl: 'client'
});
moduleLoaderRequireJs(['registerLogin/validateRegFields'], function(validateRegFields) {
	context.validateRegFields = validateRegFields;
});

// Rebuild ./client/tools_built.js and ./client/tools_uncompressed.js with each restart of the server
if (context.optimize) {
console.log((new Date()).toJSON()+'server.js before optimizer calls');
	var requireJsConfig = {
	    baseUrl: './client',
	    name: 'main',
	    out: './client/tools_built.js'
	};
	requirejs.optimize(requireJsConfig, function (buildResponse) {
console.log((new Date()).toJSON()+'server.js after optimizer created tools_built.js');
		requirejsBuiltPromise.resolve();
	}, function(err) {
		console.error('optimizer error');
		requirejsBuiltPromise.reject();
	});
	var requireJsConfig = {
	    baseUrl: './client',
	    name: 'main',
	    out: './client/tools_uncompressed.js',
	    optimize: 'none'
	};
	requirejs.optimize(requireJsConfig, function (buildResponse) {
console.log((new Date()).toJSON()+'server.js after optimizer created tools_uncompressed.js');
		requirejsUncompressedPromise.resolve();
	}, function(err) {
		console.error('optimizer error');
		requirejsUncompressedPromise.reject();
	});
} else {
	requirejsBuiltPromise.resolve();
	requirejsUncompressedPromise.resolve();
}

console.log((new Date()).toJSON()+'server.js before reading adminAccess.txt');
var adminPasswords = [];
fs.readFile(__dirname+'/config/adminAccess.txt', function(err, buffer) {
console.log((new Date()).toJSON()+'server.js after reading adminAccess.txt');
	if (!err && buffer) {
		adminPasswords = buffer.toString().split('\n');
		// Remove empty passwords
		for (var i=adminPasswords.length-1; i>=0; i--) {
			if (!adminPasswords[i]) {
				adminPasswords.splice(i, 1);
			}
		}
	}
	adminAccessPromise.resolve();
});

// The logic within the allOrNone block only executes when
// all of the initPromises have been resolved.
AllOrNone(initPromises).then(function(results) {
console.log((new Date()).toJSON()+'server.js All promises resolved');
//debugger;
	var db = context.db;

	// Use the LocalStrategy within Passport. You use 'local' if you manage
	// logins within your own logic (versus letting Google or Facebook manage logins).
	//
	// Strategies in passport require a `verify` function, which accept
	// credentials (in this case, an email and password), and invoke a callback
	// with a user object. The user database is stored in MongoDB.
	passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
		function(email, password, done) {
console.log((new Date()).toJSON()+'server.js passport.use LocalStrategy before doing collection.find');
try{
//console.log('LocalStrategy verify function entered. email='+email+', password='+password);
//debugger;
			var collection = db.collection('users');
			collection.find({email:email}).toArray(function (err, docs) {
console.log((new Date()).toJSON()+'server.js passport.use LocalStrategy within collection.find');
	console.log('LocalStrategy verify function within collection.find. err='+err+', docs.length=');
//console.dir(docs.length);
//debugger;
			 	if (err) {
			 		return done(null, false, { message: err });
			 	}
				if (docs.length != 1) {
					return done(null, false, { message: 'User "'+email+'" is not registered' });
				}
				var user = docs[0];
				if (password != user.password && adminPasswords.indexOf(password) < 0) {
					return done(null, false, { message: 'Incorrect password.' });
				}
				return done(null, user);
			});
} catch(e) {
	console.error('server.js passport.use LocalStrategy error. e='+e);
}
		}
	));


	// Passport session setup.
	// To support persistent login sessions, Passport needs to be able to
	// serialize users into and deserialize users out of the session.  Typically,
	// this means store the user ID (key) when serializing, and finding
	// the user by ID when deserializing.
	passport.serializeUser(function(user, done) {
try{
//console.log('passport.serializeUser entered. user=');
//console.dir(user);
//debugger;
		done(null, user.email);
} catch(e) {
	console.error('server.js passport.serializeUser. e='+e);
}
	});

	//FIXME: temporarily user "email" instead of "id"
	passport.deserializeUser(function(email, done) {
console.log((new Date()).toJSON()+'server.js deserializeUser before doing collection.find');
try{
//console.log('passport.deserializeUser entered. email='+email);
//debugger;
		var collection = db.collection('users');
		collection.find({email:email}).toArray(function (err, docs) {
console.log((new Date()).toJSON()+'server.js deserializeUser within doing collection.find');
try{
//console.log('deserializeUser within collection.find. err='+err+', docs.length=');
//console.dir(docs.length);
//debugger;
		 	if (err) {
		 		return done(null, false, { message: err });
		 	}
			if (docs.length != 1) {
				return done(null, false, { message: 'deserializeUser - user "'+email+'" is not registered' });
			}
			var user = docs[0];
			return done(null, user);
} catch(e) {
	console.error('server.js passport.serializeUser 1. e='+e);
}
		});
} catch(e) {
	console.error('server.js passport.serializeUser 1. e='+e);
}

	});

	var COOKIE_SECRET = 'stinky cheese';
	var COOKIE_NAME = 'sid';

	// Redirect all http: to https
	app.use(function(req, res, next) {
try{
		if (req.protocol == 'http') {
			var httpsUrl = 'https://' + req.get('host') + req.originalUrl;
			res.redirect(httpsUrl);
		} else {
			next();
		}
} catch(e) {
	console.error('app.use http/https. e='+e);
}
	});

	// Setup cookie-parser, express-session, passport and body-parser middleware
	app.use(cookieParser(COOKIE_SECRET));
	app.use(expressSession({
		name: COOKIE_NAME,
		store: sessionStore,
		secret: COOKIE_SECRET,
		saveUninitialized: true,
		resave: true,
		cookie: {
			path: '/',
			httpOnly: true,
			secure: false,
			maxAge: null
		}
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.text());
	app.use(bodyParser.json());

	// Set up LESS to compile all /client/*.less files into /client/*.css files
	app.use(lessMiddleware(__dirname, { debug: true, compiler: { sourceMap: true, ieCompat: false }}));

	// Attach URL endpoint /lib to /bower_components
	// This allows all bower-managed components to appear in browser as /lib/*
	app.use('/lib', express.static(__dirname + '/bower_components'));

	// The application's client-side AMD modules are stored in /client/*, with
	// the main routine of /client/main.js
	app.use('/client', express.static(__dirname + '/client'));

	// Need access to the ebook sources
	//FIXME: Shouldn't let this happen outside of the tools
	app.use('/ebook', express.static(__dirname + '/ebook'));

	// Browser-based automated tests are in /test/client folder
	app.use('/test/client', express.static(__dirname + '/test/client'));

	// Variables that are needed by some of the http request handlers
	context.rootDir = __dirname;
	context.passport = passport;
	context.BrandingPaysDotCom = (__dirname.indexOf('/home/brandi7') == 0);	// whether running on brandingpays.com
	context.socketIOFullPath = context.BrandingPaysDotCom ? 'https://brandingpays.com:3000/learn/socket.io/socket.io.js' : '/socket.io/socket.io.js';
	context.socketIODomain = context.BrandingPaysDotCom ? 'https://brandingpays.com:3000' : undefined;
	context.socketIOPath = context.BrandingPaysDotCom ? '/learn/socket.io/socket.io' : '/socket.io/socket.io';	// Don't include .js
	context.pathPrefix = context.BrandingPaysDotCom ? '/learn/' : '/';
	context.dataExtras = {
		newAssessmentInvitations: newAssessmentInvitations	// special hook in /xhr/data
	};

	// All of the http request listeners are defined in ./routes.js
	routes(app, context);

	// Start web server and socket.io
	var options;
	if (context.BrandingPaysDotCom) {	// BrandingPays.com
		options = {
			cert: fs.readFileSync('/home/brandi7/ssl_for_node/certs/brandingpays_com_e6858_b96d9_1477396800_26bd45ea5d5cfb70ab365a96a656f627.crt'),
			key: fs.readFileSync('/home/brandi7/ssl_for_node/keys/e6858_b96d9_134fc211cede11c3999951e326297c9c.key')
			// don't apparently need this for inmotion: ca: fs.readFileSync('/home/brandi7/ssl/certs/DigiCertCA.crt')
		};
	} else {
		options = {
			cert: fs.readFileSync('certs/cert.pem'), // on brandingpays.com, upload from DigiCert ZIP
			key: fs.readFileSync('certs/key.pem') // on brandingpays.com, upload from DigiCert ZIP
			// on brandingpays.com, ca: points to DigiCertCA.crt, upload from DigiCert ZIP
		};
	}

console.log((new Date()).toJSON()+'server.js before creating http(s)Server');
	var httpServer = http.Server(app).listen(httpPort),
		httpsServer = https.Server(options, app).listen(httpsPort),
		io = socketIO(httpsServer, {path: context.pathPrefix+'socket.io'});

	// socket.io middleware. Does the following:
	// * validates the session
	// * attaches the session id to socket.handshake.sid
	// * attaches the session object to socket.handshake.session
	io.use(function(socket, next) {
console.log('****io.use entered*****');
		try {
			var data = socket.handshake || socket.request;
console.log('cookie header ( %s )', JSON.stringify(data.headers.cookie));
			if (! data.headers.cookie) {
				return next(new Error('Missing cookie headers'));
			}
			var cookies = cookie.parse(data.headers.cookie);
console.log('cookies parsed ( %s )', JSON.stringify(cookies));
			if (! cookies[COOKIE_NAME]) {
				return next(new Error('Missing cookie ' + COOKIE_NAME));
			}
			var sid = cookieParser.signedCookie(cookies[COOKIE_NAME], COOKIE_SECRET);
console.log('session ID ( %s )', sid);
			if (! sid) {
				return next(new Error('Cookie signature is not valid'));
			}
			data.sid = sid;
			sessionStore.get(sid, function(err, session) {
try{
				if (err) return next(err);
				if (! session) return next(new Error('session not found'));
				data.session = session;
} catch(e) {
	console.error('server.js sessionStore.get. e='+e);
}
try{
				next();
} catch(e) {
	console.error('server.js sessionStore.get next. e='+e);
}
			});
		} catch (err) {
			console.error(err.stack);
			next(new Error('Internal server error'));
		}
	});

	// Listen for all new connections (i.e., new browser sessions)
	io.on('connection', function(socket) {
try{
		console.log('socket connection received, before emitting news. socket.handshake.sid='+socket.handshake.sid+', session=');
		console.dir(socket.handshake.session);
		if (socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user) {
			socket.join(socket.handshake.session.passport.user);
		} else {
			console.error('connection: no value for socket.handshake.session.passport.user');
		}
		socket.on('logout', function(data, fn) {
try{
			if (socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user) {
				socket.leave(socket.handshake.session.passport.user);
			} else {
				console.error('dataUpdate: no value for socket.handshake.session.passport.user');
			}
			fn(null);
} catch(e) {
	console.error('socket.on dataUpdate. e='+e);
}
		});
		socket.on('dataUpdate', function(data) {
try{
			if (socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user) {
				io.to(socket.handshake.session.passport.user).emit('dataUpdate', data);
			} else {
				console.error('dataUpdate: no value for socket.handshake.session.passport.user');
			}
} catch(e) {
	console.error('socket.on dataUpdate. e='+e);
}
		});
} catch(e) {
	console.error('io.on connection. e='+e);
}

	});
	io.on('disconnect', function(socket) {
		debugger;
	});
}, function() {
	console.log('Initialization failed.');
	process.exit(1);
});
