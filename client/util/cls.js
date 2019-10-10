/**
 * Utilities to add and remove class name(s) to/from an element.
 */
define(function() {
	// Remove any empty strings in arrays
	// Can happen if element.className has leading or trailing blanks
	// or multiple spaces between class names
	var removeEmpties = function(elemClasses) {
		for (var i=elemClasses.length-1; i>=0; i--) {	// remove any empty strings from array
			if (elemClasses[i].length == 0) {
				elemClasses.splice(i, 1);
			}
		}
	};
	return {
		/**
		 * Adds class name(s) to/from an element.
		 *
		 * @param {Element} e DOM element 
		 * @param {string|array} classNames Class name or list of class names 
		 */
		add: function(e, classNames) {
			if (!Array.isArray(classNames)) {
				classNames = [classNames];
			}
			var elemClasses = e.className.split(' ');
			removeEmpties(elemClasses);
			classNames.forEach(function(c) {
				if (elemClasses.indexOf(c) < 0) {
					elemClasses.push(c);
				}
			});
			e.className = elemClasses.join(' ');
		},
		/**
		 * Removes class name(s) to/from an element.
		 *
		 * @param {Element} e DOM element 
		 * @param {string|array} classNames Class name or list of class names 
		 */
		remove: function(e, classNames) {
			if (!Array.isArray(classNames)) {
				classNames = [classNames];
			}
			var elemClasses = e.className.split(' ');
			removeEmpties(elemClasses);
			for (var i=elemClasses.length-1; i>=0; i--) {
				if (classNames.indexOf(elemClasses[i]) >= 0) {
					elemClasses.splice(i, 1);
				}
			}
			e.className = elemClasses.join(' ');
		},
		/**
		 * Returns true if all of the given class name(s) are found on the given element.
		 *
		 * @param {Element} e DOM element 
		 * @param {string|array} classNames Class name or list of class names 
		 */
		has: function(e, classNames) {
			if (!Array.isArray(classNames)) {
				classNames = [classNames];
			}
			var elemClasses = e.className.split(' ');
			removeEmpties(elemClasses);
			var allClassNamesFound = true;
			for (var i=0; i<classNames.length; i++) {
				if (elemClasses.indexOf(classNames[i]) < 0) {
					allClassNamesFound = false;
					break;
				}
			}
			return allClassNamesFound;
		}
	};
});