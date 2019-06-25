// All resource types
// "main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object",
//"xmlhttprequest", "ping", "csp_report", "media", "websocket", or "other"
const resourceTypes = [
  "main_frame",
  "sub_frame",
  "object",
  "xmlhttprequest",
  "ping",
  "csp_report",
  "media",
  "websocket",
  "other"
];
let requestFilters = {
  urls: ["<all_urls>"],
  types: ["main_frame"]
};

// chrome.browserAction.onClicked.addListener(function(tab) {

// });

chrome.browserAction.onClicked.addListener(function() {
  let checked = true;
  chrome.storage.local.get("isEnable", function(data) {
    if (data === null || data === undefined) {
      chrome.storage.local.set({ isEnable: true });
    } else {
      checked = !data.isEnable;
      chrome.storage.local.set({ isEnable: checked });
    }
    setIcon(checked);
  });
});

chrome.storage.local.get(null, function(result) {
  requestFilters["types"] = result.types;

  chrome.webRequest.onSendHeaders.addListener(
    details => {
      method = details.method;
      rHeaders = details.requestHeaders;
      type = details.type;
      timeStamp = details.timeStamp;
      url = details.url;
    },
    requestFilters,
    ["requestHeaders", "extraHeaders"]
  );
});

function setIcon(isEnable) {
  if (isEnable) {
    setBadgeAndBackgroundColor("ON", "#aad");
  } else {
    setBadgeAndBackgroundColor("OFF", "#aaa");
  }
}

function setBadgeAndBackgroundColor(text, color) {
  chrome.browserAction.setBadgeText({
    text: text
  });

  chrome.browserAction.setBadgeBackgroundColor({
    color: color
  });
}

// chrome.webRequest.onBeforeSendHeaders.addListener(
//     (details) => {
//         // console.dir(details)
//         console.log('beforeSendHeaders');
//         console.dir(details.requestHeaders);
//         // fetch('http://127.0.0.1')
//     },
//     { urls: ["<all_urls>"] }, ['requestHeaders', 'blocking', 'extraHeaders']);

// chrome.webRequest.onCompleted.addListener(
//     (details) => {
//         console.dir(details)
//         fetch('http://127.0.0.1')
//     }, { urls: ["<all_urls>"] });

// function setListeners() {
//     chrome.webRequest.onBeforeSendHeaders.addListener(requestHandler,
//         { urls: ["<all_urls>"] },
//         ["requestHeaders"]);
//     chrome.webRequest.onBeforeRequest.addListener(requestHandler,
//         { urls: ["<all_urls>"] },
//         ['requestBody']);
//     chrome.webRequest.onCompleted.addListener(requestHandler,
//         { urls: ["<all_urls>"] });
// }
