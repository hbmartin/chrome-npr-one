var player = document.getElementsByTagName('audio')[0];
var setPlaybackRate = function() {
	var savedRate = localStorage['playbackRate'];
	console.log("setting rate : " + savedRate);
	savedRate && ((player.playbackRate = savedRate));
};
setPlaybackRate();
player.autoplay="true";
try { player.play() } catch (e) { console.log(e) };
player.onloadeddata = setPlaybackRate;

