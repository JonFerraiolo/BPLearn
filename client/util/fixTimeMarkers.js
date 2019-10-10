/**
 * Stand-alone utility for updating the time stamps for attribute data-bp-start-time
 * within an HTML file.
 *
 * usage: node <thisfile> <folder-path>
 *
 * Typically used as follows:
 *
 * cd <BPToolsRootDir>/client/bookView
 * node ../util/fixTimeMarkers.js chapters
 *
 */

 var fs = require('fs');

var folderPath = null;
process.argv.forEach(function (val, index, array) {
	if (index < 2) {
		return;
	} else if (val[0] == '-') {
		// ignore for now
	} else if (!folderPath) {
		folderPath = (val[0] == '/') ? val : process.cwd() + '/' + val;
	}
});

if (!folderPath) {
	console.error('usage: node <thisfile> <folder-path>');
	process.exit(1);
}


var recurseFolder = function(folderPath, fileCB) {
	fs.readdir(folderPath, function(err, files) {
		files.forEach(function(fileName) {
			var filePath = folderPath + '/' + fileName;
			fs.stat(filePath, function(err, stats) {
				if (err) {
					fileCB(err);
				} else {
					if (stats.isDirectory()) {
						recurseFolder(filePath, fileCB);
					} else {
						fileCB(null, filePath);
					}
				}
			});
		});
	});	
};

recurseFolder(folderPath, function(err, filePath) {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	var tokens = filePath.split('.');
	var ext = tokens[tokens.length-1];
	if (ext == 'html') {
		fs.readFile(filePath, function(err, buf) {
			if (err) {
				console.error(err);
				process.exit(1);
			}
			var contents = buf.toString();
			var time = 0;
			var timeIncrement = 3;
			var anyChanges = false;
			var updatedContents = contents.replace(/data\-bp\-start\-time\s*\=\s*[\'\"]\d+[\'\"]/g, function(match) {
				var retval = "data-bp-start-time='"+time+"'";
				time += timeIncrement;
				anyChanges = true;
				return retval;
			});
			if (anyChanges) {
				fs.writeFileSync(filePath, updatedContents);
			}
		});
	}
});