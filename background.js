chrome.runtime.onInstalled.addListener(function() {
  console.log("Installed.");

  // localStorage is persisted, so it's a good place to keep state that you
  // need to persist across page reloads.
  localStorage.counter = 1;
  
});

chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.setAlarm) {
    // For testing only.  delayInMinutes will be rounded up to at least 1 in a
    // packed or released extension.
    chrome.alarms.create({delayInMinutes: 0.1});
  } else if (msg.delayedResponse) {
    // Note: setTimeout itself does NOT keep the page awake. We return true
    // from the onMessage event handler, which keeps the message channel open -
    // in turn keeping the event page awake - until we call sendResponse.
    setTimeout(function() {
      sendResponse("Got your message.");
    }, 5000);
    return true;
  } else if (msg.getCounters) {
    sendResponse({counter: counter++,
                  persistentCounter: localStorage.counter++});
  }
  // If we don't return anything, the message channel will close, regardless
  // of whether we called sendResponse.
});

chrome.alarms.onAlarm.addListener(function() {
  console.log("Time's up!");
});

chrome.runtime.onSuspend.addListener(function() {
  console.log("Unloading.");
});

chrome.alarms.create({delayInMinutes: 0.1});
