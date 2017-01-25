const NPR = "*://one.npr.org/*";
var story_url = "";
const colors = ["#181818", "#393939", "#326AC9", "#84AFEA", "#FA381C", "#D11F15"];
var didFirstRun = false;
function genericOnClick(info, tab) {
	var speed = parseFloat(info.menuItemId.split('-')[2]);
	chrome.storage.sync.set({'speed': speed});
	runOnNprTab(function(tabId){ chrome.tabs.sendMessage(tabId, {"action": "speed", "speed": speed}) });
}

var speeds = [0.75, 1.00, 1.25, 1.50, 1.75, 2.00];
chrome.storage.sync.get({'speed': 1}, function(items) {
	console.log(items.speed);
	for (let s of speeds) {
	  chrome.contextMenus.create({"title": (s.toFixed(2) + "×"), "id": "npr-playback-"+s, "checked": s==items.speed, "type":"radio", "contexts":["page","selection","browser_action","page_action"], "onclick": genericOnClick, "documentUrlPatterns":[NPR]});
	}
});

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.browserAction.setIcon({"path":"img/favicon-32x32.png"});

	if (tab.url.indexOf("one.npr.org") != -1 && !didFirstRun) {
		didFirstRun = true;
		alert("Right click on the toolbar icon or NPR page to set playback speed");
	} 

	runOnNprTab(function(tabId){ 
		if (tabId) {
			chrome.tabs.sendMessage(tabId, {"action": "playpause"});
		} else {
			chrome.tabs.create({"pinned": true, "url" : "http://one.npr.org/"});
		}
	});
});

var runOnNprTab = function(callback) {
	chrome.tabs.query({"url":NPR}, function(tabs){
		if (tabs && tabs.length > 0) {
			callback(tabs[0].id);
		} else {
			callback(null);
		}
	});
};

chrome.runtime.onInstalled.addListener(function() {
	if (!localStorage.installed) {
		// persisted to avoid extension update or Chrome update cases
		localStorage.installed = true;
		alert("Click on the toolbar icon to launch NPR one player and play / pause. Right click on the toolbar icon or NPR page to set playback speed.");
	}
  
});

chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
	if (msg.action == "notification") {
		msg.options.iconUrl = "img/favicon-192x192-padded.png";
		msg.options.buttons = [{"title":"Next ▶▶"}];
		if (msg.story_url) {
			story_url = msg.story_url;
			msg.options.buttons.push({"title":"Read Story"})
		} else {
			story_url = null;
		}
		chrome.notifications.create("npr-one", msg.options);
	}
	else if (msg.action == "onplay") {
		chrome.browserAction.setIcon({"path":"img/favicon-32x32-pause.png"});
	}
	else if (msg.action == "onpause") {
		chrome.browserAction.setIcon({"path":"img/favicon-32x32-play.png"});
	}
});

chrome.notifications.onClicked.addListener(function() {
	runOnNprTab(function(tabId){
		if (tabId) {
			chrome.tabs.get(tabId, function (tab){ chrome.windows.update(tab.windowId, {focused: true}) });
			chrome.tabs.update(tabId, {selected: true});
		}
	});
	chrome.notifications.clear('npr-one');
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
	if (buttonIndex == 0) {
		runOnNprTab(tabId => chrome.tabs.sendMessage(tabId, {"action": "skip"}) );
	} else if (buttonIndex == 1) {
		chrome.tabs.create({"url" : story_url});
	}
	chrome.notifications.clear('npr-one');
});

chrome.alarms.onAlarm.addListener(function() {
  console.log("Time's up!");
});

chrome.runtime.onSuspend.addListener(function() {
  console.log("Unloading.");
});

// chrome.alarms.create({delayInMinutes: 0.1});
