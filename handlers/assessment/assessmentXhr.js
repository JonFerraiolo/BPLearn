
var ObjectId = require('mongodb').ObjectId,
	consolidateFeedback = require('./consolidateFeedback');

module.exports = {
	// A POST operation to /xhr/assessment/{assessmentId} that either creates 
	// a newly submitted feedback from an invitee or updates already existing feedback. 
	// Expected req.body:
	//   assessment{}
	//      field1
	//      field2
	//      etc 
	// Returns just an empty string and an http status code
	inviteeFeedback: function(req, res, next, context) {
		//FIXME: if dueDate has already passed, the client should say so.
		var tokens = req.path.split('/');
		var invitationId = tokens[2];
		if (!invitationId) {
			res.send(400, 'inviteeFeedback(post) - URL does not contain an invitationId'); // 400=BadRequest
			return;
		}
		var _id = new ObjectId(invitationId);
		// Many lines at the top of this function provide
		// integrity checks on the data that was sent in the request body
		if (typeof req.body != 'object') {
			res.send(400, 'inviteeFeedback(post) - body is not an object'); // 400=BadRequest
			return;
		}
		var Assessment = req.body.data && req.body.data.Assessment;
		if (!Assessment) {
			res.send(400, 'inviteeFeedback(post) - Assessment field is  missing'); // 400=BadRequest
			return;
		}
		var assessmentInvitationsCollection = context.db.collection('assessmentInvitations');
		if (!assessmentInvitationsCollection) {
			res.send(400, 'inviteeFeedback(post) - collection not found'); // 500=InternalServerError
			return;
		}
		assessmentInvitationsCollection.find({ _id: _id }).toArray(function (err, docs) {
			if (err || docs.length != 1) {
				res.send(400, 'inviteeFeedback(post) - invitation find error'); // 400=BadRequest
				return;
			}
			var assessmentInvitation = docs[0];
			assessmentInvitationsCollection.update({ _id: _id }, {$set: {Assessment:Assessment}}, function(err, count) {
				if (err) {
					res.send(500, 'inviteeFeedback(post) - collection.update error: '+err); // 500=InternalServerError
					return;
				}
				res.send('');
			});
		});
	},

	// A POST operation to /xhr/assessmentConsolidate that either creates 
	// a newly submitted feedback from an invitee or updates already existing feedback. 
	// Expected req.body: {}
	//   workbookId
	//   sheetId
	// Returns just an empty string and an http status code
	consolidateFeedback: function(req, res, next, context) {
		if (req.user) {
			var usersCollection = context.db.collection('users');
			var _id = new ObjectId(req.user._id);
			usersCollection.find({ _id: _id }).toArray(function (err, docs) {
			 	if (err) {
					res.send(500, 'consolidateFeedback(post) - collection.find error: '+err); // 500=InternalServerError
					return;
			 	}
				if (docs.length != 1) {
					res.send(400, 'consolidateFeedback(post) - email "'+req.user.email+'" is not registered'); // 400=BadRequest
					return;
				}
				if (!docs[0].data) {
					res.send(500, 'consolidateFeedback(post) - data error'); // 500=InternalServerError
					return;
				}
				var data = docs[0].data;
				if (typeof req.body != 'object') {
					res.send(400, 'consolidateFeedback(post) - body is not an object'); // 400=BadRequest
					return;
				}
				var workbookId = req.body.workbookId;
				var sheetId = req.body.sheetId;
				if (typeof workbookId != 'number' || typeof sheetId != 'number') {
					res.send(400, 'consolidateFeedback(post) - invalid values for workbookId or sheetId'); // 400=BadRequest
					return;
				}
				var Assessment = data.workbooks && data.workbooks[workbookId] && data.workbooks[workbookId].sheets &&
					 data.workbooks[workbookId].sheets.Assessment && data.workbooks[workbookId].sheets.Assessment[sheetId];
				if (!Assessment) {
					res.send(500, 'consolidateFeedback(post) - no active Assessment for workbookId:'+workbookId+', sheetId='+sheetId); // 500=InternalServerError
					return;
				}
				if (Assessment._consolidated) {
					res.send(400, 'consolidateFeedback(post) - Assessment already consolidated for workbookId:'+workbookId+', sheetId='+sheetId); // 400=BadRequest
					return;
				}
				consolidateFeedback(context, Assessment, function(err, consolidated) {
					if (err) {
						res.send(500, 'consolidateFeedback(post) - Assessment already consolidated for workbookId:'+workbookId+', sheetId='+sheetId); // 500=InternalServerError
						return;
					} else {
						Assessment._consolidated = consolidated;
						var usersCollection = context.db.collection('users');
						usersCollection.update({ _id: _id }, {$set: {data:data}}, function(err, count) {
						 	if (err) {
								res.send(500, 'consolidateFeedback(post) - collection.update error: '+err); // 500=InternalServerError
								return;
						 	}
							res.send('');
						});
					}
				});
			});
		} else {
			res.writeHead(302, { 'Location': context.pathPrefix+'startup' });
			res.end();
		}
	}
};
