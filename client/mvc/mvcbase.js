/**
 * Low-level, application-independent utilities for setting up the model of an MVC system.
 * Contains these routines:
 *   get() - Get a value from the model, e.g., 'a.b.c' or 'e[3].f[2].g'
 *   set() - Set or update a value in the model
 *   watch() - Watch for changes to a part of the model
 *   unwatch() - Turn off a watcher
 */
define([
], function(
) {
	window._mvc = {};	// to help with debugging

	// Model - application should initiatialize by calling init()
	var data;

	// An associative array of all watchers that are defined as simple strings.
	// An example of a simple string: "workbooks[0].Positioning_Statement[0].TargetAudience"
	// Each array entry is an array of callback funcs.
	var watchedString = {};

	// An associative array of all watchers that are defined as regular expressions,
	// typically using regular expression to achieve some sort of wildcard matching.
	// Each array entry is an array of callback funcs.
	// An example of a regular expression: /^workbooks\[0\]\.Positioning_Statement\[0\]\..*$",
	// which looks for workbooks[0], Positioning_Statement[0], and match any field 
	// (i.e., TargetAudience, ProblemStatement, etc.)
	var watchedRegex = {};

	// An associative array used to cache things to speed up performance when using regular expressions.
	// The associative array is indexed by property names that have been the first argument
	// to the set() function below.
	// Each array entry is an array of watcher callback funcs that correspond to that property name.
	// Note that this associative array is cleared each time that unwatch() is called.
	var matchedRegex = {};

	// Because JavaScript only used strings as indices to associative arrays,
	// we need a xref that maps strings such as "^foo\[0\]\.type$" to its corresponding regexp value
	var regexXref = {};

	// All active watchers have a handle, which can be used to remove the watcher by calling unwatch().
	// The first watcher gets handle[0], the second gets handle[1].
	// When unwatch() is called on handle <i>, then handle[i] gets set to null.
	var handles = [];
	var lastHandle = -1;

	/**
	 * tokenize a property identifier string, which is allowed to contain
	 * periods, brackets and quotes, such as:
	 *   a
	 *   a.b
	 *   a[0][1]['xyz']
	 *   a[0][1]['xyz'].xxx
	 * @param {string} s  The string to tokenize
	 * @returns {null|Array(string)}  Return null if the tokenizer sees an error.
	 *    Otherwise, return an array of tokens. For example, for a[0][1]['xyz'].xxx,
	 *    it will return ['a','0','1','xyz','xxx']
	 **/
	var tokenize = function(s) {
		var tokens = [];
		var inquotes = false;	// possible values: false|singleQuote|doubleQuote
		var inbrackets = false;
		var startToken = 0;
		var tokenCount = 0;
		var singleQuote = '\'';
		var doubleQuote = '\"';
		for (var i=0; i<s.length; i++) {
			var ch = s[i];
			if (ch == '.' && !inquotes) {
				if (i > startToken) {	// Prevent extra "" token if "." follows "]"
					tokens[tokenCount++] = s.substring(startToken, i);
				}
				startToken = i+1;
			} else if (ch == '[' && !inquotes) {
				if (i > startToken) {	// Prevent extra "" token if "]" follows a "["
					tokens[tokenCount++] = s.substring(startToken, i);
				}
				startToken = i+1;
				inbrackets = true;
			} else if (ch == ']' && !inquotes && inbrackets) {
				if (i > startToken) {	// Prevent extra "" token if "]" follows a quote
					tokens[tokenCount++] = s.substring(startToken, i);
				}
				startToken = i+1;
				inbrackets = false;
			} else if (ch == singleQuote && inquotes===false) {
				inquotes = singleQuote;
				startToken = i+1;
			} else if (ch == singleQuote && inquotes==singleQuote) {
				if (i > startToken) {	// == Only possible when two single quotes are adjacent
					tokens[tokenCount++] = s.substring(startToken, i);
				}
				startToken = i+1;
				inquotes = false;
			} else if (ch == doubleQuote && inquotes===false) {
				inquotes = doubleQuote;
				startToken = i+1;
			} else if (ch == doubleQuote && inquotes==doubleQuote) {
				if (i > startToken) {	// == Only possible when two double quotes are adjacent
					tokens[tokenCount++] = s.substring(startToken, i);
				}
				startToken = i+1;
				inquotes = false;
			}
		}
		if (i > startToken) {
			tokens[tokenCount++] = s.substring(startToken, i);
		}
		if (tokenCount==0 || inquotes || inbrackets) {
			console.error('Tokenizer failed on this string: '+s);
			return null;
		} else {
			return tokens;
		}
	};

	var checkWatchers = function(prop, oldValue, newValue, params) {
		if (watchedString[prop]) {	// exact string match for simple string watcher
			watchedString[prop].forEach(function(func) {
				func(prop, oldValue, newValue, params);
			});
		}
		if (matchedRegex[prop]) {	// exact string match for previous setter than matches a regex
			matchedRegex[prop].forEach(function(func) {
				func(prop, oldValue, newValue, params);
			});
		} else {
			for (var regexString in watchedRegex) {
				var regex = regexXref[regexString];
				if (!regex) {
					regex = regexXref[regexString] = new RegExp(regexString);
				}
				if (regex.test(prop)) {
					watchedRegex[regexString].forEach(function(func) {
						if (!matchedRegex[prop]) {
							matchedRegex[prop] = [];
						}
						matchedRegex[prop].push(func);
						func(prop, oldValue, newValue, params);
					});
				}
			}
		}
	};

	var regexToStringNoSlashes = function(regex) {
		return regex.toString().replace(/^.(.*).$/, '$1');
	};

	var mvcbase = function(initData) {
		window._mvc.data = data = initData;
	};

	var p = mvcbase.prototype;

	/**
	 * Retrieves the value of the given property.
	 * @param {string} prop name of property, such as "workbooks[0].Positioning_Statement[0].TargetAudience"
	 * @returns {any} the value of the given property, or undefined if the property does not exist
	 */
	p.get = function(prop) {
		if (!prop) {
			return data;	// If no prop name given, return the whole model
		}
		var tokens = tokenize(prop);
		if (!tokens || !tokens.length) {
			return;
		}
		var parent = data;
		for (var i=0; i<tokens.length; i++) {
			var token = tokens[i];
			if (i == tokens.length-1) {
				return parent[token];
			} else {
				parent = parent[token];
				if (!parent) {
					return undefined;
				}
			}
		}
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
		if (!prop) {
			window._mvc.data = data = value;	// If no prop name given, set the whole model
			return;
		}
		var tokens = tokenize(prop);
		if (!tokens || !tokens.length) {
			return;
		}
		var lastToken = null;
		var grandParent = null;
		var parent = data;
		for (var i=0; i<tokens.length; i++) {
			var token = tokens[i];
			if (!parent) {
				if (token[0]>='0' && token[0]<='9') {
					grandParent[prevToken] = [];
				} else {
					grandParent[prevToken] = {};
				}
				parent = grandParent[prevToken];
			}
			if (i == tokens.length-1) {
				var valueChanged = false;
				if (value !== null && (Array.isArray(value) || typeof value === 'object')) {
					var oldValue = JSON.stringify(parent[token]);
					var newValue = JSON.stringify(value);
					valueChanged = !(oldValue === newValue);
				} else if (value !== parent[token]) {
					valueChanged = true;
				}
				if (valueChanged) {
					var oldValue = parent[token];
					parent[token] = value;
					// Invoke any watchers
					checkWatchers(prop, oldValue, value, params);
				}
				return;
			} else {
				if (i == 0) {
					grandParent = data;
					parent = data[token];
				} else {
					if (parent) {
						grandParent = parent;
						parent = parent[token];
					}
				}
				prevToken = token;
			}
		}
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
		lastHandle++;
		if (typeof callback != 'function') {
			return null;
		}
		if (typeof prop == 'string') {
			if (!watchedString[prop]) {
				watchedString[prop] = [];
			}
			watchedString[prop].push(callback);
			var handle = handles[lastHandle] = { prop: prop, callback: callback, type: 'string', index: lastHandle };
			return handle;
		} else if (prop instanceof RegExp) {
			var propString = regexToStringNoSlashes(prop);
			if (!watchedRegex[propString]) {
				watchedRegex[propString] = [];
			}
			watchedRegex[propString].push(callback);
			var handle = handles[lastHandle] = { prop: propString, callback: callback, type: 'regex', index: lastHandle };
			return handle;
		}
		return null;
	};

	/**
	 * Cancel a watch.
	 * @param {any} handle  The ID of the active watch which you want to cancel.
	 */
	p.unwatch = function(handle) {
		if (handles[handle.index]) { 
			if (handle.type == 'string') {
				if (watchedString[handle.prop] && watchedString[handle.prop].length > 0) {
					for (var i=watchedString[handle.prop].length-1; i>=0; i--) {
						if (watchedString[handle.prop][i] === handle.callback) {
							watchedString[handle.prop].splice(i, 1);
						}
					}
				}
			} else if (handle.type == 'regex') {
				if (watchedRegex[handle.prop] && watchedRegex[handle.prop].length > 0) {
					for (var i=watchedRegex[handle.prop].length-1; i>=0; i--) {
						if (watchedRegex[handle.prop][i] === handle.callback) {
							watchedRegex[handle.prop].splice(i, 1);
						}
					}
					// This cleans the cache so that it gets rebuilt by future calls to set()					
					matchedRegex = {};
				}
			}
			handles[handle.index] = null;
		}
	};

	return mvcbase;
});
