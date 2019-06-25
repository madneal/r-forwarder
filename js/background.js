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
  urls: ["<all_urls>"]
};
let isChecked;
let requestBody;

function isEmpty(obj) {
  if (JSON.stringify(obj) === "{}") {
    return true;
  }
  return false;
}

chrome.storage.onChanged.addListener(function(changes) {
  const types = changes.types;
  requestFilters.types = types;
  console.log("chrome storage has changed;")
  console.log(types);
})


chrome.browserAction.onClicked.addListener(function() {
  let checked = true;

  chrome.storage.local.get(null, function(data) {
    if (isEmpty(data)) {
      chrome.storage.local.set({ isEnable: true });
      isChecked = true;
      // chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
      chrome.runtime.openOptionsPage();
    } else {
      checked = !data.isEnable;
      chrome.storage.local.set({ isEnable: checked });
    }
    isChecked = checked;
    setIcon(checked);
  });
});

chrome.storage.local.get("types", function(result) {
  requestFilters["types"] = result.types;

  chrome.webRequest.onBeforeRequest.addListener(
    details => {
      if (isChecked && details.method === "POST") {
        requestBody = details.requestBody;
      }
    }, { urls: ["<all_urls>"] }, ['requestBody']
  );

  chrome.webRequest.onSendHeaders.addListener(
    details => {
      if (isChecked) {
        console.log(requestFilters);
        method = details.method;
        rHeaders = details.requestHeaders;
        type = details.type;
        timeStamp = details.timeStamp;
        url = details.url;
        console.log(type);
        console.dir(rHeaders);
        const data = {
          url: url,
          headers: rHeaders,
          host: url.split("/")[2],
          method: method,
          postdata: ''
        };
        if (method === 'POST') {
          data.postdata = requestBody;
        }
        console.dir(data);
      }
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
