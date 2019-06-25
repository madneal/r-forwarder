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

chrome.storage.local.get("types", function(result) {
  requestFilters["types"] = result.types;
  chrome.webRequest.onSendHeaders.addListener(
    details => {
      // method = details.method;
      console.log("filters");
      console.dir(requestFilters.types);
      rHeaders = details.requestHeaders;
      console.log("sendHeaders");
      console.dir(rHeaders);
      type = details.type;
      console.log(type);
      // timeStamp = details.timeStamp;
      // url = details.url;
      console.dir(details);
    },
    requestFilters,
    ["requestHeaders", "extraHeaders"]
  );
});

function setIcon(config) {
  if (config["control"] === BadgeText.OFF) {
  }
}

function setBadgeAndBackgroundColor(text, color) {
  chrome.browserAction.setBadgeText({
    text: text
  });
  chrome.browserAction.setBackgroundColor({
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
