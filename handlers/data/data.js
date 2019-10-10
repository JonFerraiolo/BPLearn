/**
 * Request handler for "/xhr/data" - CRUD operations on user data
 */

var ObjectId = require('mongodb').ObjectId,
	nodePromise = require('node-promise'),
	Promise = nodePromise.Promise,
	AllOrNone = nodePromise.allOrNone;

module.exports = {
	post: function(req, res, next, context) {
console.log('data.js entered');
		if (typeof req.body != 'object') {
			res.send(400, 'data post - body is not an object'); // 400=BadRequest
			return;
		}
		if (typeof req.body.data != 'object') {
			res.send(400, 'data post - body.data is not an object'); // 400=BadRequest
			return;
		}
		if (req.user) {
			var usersCollection = context.db.collection('users');
			var _id = new ObjectId(req.user._id);
console.log('data.js before usersCollection.find');
			usersCollection.find({ _id: _id }).toArray(function (err, docs) {
console.log('data.js within usersCollection.find. err='+err+', docs.length='+docs.length);
			 	if (err) {
					res.send(500, 'data.post collection.find error: '+err); // 500=InternalServerError
					return;
			 	}
				if (docs.length != 1) {
					res.send(400, 'email "'+req.user.email+'" is not registered'); // 400=BadRequest
					return;
				}
				var oldData = docs[0].data ? JSON.parse(JSON.stringify(docs[0].data)) : undefined; 	// clone
console.log('data.js before usersCollection.update');
				req.body.data.lastModified = (new Date()).toJSON();
				usersCollection.update({ _id: _id }, {$set: {data:req.body.data}}, function(err, count) {
console.log('data.js within usersCollection.update. err='+err);
				 	if (err) {
						res.send(500, 'data.post collection.update error: '+err); // 500=InternalServerError
						return;
				 	}
console.log('data.js typeof req.body.params='+typeof req.body.params);
				 	if (typeof req.body.params == 'object') {
				 		var promises = [];
				 		for (var i in req.body.params) {
				 			var dataExtra = context.dataExtras[i];
				 			if (typeof dataExtra == 'function') {
				 				var promise = new Promise();
				 				promises.push(promise);
				 				dataExtra(req.body.params[i], req.user, context, promise);
				 			}
				 		}
						AllOrNone(promises).then(function(results) {
console.log('data.js AllOrNone(promises).then');
							res.send('');
						}, function() {
console.log('data.js AllOrNone(promises).error');
							usersCollection.update({ _id: _id }, {$set: {data:oldData}}, function(err, count) {});
							res.send(500, error); // 500=InternalServerError
						});
				 	} else {
						res.send('');
				 	}
				});
			});
		} else {
			res.writeHead(302, { 'Location': context.pathPrefix+'startup' });
			res.end();
		}
	},

	userDataLastModified: function(req, res, next, context) {
console.log('userDataLastModified entered');
		if (req.user) {
			var usersCollection = context.db.collection('users');
			var _id = new ObjectId(req.user._id);
console.log('userDataLastModified before usersCollection.find');
			usersCollection.find({ _id: _id }).toArray(function (err, docs) {
console.log('userDataLastModified within usersCollection.find. err='+err+', docs.length='+docs.length);
			 	if (err) {
					res.send(500, 'userDataLastModified collection.find error: '+err); // 500=InternalServerError
					return;
			 	}
				if (docs.length != 1) {
					res.send(400, 'email "'+req.user.email+'" is not registered'); // 400=BadRequest
					return;
				}
				res.send(docs[0].data.lastModified);
			});
		} else {
			res.writeHead(302, { 'Location': context.pathPrefix+'startup' });
			res.end();
		}
	}
};
