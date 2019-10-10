/**
 * Youtube video player logic. Adapted from:
 * https://developers.google.com/youtube/iframe_api_reference
 */
define([
	'./cls'
], function(
	cls
) {

	return function() {

		// 2. This code loads the YouTube IFrame Player API code asynchronously.
		if (!window.BrandingPays.youtube) {
			window.BrandingPays.youtube = {};
		}
		window.BrandingPays.youtube.ready = false;
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		window.onYouTubeIframeAPIReady = function() {
			window.BrandingPays.youtube.ready = true;
		}
		// 4. The API will call this function when the video player is ready.
		window.onPlayerReady = function(event) {
			event.target.playVideo();
		}

		// 5. The API calls this function when the player's state changes.
		//    The function indicates that when playing a video (state=1),
		//    the player should play for six seconds and then stop.
		window.onPlayerStateChange = function(event) {
			// BUFFERING: 3, CUED: 5, ENDED: 0, PAUSED: 2, PLAYING: 1, UNSTARTED: -1
/*FIXME: this makes no sense!
			if (event.data == YT.PlayerState.PLAYING && !window.BrandingPays.youtube.player) {
				setTimeout(window.stopVideo, 6000);
			}
*/
			if (event.data == YT.PlayerState.ENDED) {
				window.stopVideo();
				if (window.BrandingPays.youtube.onEndCallback) {
					window.BrandingPays.youtube.onEndCallback();
				}
			}
			if (event.data == YT.PlayerState.PLAYING) {
				if (window.BrandingPays.youtube.onPlayingCallback) {
					window.BrandingPays.youtube.onPlayingCallback();
				}
			}
			if (event.data == YT.PlayerState.PAUSED) {
				if (window.BrandingPays.youtube.onPauseCallback) {
					window.BrandingPays.youtube.onPauseCallback();
				}
			}
		}
		window.stopVideo = function() {
			if (window.BrandingPays.youtube.player) {
				window.BrandingPays.youtube.player.stopVideo();
				delete window.BrandingPays.youtube.player;
				if (window.BrandingPays.youtube.onStopVideoCallback) {
					window.BrandingPays.youtube.onStopVideoCallback();
				}
			}
		}
	};
});
