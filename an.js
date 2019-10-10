var fs = require('fs'),
	NodePromise = require('node-promise'),
	Promise = NodePromise.Promise;

var usersToSkip = [
	'a@f.com',
	'aaa@aaa.com',
	'allie@brandingpays.com',
	'allie@readz.com',
	'allieferr@gmail.com',
	'allieferraiolo@hotmail.com',
	'apeller@us.ibm.com',
	'b@b.com',
	'bee@bee.com',
	'bogus1@bogus1.com',
	'brandingpays@gmail.com',
	'carol@thepassionateolive.com',
	'carolanglin@comcast.net',
	'clairechang3@gmail.com',
	'd@d.com',
	'etaverner@yahoo.com',
	'example@example.com',
	'example1@example.com',
	'example100@example.com',
	'example200@example.com',
	'frog@frog.com',
	'genentech@example.com',
	'joby@qburst.com',
	'jon@brandingpays.com',
	'jon@ferraiolo.com',
	'jonferraiolo@gmail.com',
	'karen@kang.com',
	'karen.kang@brandingpays.com',
	'karen.kang@me.com',
	'leaf@leaf.com',
	'login@login.com',
	'meta@crawfordgroup.com',
	'meta@metamehling.com',
	'metamehlingassoc@gmail.com',
	'pinky@brandingpays.com',
	'q@q.com',
	'r@s.com',
	'reshiva@yahoo.com',
	'star@star.com',
	'steven.kang@brandingpays.com',
	'sun@sun.com',
	'test@abc.com',
	'test@brandingpays.com',
	'test@atest.com',
	'test@test.com',
	'tester@bp.com',
	'test10@test.com',
	'test123@test.com',
	'test@test.com',
	'test2@test.com',
	'test200@test.com',
	'test3@test.com',
	'test4@test.com',
	'test5@test.com',
	'testengineer80@gmail.com',
	'testTM@test.com',
	'testTM2@test.com',
	'testTM3@test.com',
	'testuser1@haas.com',
	'tree@tree.com',
	'userhaas@bp.com',
	'x@y.com',
	'z@z.com'
];
var defaultUsersusersFolderPath = '/Applications/XAMPP/xamppfiles/users',
	usersFolderPath = defaultUsersusersFolderPath,
	defaultUsersFileName = 'users.txt',
	usersFileName = defaultUsersFileName,
	logBadUsers = false,
	users = [];

var printCommandLineOptions = function() {
	console.log();
	console.log('--help');
	console.log('--usersfolder=<path-to-users-folder> (default: '+defaultUsersusersFolderPath+')');
	console.log('--usersfilename=<users-index-file> (default: '+defaultUsersFileName+')');
	console.log('--logbadusers (default: do not list bad user accounts');
};

// Get command line parameters
process.argv.forEach(function (val, index, array) {
	if (val.substr(0,2) == '--') {
		var tokens = val.split('=');
		if (tokens[0] == '--help') {
			printCommandLineOptions();
			process.exit(1);
		} else if (tokens[0] == '--usersfolder') {
			usersFolderPath = tokens[1];
		} else if (tokens[0] == '--usersfilename') {
			usersFileName = tokens[1];
		} else if (tokens[0] == '--logbadusers') {
			logBadUsers = true;
		} else {
			printCommandLineOptions();
			process.exit(1);
		}
	}
});

var usersTxtFilePath = usersFolderPath + '/' + usersFileName;

var isEmptyObject = function(obj) {
	for(var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}
	return true;
};

// Prevent running out of file descriptors
var maxFileOps = 100;
var activeFileOps = 0;
var readDirPending = [];
var readFilePending = [];
var readDirWrapper = function(pathToFolder, callback) {
	if (activeFileOps >= maxFileOps) {
		readDirPending.push({ pathToFolder:pathToFolder, callback:callback });
	} else {
		var doReadDir = function(pathToFolder, callback) {
			activeFileOps++;
			fs.readdir(pathToFolder, function(err, data) {
				callback(err, data);
				activeFileOps--;
				if (readDirPending.length > 0) {
					var pending = readDirPending.shift();
					doReadDir(pending.pathToFolder, pending.callback);
				}
			});
		};
		doReadDir(pathToFolder, callback);
	}
};
var readFileWrapper = function(pathToFile, callback) {
	if (activeFileOps >= maxFileOps) {
		readFilePending.push({ pathToFile:pathToFile, callback:callback });
	} else {
		var doReadFile = function(pathToFile, callback) {
			activeFileOps++;
			fs.readFile(pathToFile, function(err, data) {
				callback(err, data);
				activeFileOps--;
				if (readFilePending.length > 0) {
					var pending = readFilePending.shift();
					doReadFile(pending.pathToFile, pending.callback);
				}
			});
		};
		doReadFile(pathToFile, callback);
	}
};


/**
 * Read the user's latest data file
 * @param {string} userFolderPath  Path to user's data folder
 * @param {function} callback 
 *      {null|undefined|string} Error string if any errors found
 *      {string} Contents of latest data file
 */
var readLatestData = function(userFolderPath, callback) {
	var latestPath = userFolderPath + '/latest';
	readFileWrapper(latestPath, function(err, latestContents) {
		if (err) {
			callback('Cannot read latestPath='+latestPath+', err='+err);
		} else {
			var dataPath = userFolderPath + '/' + latestContents.toString().trim();
			readFileWrapper(dataPath, function(err, dataContents) {
				if (err) {
					callback('Cannot read dataPath='+dataPath);
				} else {
					callback(null, dataContents.toString());
				}
			});
		}
	});
};

/**
 * Verify that the given user has a proper folder
 */
var getUserData = function(email, callback) {
	var userFolderPath = usersFolderPath + '/' + email;
	readDirWrapper(userFolderPath, function(err, files) {
		if (err) {
			callback('Cannot read folder for email: '+email);
		} else {
			if (files.indexOf('latest') < 0) {
				callback('No latest file for email: '+email);
			} else {
				readLatestData(userFolderPath, function(err, dataContents) {
					callback(err, dataContents);
				});
			}
		}
	});
};

/**
 * Find all users.
 * 
 * @param {function} callback  Callback function, with params: 
 *      {string|null|undefined} error (null means no error)
 *      {array[string]} users Array of user names (email addresses)
 */
var findUsers = function(callback) {
	readFileWrapper(usersTxtFilePath, function(err, usersTxtContents) {
		if (err) {
			callback(err);
		}
		// replace CRLF and CR with LF
		var usersTxt = usersTxtContents.toString().replace(/(?:\r\n|\r)/g, '\n');
		var userLines = usersTxt.split('\n');
		var userCount = 0;
		userLines.forEach(function(userLine) {
			var tokens = userLine.split(':');
			var email = tokens[0];
			if (email.indexOf('@') >= 0 && usersToSkip.indexOf(email) < 0) {
				// Verify that this user has a proper folder
				getUserData(email, function(err, userData) {
					if (err) {
						if (logBadUsers) {
							console.log(err);
						}
					} else {
						users.push({email:email, data:userData});
					}
					userCount++;
					if (userCount >= userLines.length) {
						callback(null, users);
					}
				});
			} else {
				userCount++;
			}
		});
	});
};

findUsers(function(err, users) {
	if (err) {
		console.error(err);
	} else {
		var fields = {};
		var emails = {};
		users.forEach(function(user) {
			var dataNormalized = user.data.replace(/(?:\r\n|\r)/g, '\n');
			var lines = dataNormalized.split('\n');
			var U;

			for(var i=0;i<lines.length;i++){
				var line=lines[i];
				if(line.indexOf('{')>=0 && line.indexOf('}')>=0){
					var obj = null;
					var unescaped_line = unescape(line);
					try {
						obj = JSON.parse(unescaped_line);
					} catch (e) {
						console.log('JSON.parse failed for email: '+user.email+', line:'+line);
					}
					data_version = obj._version;
					if(!obj._version){
						console.log("Error: no version number from server data.");
					}

					// If the current line is a full update, then reset U from the data in this line
					if(obj._updateType==="full"){
						U = obj;
						
					// Else if the current line is a single-field incremental update,
					// then just update that one field in U
					}else if(obj._updateType==="incremental"){
				
						if(obj.field){
							// Ensure that obj.field actually exists.
							// Necessary to make sure U.UI.NavTab doesn't
							// reference through null object
							var tokens=obj.field.split('.');
							var grandParentObj=null;
							var parentObj={U:U};
							for(var j=0;j<tokens.length;j++){
								var propname=tokens[j];
								if(!parentObj[propname]){
									parentObj[propname]={};
								}
								grandParentObj=parentObj;
								parentObj=parentObj[propname];
							}
					
							if(typeof obj.value !== "undefined" && obj.value !== null){
								grandParentObj[propname]=obj.value;
							}
						}else{
							console.log("Error: missing field property for user: '+user.email+' on line:"+line);
						}																
					}else{
						console.log("Error: incorrect value for obj._updateType:"+obj._updateType+' for user: '+user.email+' on line:'+line);
					}
				}else{
					console.log("Error: no curly braces for user: '+user.email+' on line:"+line);
				}
			} //for loop ends here

			var recurseU = function(obj, baseString) {
				if ((typeof obj == 'object' && isEmptyObject(obj)) || (typeof obj == 'string' && obj.length == 0)) {
					return;
				} else if (typeof obj == 'string') {
					emails[user.email] = true;
					if (!fields[baseString]) {
						fields[baseString] = { count:0, totalChars:0 };
					}
					fields[baseString].count++;
					fields[baseString].totalChars += obj.length;
				} else if (typeof obj == 'object') {
					for(var prop in obj) {
						if (prop[0] != '_') {
							recurseU(obj[prop], baseString+'.'+prop);
						}
					}
				}
			};
			recurseU(U, 'U');
		});
		console.log('total #users='+users.length);
		var usersWithDataCount = 0;
		for (var i in emails) {
			usersWithDataCount++;
		}
		console.log('total #users with data='+usersWithDataCount);

/*
		console.log('users without data:');
		users.forEach(function(user) {
			if (!emails[user.email]) {
				console.log(user.email);
			}
		});
*/
		console.dir(fields);

	}
});
