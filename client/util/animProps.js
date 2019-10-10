/**
 * Utilities to modify individual properties as part of an animation.
 * Useful to grow and shrink the height of a DIV
 */
define([
	'../util/cls'
], function(
	cls
) {

	/**
	 * Animate individual properties on a single node. Among other things,
	 * useful to grow and shrink the height of a DIV
	 *
	 * Setup rules:
	 *   For a grow/shrink animation on height of a DIV, need to set up CSS something like this:
	 *     <elem-selector> { height:0px; display:none; }
	 *     .growAnim { 
	 *        -webkit-animation-name: grow; -webkit-animation-duration: <duration>; -webkit-animation-timing-function: <function>;
	 *        animation-name: grow; animation-duration: <duration>; animation-timing-function: <function>;
	 *      }
	 *      @-webkit-keyframes grow { from { height: 0px; } to { height: 250px; } }
	 *      @keyframes grow { from { height: 0px; } to { height: 250px; } }
	 *   Then to cause the grow to happen, issue this call:
	 *      params.animEndCallback = function() {
     *         params.elem.style.display = 'none';	// for shrink animations only
     *         cls.remove(params.elem, params.animClassName);
	 *      };
	 *      params.elem.style.display = '';	// for grow animations only
	 *      sizeAnim(params);
	 *
	 * @param {object} params Various parameters
	 * @param {Element} params.elem Element whose properties will be animated
	 * @param {string} params.animClassName Class name to add to elem to trigger animation
	 * @param {function} [params.animEndCallback] Called when the animation is finished
	 */
	return function(params) {
		var elem = params.elem;
		var animClassName = params.animClassName;
		var animEndCallback = params.animEndCallback;
		var animEndListener = function(e) {
			elem.removeEventListener('webkitAnimationEnd', animEndListener, false);
			elem.removeEventListener('animationend', animEndListener, false);
			if (animEndCallback) {
				animEndCallback();
			}
		};
		elem.removeEventListener('webkitAnimationEnd', animEndListener, false);
		elem.removeEventListener('animationend', animEndListener, false);
		elem.addEventListener('webkitAnimationEnd', animEndListener, false);
		elem.addEventListener('animationend', animEndListener, false);
		cls.add(elem, animClassName);
	};
});