var startedPlay = false;
var settedRate;
var player = document.getElementsByTagName('audio')[0];
var $skip = function() {
	var skip = document.getElementsByTagName('skip');
	if (skip.length > 0) {
		skip = skip[0];
		var btn = skip.getElementsByTagName('button');
		if (btn.length > 0) {
			btn[0].click();
		}
	}
};
var $pp = function() {
	var toggle = document.getElementsByTagName('toggle-play');
	if (toggle.length > 0) {
		toggle = toggle[0];
		var btn = toggle.getElementsByTagName('button');
		if (btn.length > 0) {
			btn[0].click();
		}
	}
};

var setPlaybackRate = function(rate) {
	console.log("setting rate : " + rate);
	if (rate) {
		settedRate = rate;
		player.playbackRate = rate;
	}
	else if (settedRate) {
		player.playbackRate = settedRate
	}
};

var onNewTrack = function() {
	// autoplay, with UI
	if (!startedPlay) {
		startedPlay = true;
		$pp();
	}
	// make sure we didn't unset the playback rate
	setPlaybackRate();
	
	// notification builder
	var story = document.getElementsByTagName('article');
	if (story.length > 0) {
		story = story[0];
		var title = story.getElementsByClassName('card__title');
		title = title.length > 0 ? title[0].innerText : null;
		console.log(title);
		if (!title || title.indexOf("our sponsor") != -1) {return;}
		var img = story.getElementsByTagName('img');
		img = img.length > 0 ? img[0].src : null;
		console.log(img);
		// story.getElementsByTagName('time')
		var slug = story.getElementsByClassName('card__slug');
		slug = slug.length > 0 ? slug[0].innerText : null;
		var metas = story.getElementsByClassName('card__meta');
		var message = slug ? slug : "";
		for (let m of metas) {
			var text = m.innerText.replace(/\s+/g,' ').trim();
			if (text) {
				if (message.length > 0) { message += " • " }
				message += text;
			}
		}

		var options = {
		  "type": "basic",
		  "title": title || message,
		  "message": message || title,
		};
		
		if (img && img.indexOf("img/fallbacks") == -1) {
			options.type = "image";
			options.imageUrl = img;
		}
		
		var reader = document.getElementsByTagName('read-button');
		var story_url;
		if (reader.length > 0) {
			reader = reader[0];
			var link = reader.getElementsByTagName('a');
			if (link.length > 0) {
				story_url = link[0].href;
			}
		}
		
		chrome.runtime.sendMessage({"action":"notification", "options": options, "story_url": story_url});
	}
};

chrome.storage.sync.get({'speed': 1}, function(items) {setPlaybackRate(items.speed) });

player.onloadeddata = onNewTrack;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "speed") {
		setPlaybackRate(request.speed);
	}
	else if (request.action == "playpause") {
		$pp();
	}
	else if (request.action == "skip") {
		$skip();
	}
});

player.onplay = function() { chrome.runtime.sendMessage({"action":"onplay"}) };
player.onpause = function() { chrome.runtime.sendMessage({"action":"onpause"}) };
