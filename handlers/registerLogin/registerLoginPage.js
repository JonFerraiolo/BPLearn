/**
 * Logic to transmit web page for login and register user interfaces.
 */

module.exports = function(req, res, next, context) {
	var fs = require('fs');
	var host = req.get('host');
	var pageContents = fs.readFileSync(__dirname + '/registerLogin.html').toString()
	var contents = pageContents.replace(/\{\{rootPath\}\}/g, context.pathPrefix);
	res.send(contents);
};
