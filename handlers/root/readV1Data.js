/**
 * Reads legacy data stored by tools v1.
 */

var fs = require('fs');

module.exports = function(email, context, callback) {
	var usersFolderPath = context.BrandingPaysDotCom ? '/home/brandi7/users' : '/Applications/XAMPP/xamppfiles/htdocs/users';

	/**
	 * Read the user's latest data file
	 * @param {string} userFolderPath  Path to user's data folder
	 * @param {function} callback 
	 *      {null|undefined|string} Error string if any errors found
	 *      {string} Contents of latest data file
	 */
	var readLatestData = function(userFolderPath, callback) {
		var latestPath = userFolderPath + '/latest';
		fs.readFile(latestPath, function(err, latestContents) {
			if (err) {
				var msg = 'Cannot read latestPath='+latestPath+', err='+err;
				console.error(msg);
				callback(msg);
			} else {
				var dataPath = userFolderPath + '/' + latestContents.toString().trim();
				fs.readFile(dataPath, function(err, dataContents) {
					if (err) {
						var msg = 'Cannot read latestPath='+latestPath+', err='+err;
						console.error(msg);
						callback(msg);
					} else {
						callback(null, dataContents.toString());
					}
				});
			}
		});
	};

	var userFolderPath = usersFolderPath + '/' + email;
	readLatestData(userFolderPath, function(err, dataContents) {
		if (err) {
			callback(err, null);
		} else {
			var dataNormalized = dataContents.replace(/(?:\r\n|\r)/g, '\n');
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

			// Convert from v1 format to v2 format
			var mostRecentSheetIds = {};
			var oldToNew = { 
				'PosnStmt': 'Positioning_Statement', 
					'TitleAndFunction': 'Title_And_Function', 
					'TargetAudience': 'Target_Audience', 
					'ProblemStatement': 'Problem_Statement', 
					'ValueProposition': 'Value_Proposition', 
					'CompetitiveDifferentiation': 'Competitive_Differentiation', 
					//FIXME: Need to deal with Evidence
				'ElevatorPitch': 'Elevator_Pitch',
					'FiveSecond': 'Five_Second',
					'FifteenSecond': 'Fifteen_Second',
					'ThirtySecond': 'Thirty_Second',
				'Strategy': 'Brand_Strategy', 
					'BrandAssociations': 'Brand_Associations',
					'BrandExperience': 'Brand_Experience',
					'BrandMetaphor': 'Brand_Metaphor',
					'CareerDreams': 'Career_Dreams',
					'EmotionalValue': 'Emotional_Value',
					'ExternalImage': 'External_Image',
					'HardSkills': 'Hard_Skills',
					'PersonalityAttributes': 'Personality_Attributes',
					'RationalValue': 'Rational_Value',
					'RelationshipImage': 'Relationship_Image',
					'SoftSkills': 'Soft_Skills',
					'TypeOfLeader': 'Type_Of_Leader_Worker',
					'WhatILove': 'What_I_Love_Doing',
				'EcosysModel': 'Ecosystem_Model'
			};

			var recurseData = function(parentObj, obj, objPropName) {
				if (!obj) {
					return;
				}
				var revisedPropName = objPropName;
				var updatePropName = function(oldPropName, newPropName) {
					delete parentObj[oldPropName];
					parentObj[newPropName] = obj;
					revisedPropName = newPropName;
				};
				var isContainer = function(obj) {
					var container = false;
					for (var i in obj) {
						container = true;	// If object has any sub-properties
						break;
					}
					return container;
				};
				if (oldToNew[objPropName]) {
					updatePropName(objPropName, oldToNew[objPropName]);
				}
				if (obj.UArray) {
					mostRecentSheetIds[revisedPropName] = obj.UIndex || 0;
					parentObj[revisedPropName] = obj.UArray;
					parentObj[revisedPropName].forEach(function(o) {
						recurseData(null, o, null);
					});
				} else {
					var coreValuesMatch = objPropName && objPropName.match(/^CoreValue(\d+)$/);
					if (objPropName == 'KeyDescriptors') {
						// Leave KeyDescriptors as an array, but rename to Key_Brand_Descriptors
						// and convert any empty objects to strings
						var arr = [];
						for (var i=0; i<3; i++) {
							var item = typeof obj[i] == 'string' ? obj[i] : '';
							arr.push(item);
						}
						parentObj.Key_Brand_Descriptors = arr;
						delete parentObj.KeyDescriptors;
					} else if (objPropName == 'Evidence') {
						// Change Evidence from {One:,Two:,Three:} to [,,]
						parentObj.Evidence = [];
						parentObj.Evidence[0] = typeof obj.One == 'string' ? obj.One : '';
						parentObj.Evidence[1] = typeof obj.Two == 'string' ? obj.Two : '';
						parentObj.Evidence[2] = typeof obj.Three == 'string' ? obj.Three : '';
					} else if (coreValuesMatch) {
						// Convert into Core_Values array
						if (!parentObj.Core_Values) {
							parentObj.Core_Values = [];
						}
						parentObj.Core_Values[parseInt(coreValuesMatch[1])-1] = typeof obj == 'string' ? obj : '';
						delete parentObj[objPropName];
					} else if (typeof obj == 'object') {
						if (isContainer(obj)) {
							for (var i in obj) {
								recurseData(obj, obj[i], i);
							}
						} else {
							parentObj[revisedPropName] = '';	// convert empty objects to empty strings
						}
					}
				}
			};
			var temp = JSON.parse(JSON.stringify(U)); // clone
			recurseData(null, temp, null);
			var lastUniqueId = 0;
			var data = { workbooks: {} };
			var workbookId = ++lastUniqueId;
			data.workbooks[workbookId] = { _id: workbookId, Title: 'Workbook 1', sheets: {} };
			['Positioning_Statement', 'Elevator_Pitch', 'Brand_Strategy'].forEach(function(sheetType) {
				var sheetTypeAdjusted = sheetType.replace(/_/g, ' ');
				data.workbooks[workbookId].sheets[sheetType] = {};
				for (var i=0; i<temp[sheetType].length; i++) {
					var sheet = temp[sheetType][i];
					var sheetId = sheet._id = ++lastUniqueId;
					sheet.Title = sheetTypeAdjusted + ' ' + (i+1);
					data.workbooks[workbookId].sheets[sheetType][sheetId] = sheet;
				}
			});
			data.lastUniqueId = lastUniqueId;
			callback(null, data);
		}
	});
};
