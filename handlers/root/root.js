/**
 * Request handler for "/" - deliver the main HTML page for the tools,
 * with the "user" object (and user data) included.
 */

var readV1Data = require('./readV1Data'),
	updateInviteeStatus = require('../assessment/updateInviteeStatus'),
	ObjectId = require('mongodb').ObjectId,
	nodePromise = require('node-promise'),
 	Promise = nodePromise.Promise,
	AllOrNone = nodePromise.allOrNone;

module.exports = {
	get: function(req, res, next, context) {
try{
		if (req.user) {
			var sendResponse = function() {
				var contents = pageContents
					.replace(/\{\{socketIOFullPath\}\}/g, context.socketIOFullPath)
					.replace(/\{\{rootPath\}\}/g, context.pathPrefix)
					.replace(/\{\{userObj\}\}/g, JSON.stringify(userObj))
					.replace(/\{\{systemObj\}\}/g, JSON.stringify(systemObj));
				res.send(contents);
			};
			var fs = require('fs');
			var fname = req.query.debug=='unbuilt' ? 'unbuilt' : (req.query.debug=='uncompressed' ? 'uncompressed' : 'built');
			var host = req.get('host');
			var pageContents = fs.readFileSync(__dirname + '/root_' + fname + '.html').toString();
			var userObj = {
				_id: req.user._id.toString(),
				regType: req.user.regType,
				registerDateTime: req.user.registerDateTime,
				firstName: req.user.firstName,
				lastName: req.user.lastName,
				email: req.user.email,
				ccNumber: req.user.ccNumber.replace(/^.*(\d\d\d\d)$/, '*************$1'),
				subscription: req.user.subscription,
				data: req.user.data || null
			};
			var systemObj = {
				socketIOFullPath: context.socketIOFullPath,
				socketIODomain: context.socketIODomain,
				socketIOPath: context.socketIOPath
			};
			if (!userObj.data) {
				readV1Data(req.user.email, context, function(err, data) {
					if (!err && data) {
						userObj.data = data;
						var db = context.db;
						var usersCollection = db.collection('users');
						usersCollection.find({email:req.user.email}).toArray(function (err, docs) {
						 	if (err) {
								res.send(500, 'root get collection.find error: '+err);	// 500=InternalServerError
								return;
						 	}
							if (docs.length != 1) {
								res.send(400, 'root get email "'+req.user.email+'" is not registered'); // 400=BadRequest
								return;
							}
							usersCollection.update({email:req.user.email}, {$set: {data:data}}, function(err, count) {
							 	if (err) {
									res.send(500, 'root get collection.update error: '+err); // 500=InternalServerError
									return;
							 	}
							 	sendResponse();
							});
						});
					} else {
						sendResponse();
					}
				});
			} else {
				// Update all assessments to reflect what invitees have provided feedback so far
				// FIXME: any way to optimize this? Perhaps each feedback POST should set a flag
				// on the corresponding Assessment or corresponding user object?
				var workbooks = userObj.data.workbooks || [];
				var workbookPromises = [];
				for (var i in workbooks) {
					workbookPromises.push(new Promise());
				}
				var anyChanges = false;
				var iIndex = 0;
				for (var i in workbooks) {
					var workbook = workbooks[i];
					var Assessments = (workbook.sheets && workbook.sheets.Assessment) || {};
					var assessmentPromises = [];
					for (var j in Assessments) {
						assessmentPromises.push(new Promise());
					}
					var jIndex = 0;
					for (var j in Assessments) {
						var Assessment = Assessments[j];
						var _id = new ObjectId(req.user._id);
						updateInviteeStatus(context, Assessment, function(jIndex, Assessment, assessmentPromises, err, changed) {
try{
							if (err) {
								assessmentPromises[jIndex].reject();
							} else {
								if (changed) {
									anyChanges = true;
								}
								assessmentPromises[jIndex].resolve();
							}
} catch(e) {
	console.error('root.js within updateInviteeStatus. e='+e);
}
						}.bind(this, jIndex, Assessment, assessmentPromises));
						jIndex++;
					}
					AllOrNone(assessmentPromises).then(function(iIndex, Assessments, assessmentPromises, resultArray) {
try{
						workbookPromises[iIndex].resolve();
} catch(e) {
	console.error('root.js within AllOrNone(assessmentPromises).then. e='+e);
}
					}.bind(this, iIndex, Assessments, assessmentPromises), function(i) {
try{
						workbookPromises[iIndex].reject();
} catch(e) {
	console.error('root.js within AllOrNone(assessmentPromises).error. e='+e);
}
					}.bind(this, iIndex));
					iIndex++;
				}
				AllOrNone(workbookPromises).then(function() {
try{
					if (anyChanges) {
						var usersCollection = context.db.collection('users');
						var _id = new ObjectId(req.user._id);
						usersCollection.update({ _id: _id }, {$set: {data:userObj.data}}, function(err, count) {
						 	if (err) {
								res.send(500, 'root get assessment collection.update error: '+err); // 500=InternalServerError
								return;
						 	}
							sendResponse();
						});
					} else {
						sendResponse();
					}
} catch(e) {
	console.error('root.js get / AllOrNone workbookPromises. e='+e);
}
				}, function() {
console.error('root get update invitee status error');
					res.send(500, 'root get update invitee status error'); // 500=InternalServerError
					return;
				});
			}
		} else {
			var urlParams = '';
			for (var i in req.query) {
				urlParams += (urlParams.length == 0) ? '?' : '&';
				urlParams += encodeURIComponent(i);
				if (req.query[i]) {
					urlParams += '=' + encodeURIComponent(req.query[i]);
				}
			}
			res.redirect(context.pathPrefix+'startup'+urlParams);
		}
} catch(e) {
	console.error('root.js get / e='+e);
}
	}
};
