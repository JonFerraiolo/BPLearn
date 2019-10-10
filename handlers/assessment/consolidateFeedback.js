/**
 * Consolidates feedback from all people who have submitted feedback on a personal brand assessment.
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
		var responses = [];
		var promises = [];
		assessment._inviteesEmailSent.forEach(function(invitee) {
			promises.push(new Promise());
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
		AllOrNone(promises).then(function(results) {
			var consolidated = {};
			assessmentFields.forEach(function(field) {
				var arr = [];
				responses.forEach(function(response) {
					var Assessment = response.Assessment;
					if (Assessment && Assessment[field]) {
						arr.push(Assessment[field]);
					}
				});
				// Randomize values in array so user has trouble figuring out who said what
				var randomize = [];
				arr.forEach(function(item, i) {
					randomize.push({n:Math.random(), i:i});
				});
				randomize.sort(function(a,b) {
					return a.n > b.n;
				});
				consolidated[field] = '';
				randomize.forEach(function(item, i) {
					var response = (responses[item.i] && responses[item.i].Assessment && responses[item.i].Assessment[field]) || '';
					if (response.length > 0) {
						if (consolidated[field].length > 0 && consolidated[field][consolidated[field].length-1] != '\n') {
							consolidated[field] += '\n';
						}
						consolidated[field] += response;
					}
				});
			});
			callback(null, consolidated);
		}, function(err) {
			callback(new Error('consolidation error'));
		});
	});
};

