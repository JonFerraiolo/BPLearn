/**
 * Creates a new element.
 * 
 * @param {string} tagName ('div' instead of 'DIV', can also be svg:svg or whatever)
 *
 * @param {object} params
 * @param {object} params.attrs  Attributes. Name/value pairs, where values are strings.
 * @param {object} params.styles  Inline style. Name/value pairs, where name is
 *       property name spelled for dom (e.g., backgroundColor) and value is string.
 * @param {object} params.events  Event listeners to add. Name/value pairs, where name
 *       is event name passed to addEventListener (i.e., click instead of onclick) and values are function.
 * @param {string|array} params.children  Child nodes. Various options:
 *       If a string, then string represents innerHTML for node.
 *       If an array, then each item in array is a child node, where an item
 *       can be either a string (for text nodes) or an Element object.
 *
 * @param {Element} [parentNode] If provided, then new node becomes last child node for parentNode.
 *
 * @return {Element}  Element that is created
 */
define(function() {
	return function(tagName, params, parentNode) {
		var attrs = (params && params.attrs) || {},
			styles = (params && params.styles) || {},
			events = (params && params.events),
			children = (params && params.children);
		var tokens = tagName.split(':');
		var newNode;
		if (tokens.length == 2 && tokens[0] == 'svg') {
			newNode = document.createElementNS('http://www.w3.org/2000/svg', tokens[1]);
		} else {
			newNode = document.createElement(tagName);
		}
		for (var i in attrs) {
			newNode.setAttribute(i, attrs[i]);
		}
		for (var i in styles) {
			newNode.style[i] = styles[i];
		}
		for (var i in events) {
			newNode.addEventListener(i, events[i], false);
		}
		if (typeof children == 'string') {
			newNode.innerHTML = children;
		} else if (Array.isArray(children)) {
			children.forEach(function(child) {
				newNode.appendChild(child);
			});
		}
		if (parentNode) {
			parentNode.appendChild(newNode);
		}
		return newNode;
	};
});