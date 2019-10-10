/**
 * Logic to transmit web page for assessment feedback.
 */

var ObjectId = require('mongodb').ObjectId,
	nodePromise = require('node-promise'),
	Promise = nodePromise.Promise,
	AllOrNone = nodePromise.allOrNone;

module.exports = function(req, res, next, context) {
	var db = context.db;
	var fs = require('fs');
	var tokens = req.path.split('/');
	var id = tokens[2];
	if (!id) {
		res.send(400, 'assessmentFeedback - missing id token in url');
		return;
	}
	var _id = new ObjectId(id);
	var pageContentsPromise = new Promise();
	var dbQueryPromise = new Promise();
	var promises = [ pageContentsPromise, dbQueryPromise ];
	var error, contents, pageContents;
	fs.readFile(__dirname + '/assessment.html', function(err, buffer) {
		pageContents = buffer.toString();
		pageContentsPromise.resolve();
	});
	db.createCollection('assessmentInvitations', {strict:true}, function(err, assessmentInvitationsCollection) {
		if (err) {	// err==null means the collection did not already exist
			assessmentInvitationsCollection = db.collection('assessmentInvitations');
		}
		assessmentInvitationsCollection.find({_id:_id}).toArray(function(err, docs) {
			if (err) {
				error = '(assessmentFeedback)'+err;
				dbQueryPromise.reject();
			} else if (docs.length==0) {
				error = 'No record for assessment feedback '+id;
				dbQueryPromise.reject();
			} else {
				var feedback = docs[0];
				pageContentsPromise.then(function() {
					var inviteeObj = {
						firstName: feedback.inviteeFirstName, 
						lastName: feedback.inviteeLastName, 
						email: feedback.inviteeEmail,
						data: feedback.data
					};
					var inviterObj = {
						firstName: feedback.inviterFirstName, 
						lastName: feedback.inviterLastName, 
						email: feedback.inviterEmail
					};
					var AssessmentObj = feedback.Assessment;
					contents = pageContents
						.replace(/\{\{rootPath\}\}/g, context.pathPrefix)
						.replace(/\{\{inviteeObj\}\}/g, JSON.stringify(inviteeObj))
						.replace(/\{\{inviterObj\}\}/g, JSON.stringify(inviterObj))
						.replace(/\{\{AssessmentObj\}\}/g, JSON.stringify(AssessmentObj));
					dbQueryPromise.resolve();
				}, function(err) {
					error = err;
					dbQueryPromise.reject();
				});
			}
		});
	});
	AllOrNone(promises).then(function(results) {
		res.send(contents);
	}, function() {
		res.send(400, error); // 500=InternalServerError
	});
};
