/**
 * Sends email invitations to new brand assessment invitees
 */

var ObjectId = require('mongodb').ObjectId,
	sendMail = require('../util/sendMail'),
	nodePromise = require('node-promise'),
	Promise = nodePromise.Promise,
	AllOrNone = nodePromise.allOrNone;

var sendEmailInvitations = function(newAssessmentInvitations, userFirstName, userLastName, userEmail, context, callback) {
	var invitees = newAssessmentInvitations.newInvitees;
	if (!Array.isArray(invitees) || invitees.length == 0) {
		callback(null);
	}
	var error = null;
	var sendMailResponseCount = 0;
	invitees.forEach(function(invitee) {
		var emailText = invitee.emailText || newAssessmentInvitations.defaultEmailText;
		var url = context.BrandingPaysDotCom ? 'https://brandingpays.com/learn/' : 'https://localhost:3000/';
		url += 'assessment/'+invitee.invitationId;
		var adjustedTextBase = emailText
			.replace(/\{\{INVITEE_FIRSTNAME\}\}/g, invitee.firstName)
			.replace(/\{\{INVITEE_LASTNAME\}\}/g, invitee.lastName)
			.replace(/\{\{MY_FIRSTNAME\}\}/g, userFirstName)
			.replace(/\{\{MY_LASTNAME\}\}/g, userLastName)
			.replace(/\{\{MY_EMAIL\}\}/g, userEmail)
			.replace(/\{\{DUEDATE\}\}/g, (new Date(newAssessmentInvitations.dueDate)).toDateString())
			.replace(/\{\{FEEDBACK_URL\}\}/g, url)
			;
		var userEmailAdjusted = userEmail.replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
		var adjustedTextHtml = adjustedTextBase
			.replace(/\{\{MY_EMAIL\}\}/g, userEmailAdjusted)
			.replace(/\n/g, '<br>');
		var adjustedTextText = adjustedTextBase
			.replace(/\{\{MY_EMAIL\}\}/g, userEmail)
			;
		var name = invitee.firstName+' '+invitee.lastName;
		var params = {
			html: adjustedTextHtml,
			text: adjustedTextText,
			subject: 'Please provide feedback on my personal brand',
			email: invitee.email,
			name: name
		};
		sendMail(params, function(err, result) {
			sendMailResponseCount++;
			if (err) {
				console.error('sendMail failed! e='+JSON.stringify(e));
				error = err;
			}
			if (sendMailResponseCount >= invitees.length) {
				callback(error);
			}
		});
	});
};

module.exports = function(newAssessmentInvitations, user, context, allDonePromise) {
	var db = context.db;
	var promises = [];
	for (var i=0; i<newAssessmentInvitations.newInvitees.length; i++) {
		promises.push(new Promise());
	}
	db.createCollection('assessmentInvitations', {strict:true}, function(err, assessmentInvitationsCollection) {
		if (err) {	// err==null means the collection did not already exist
			assessmentInvitationsCollection = db.collection('assessmentInvitations');
		}
		newAssessmentInvitations.newInvitees.forEach(function(invitee, i) {
			invitee.invitationId = new ObjectId();
			var obj = {
				_id: invitee.invitationId,
				inviterUserId: user._id,
				inviterFirstName: user.firstName,
				inviterLastName: user.lastName,
				inviterEmail: user.email,
				inviteeFirstName: invitee.firstName,
				inviteeLastName: invitee.lastName,
				inviteeEmail: invitee.email,
				assessmentId: newAssessmentInvitations.assessmentId
			};
			assessmentInvitationsCollection.insert(obj, function(i, err, result) {
				if (err) {
					promises[i].reject(err);
				} else {
					promises[i].resolve();
				}
			}.bind(this, i));
		});
		AllOrNone(promises).then(function(results) {
			sendEmailInvitations(newAssessmentInvitations, user.firstName, user.lastName, user.email, context, function(err) {
				if (err) {
					allDonePromise.reject(err);
				} else {
					allDonePromise.resolve();
				}
			});
		}, function() {
			res.send(500, error); // 500=InternalServerError
		});
	}.bind(this));
};
