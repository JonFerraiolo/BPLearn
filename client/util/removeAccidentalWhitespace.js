/**
 * Makes "accidental" whitespace from HTML snippets.
 * More specifically, removes all newlines and any leading spaces/tabs that immediately follow newlines.
 * For example, if you have this as input:
 * <div>
 *   <span>abc</span>
 *   <span>def</span>
 * </div>
 * The browser normally would show "abc def" because of the whitespace between the two spans.
 * This routine munges the text string into "<div><span>abc</span><span>def</span></div>,
 * and the browser will show "abcdef".
 *
 * @param {string} inputString 
 * @return {string}  output string
 */
define(function() {
	return function(inputString) {
		var outputString = inputString.replace(/\n[\t\s]*/g,'')
		return outputString;
	};
});