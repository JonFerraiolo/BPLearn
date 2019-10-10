/**
 * Low-level, application-independent utilities for setting up the model of an MVC system.
 * Contains these routines:
 *   get() - Get a value from the model, e.g., 'a.b.c' or 'e[3].f[2].g'
 *   set() - Set or update a value in the model
 *   watch() - Watch for changes to a part of the model
 *   unwatch() - Turn off a watcher
 */
define([
	'./mvcbase',
	'../util/sheetTypeToClass',
	'../util/sheetTypeToHtmlTemplate'
], function(
	mvcbase,
	sheetTypeToClass,
	sheetTypeToHtmlTemplate
) {
	// Initial data model
	var initData = {
		lastUniqueId: 0,
		nav: {
			mainTab: undefined,		// Tabs at top: Course vs My Workbook vs ...
			chapterId: undefined,	// Current chapter viewed in course
			moduleId: undefined,	// Current module within current chapter in course
			workbookId: undefined,	// Current workbook
			currentSheetType: {},	// Current sheetType within a workbook, indexed by [workbookId]
			currentSheetId: {}		// Current sheetId within a sheetType within a workbook, indexed by [workbookId][sheetType]
		},
		workbooks: {	// indexed by [workbookId]. For each workbook:
			/*
			{
				_id: ++lastUniqueId,
				Title: 'Workbook 1',
				sheets: {} // indexed by sheetType
					// each item is an object indexed by sheetId: <sheet>, 
					// where each <sheet> looks something like this
					// { _id: ++lastUniqueId, Title: 'Positioning Statement 1', ... }
			}
			*/
		}
	};

	var mvcapp = function() {
		this.mvcbase = new mvcbase(initData);
		this.data = this.mvcbase.get('');
	};

	var p = mvcapp.prototype;

	/**
	 * Retrieves the value of the given property.
	 * @param {string} prop name of property, such as "workbooks[0].Positioning_Statement[0].TargetAudience"
	 * @returns {any} the value of the given property, or undefined if the property does not exist
	 */
	p.get = function(prop) {
		return this.mvcbase.get(prop);
	};

	/**
	 * Sets the value of the given property.
	 * @param {string} prop  (see get function)
	 * @param {any} value new value for the property
	 * @param {object} [params] optional additional parameters to send to server
	 * @param {object} [params.assessmentInvitations] server should send email assessment invitations
	 * @oaran {array} [params.assessmentInvitations.newInvitees] server array of newInvitees
	 *                  Each item is object: { firstName, lastName [,emailText] }
	 * @param {array} [params.assessmentInvitations.defaultEmailText] default email text to send to invitees
	 * @param {array} [params.assessmentInvitations.dueDate] when assessment feedback is due (yyyy-mm-dd)
	 */
	p.set = function(prop, value, params) {
		return this.mvcbase.set(prop, value, params);
	};

	/**
	 * Watch a particular property (including higher-level container properties).
	 * Invoke the given callback whenever the property value changes.
	 * @param {string|regexp} prop  
	 *       If string, then call watcher func if exact string match with prop given to set().
	 *       If regex, then call watcher func if prop given to set() matches this regex.
	 * @param {function} callback  function to call when property value changes
	 * @returns {any|null} a handle so that the watch can be cancelled by calling unwatch.
	 *       null indicates watch() call failed.
	 */
	p.watch = function(prop, callback) {
		return this.mvcbase.watch(prop, callback);
	};

	/**
	 * Cancel a watch.
	 * @param {any} handle  The ID of the active watch which you want to cancel.
	 */
	p.unwatch = function(handle) {
		return this.mvcbase.unwatch(handle);
	};

	/**
	 * Returns a unique id (a number)
	 * @returns {number} An id unique to this user
	 */
	p.newUniqueId = function() {
		var lastUniqueId = this.mvcbase.get('lastUniqueId');
		lastUniqueId++;
		this.mvcbase.set('lastUniqueId', lastUniqueId);
		return lastUniqueId;
	};

	/**
	 * Returns number of workbooks
	 * @returns {number} number of workbooks
	 */
	p.nWorkbooks = function() {
		var workbooks = this.mvcbase.get('workbooks');
		var nWorkbooks = 0;
		for (var i in workbooks) {
			nWorkbooks++;
		}
		return nWorkbooks;
	};

	/**
	 * Returns number of sheets for a given workbookId and sheetType
	 * @param {number} workbookId
	 * @param {string} sheetType
	 * @returns {number} number of sheets
	 */
	p.nSheets = function(workbookId, sheetType) {
		var sheets = this.get('workbooks['+workbookId+'].sheets['+sheetType+']');
		var nSheets = 0;
		for (var i in sheets) {
			nSheets++;
		}
		return nSheets;
	};

	/**
	 * Returns current workbookId
	 * @returns {number} Current workbookId
	 */
	p.currentWorkbookId = function() {
		return this.mvcbase.get('nav.workbookId');
	};

	/**
	 * Returns current sheetType for a given workbookId
	 * @returns {number} Current sheetType
	 */
	p.currentSheetType = function(workbookId) {
		return this.mvcbase.get('nav.currentSheetType['+workbookId+']');
	};

	/**
	 * Returns current sheetid for a given workbookId/sheetType
	 * @returns {number} Current sheetid
	 */
	p.currentSheetId = function(workbookId, sheetType) {
		return this.mvcbase.get('nav.currentSheetId['+workbookId+']['+sheetType+']');
	};

	/**
	 * Find a workbook based on its id
	 * @param {string} id The _id value for a given workbook
	 * @returns {object|undefined} A workbook object or undefined
	 */
	p.workbookById = function(id) {
		var workbooks = this.mvcbase.get('workbooks');
		if (workbooks && workbooks.length) {
			for (var i in workbooks) {
				if (i == id) {
					return workbooks[i];
				}
			}
		}
	};

	/**
	 * Find a workbook based on its id
	 * @param {number} workbookId The id value for a given workbook
	 * @param {string} sheetType what type of sheet
	 * @param {number} sheetId The id value for a given sheet
	 * @returns {object|undefined} A sheet object or undefined
	 */
	p.sheetById = function(workbookId, sheetType, sheetId) {
		return this.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']');
	};

	p.getFirstWorkbook = function() {
		var workbooks = this.get('workbooks');
		for (var workbookId in workbooks) {
			return workbooks[workbookId];
		}
	};

	p.getFirstWorkbookId = function() {
		var workbooks = this.get('workbooks');
		for (var workbookId in workbooks) {
			return workbookId;
		}
	};

	p.getFirstSheet = function(workbookId, sheetType) {
		var sheets = this.get('workbooks['+workbookId+'].sheets['+sheetType+']');
		for (var sheetId in sheets) {
			return sheets[sheetId];
		}
	};

	p.getFirstSheetId = function(workbookId, sheetType) {
		var sheets = this.get('workbooks['+workbookId+'].sheets['+sheetType+']');
		for (var sheetId in sheets) {
			return sheetId;
		}
	};

	p.newWorkbook = function() {
		var workbooks = this.mvcbase.get('workbooks') || {};
		var nWorkbooks = 0;
		for (var i in workbooks) {
			nWorkbooks++;
		}
		var workbookNum = nWorkbooks + 1;
		var newId = this.newUniqueId();
		return {
			_id: newId,
			Title: 'Workbook '+workbookNum,
			sheets: {}
		};
	}

	p.newSheet = function(workbookId, sheetType) {
		var workbook = this.mvcbase.get('workbooks['+workbookId+']') || this.newWorkbook();
		var sheets = (workbook.sheets && workbook.sheets[sheetType]) || {};
		var nSheets = 0;
		for (var i in sheets) {
			nSheets++;
		}
		var sheetNum = nSheets + 1;
		var newId = this.newUniqueId();
		return {
			_id: newId,
			Title: sheetType+' '+sheetNum
		};
	};

	p.printPage = function(workbookId, sheetType, sheetId) {
		var htmlTemplate = sheetTypeToHtmlTemplate[sheetType];
		var formData = this.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']') || this.newSheet(workbookId, sheetType);
		if (htmlTemplate && formData) {
			var uiDiv = document.body.querySelector('.ui');
			var printDiv = document.body.querySelector('.print');
			var printContent = document.body.querySelector('.printContent');
			printContent.innerHTML = '';
			uiDiv.style.display = 'none';
			printDiv.style.display = '';
			var module = sheetTypeToClass[sheetType];
			if (module && module.printPage) {
				module.printPage(printContent, this, workbookId, sheetType, sheetId);
			} else {
				printContent.innerHTML = removeAccidentalWhitespace(htmlTemplate);
				this.updateFormFields(printContent, formData);
			}
			print();
			uiDiv.style.display = '';
			printDiv.style.display = 'none';
			printContent.innerHTML = '';
		}
	};

	p.printWorkbook = function(workbookId) {
		var workbook = this.get('workbooks['+workbookId+']') || this.newWorkbook();
		var uiDiv = document.body.querySelector('.ui');
		var printDiv = document.body.querySelector('.print');
		var printContent = document.body.querySelector('.printContent');
		printContent.innerHTML = '';
		for (sheetType in sheetTypeToHtmlTemplate) {
			var htmlTemplate = sheetTypeToHtmlTemplate[sheetType];
			var sheets = workbook.sheets[sheetType];
			var sheetCount = 0;
			for (var sheetId in sheets) {
				var formData = this.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']') || this.newSheet(workbookId, sheetType);
				var module = sheetTypeToClass[sheetType];
				if (htmlTemplate && formData) {
					var container = elem('div', {}, printContent);
					if (sheetCount > 0) {
						container.className = 'pageBreak';
					}
					if (module && module.printPage) {
						module.printPage(container, this, workbookId, sheetType, sheetId);
					} else {
						container.innerHTML = removeAccidentalWhitespace(htmlTemplate);
						this.updateFormFields(container, formData);
					}
					sheetCount++;
				}
			}
		}
		uiDiv.style.display = 'none';
		printDiv.style.display = '';
		print();
		uiDiv.style.display = '';
		printDiv.style.display = 'none';
		printContent.innerHTML = '';
	};

	p.duplicateWorkbookPostProcess = function(workbook, workbookId) {
		for (sheetType in sheetTypeToHtmlTemplate) {
			var module = sheetTypeToClass[sheetType];
			if (module.duplicateWorkbookPostProcess) {
				var sheets = workbook.sheets[sheetType];
				for (var i in sheets) {
					var sheet = sheets[i];
					module.duplicateWorkbookPostProcess(sheet, workbookId, sheetType, i);
				}
			}
		}
	};

	p.duplicateSheetPostProcess = function(sheet, workbookId, sheetType, sheetId) {
		var module = sheetTypeToClass[sheetType];
		if (module.duplicateWorkbookPostProcess) {
			module.duplicateWorkbookPostProcess(sheet, workbookId, sheetType, sheetId);
		}
	};

	return mvcapp;
});
