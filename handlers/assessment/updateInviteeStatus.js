/**
 * Update the _inviteesEmailSent object on the Assessment object to reflect which
 * invitees have provided feedback so far. Note that the logic might update
 * the assessment object passed in as a parameter.
 * The callback has two params: err, anyChanges {boolean}
 */

 var nodePromise = require('node-promise')
 	Promise = nodePromise.Promise,
	AllOrNone = nodePromise.allOrNone,
	assessmentFields = require('./assessmentFields');

module.exports = function(context, assessment, callback) {
	var db = context.db;
	//FIXME: Index based on inviteeEmail and inviterEmail
	db.createCollection('assessmentInvitations', {strict:true}, function(err, assessmentInvitationsCollection) {
		if (err) {	// err==null means the collection did not already exist
			assessmentInvitationsCollection = db.collection('assessmentInvitations');
		}
		var changes = false;
		var responses = [];
		var promises = [];
		var anyFeedback = [];
		if (assessment && assessment._inviteesEmailSent && assessment._inviteesEmailSent.length > 0) {
			assessment._inviteesEmailSent.forEach(function(invitee) {
				promises.push(new Promise());
				anyFeedback.push(false);
			});
			for (var i=0; i<assessment._inviteesEmailSent.length; i++) {
				var invitee = assessment._inviteesEmailSent[i];
				assessmentInvitationsCollection.find({ assessmentId: assessment._assessmentId, inviteeEmail: invitee.email }).toArray(function (i, err, docs) {
					if (err) {
						promises[i].reject();
						return;
					}
					if (docs.length != 1) {
						promises[i].reject();
						return;
					}
					responses[i] = docs[0];
					promises[i].resolve();
				}.bind(this, i));
			}
		}
		AllOrNone(promises).then(function(results) {
			responses.forEach(function(response, i) {
				var Assessment = response.Assessment;
				assessmentFields.forEach(function(field) {
					if (Assessment && Assessment[field]) {
						anyFeedback[i] = true;
					}
				});
			});
			if (assessment && assessment._inviteesEmailSent && assessment._inviteesEmailSent.length > 0) {
				assessment._inviteesEmailSent.forEach(function(invitee, i) {
					// Use !! in case invitee.anyFeedback is undefined. !! causes a false value
					if (!!invitee.anyFeedback !== anyFeedback[i]) {
						invitee.anyFeedback = anyFeedback[i];
						changes = true;
					}
				});
			}
			callback(null, changes);
		}, function(err) {
			callback(new Error('consolidation error'));
		});
	});
};

