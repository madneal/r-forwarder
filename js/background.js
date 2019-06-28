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
  // urls: ["<all_urls>"]
  urls: [""]
  // urls: ["https://github.com/*"]
};


let isChecked;
let service;
let agentId;

// use to save requestBody of POST method
let requestBody = null;
let requestData = {};

function isEmpty(obj) {
  if (JSON.stringify(obj) === "{}") {
    return true;
  }
  return false;
}

chrome.storage.onChanged.addListener(function(changes) {
  console.log("The chrome storage changed!");
  // detect the changes and modify the according variable
  if (changes.hasOwnProperty("types")) {
    requestFilters.types = changes.types.newValue;
  }
  if (changes.hasOwnProperty("urls")) {
    requestFilters.urls = changes.urls.newValue;
  }
  if (changes.hasOwnProperty("service")) {
    service = changes.service.newValue;
  }
  if (changes.hasOwnProperty("agentId")) {
    agentId = changes.agentId.newValue;
  }
  chrome.webRequest.onBeforeRequest.removeListener(beforeRequestHandler);
  chrome.webRequest.onSendHeaders.removeListener(beforeSendHeaderHandler);
  chrome.webRequest.onBeforeRequest.addListener(
    details => beforeRequestHandler(details), requestFilters, ['requestBody']
  )

  chrome.webRequest.onSendHeaders.addListener(
    details => beforeSendHeaderHandler(details), requestFilters, ["requestHeaders", "extraHeaders"]
  )
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

function beforeSendHeaderHandler(details) {
  console.log(requestFilters);
  method = details.method;
  rHeaders = details.requestHeaders;
  type = details.type;
  timeStamp = details.timeStamp;
  url = details.url;
  console.log(type);
  console.dir(rHeaders);
  requestData = {
    url: url,
    headers: rHeaders,
    host: url.split("/")[2],
    method: method,
    agentId: agentId, 
    postdata: ''
  }
  if (method === 'POST') {
    requestData.postdata = requestBody;
  }
  console.log(requestData);
  // http://192.168.30.14:8888/api
  postData(service, requestData)
    .then(data => {
      const result = data;
      if (result && result.result === 'success') {
        if (result.code === 0) {
          console.log("上传成功");
        } else if (result.code === 1) {
          console.log("不支持的请求方法");
        } else if (result.code === 2) {
          console.log("处理请求失败");
        } else if (result.code === 3) {
          console.log("存入 mq 失败");
        }
      }
    }) 
}

function beforeRequestHandler(details) {
  if (isChecked && details && details.method === "POST") {
    const body = JSON.stringify(details.requestBody);
    requestBody = body;
    console.log(requestBody);
  }
}

chrome.storage.local.get(null, function(result) {
  requestFilters.types = result.types ? result.types: null;
  requestFilters.urls = result.urls ? result.urls : null;
  isChecked = result.isEnable ? result.isEnable : null;
  service = result.service ? result.service : null;
  agentId = result.agentId ? result.agentId : null;

  chrome.webRequest.onBeforeRequest.addListener(
    details => onBeforeRequestHandler(details), requestFilters, ['requestBody']
  )

  chrome.webRequest.onSendHeaders.addListener(
    details => sendHeaderHandler(details), requestFilters, ["requestHeaders", "extraHeaders"]
  )

  // chrome.webRequest.onBeforeRequest.addListener(
  //   details => {
  //     if (isChecked && details && details.method === "POST") {
  //       // const body = decodeURIComponent(String.fromCharCode.apply(null,
  //       //   new Uint8Array(details.requestBody.raw[0].bytes)));
  //       const body = JSON.stringify(details.requestBody);
  //       requestBody = body;
  //       console.log(requestBody);
  //     }
  //   }, requestFilters, ['requestBody']
  // );

  // chrome.webRequest.onSendHeaders.addListener(
  //   details => {
  //     if (isChecked && details) {
  //       console.log(requestFilters);
  //       method = details.method;
  //       rHeaders = details.requestHeaders;
  //       type = details.type;
  //       timeStamp = details.timeStamp;
  //       url = details.url;
  //       console.log(type);
  //       console.dir(rHeaders);
  //       requestData = {
  //         url: url,
  //         headers: rHeaders,
  //         host: url.split("/")[2],
  //         method: method,
  //         agentId: agentId, 
  //         postdata: ''
  //       }
  //       if (method === 'POST') {
  //         requestData.postdata = requestBody;
  //       }
  //       console.log(requestData);
  //       // http://192.168.30.14:8888/api
  //       postData(service, requestData)
  //         .then(data => {
  //           const result = data;
  //           if (result && result.result === 'success') {
  //             if (result.code === 0) {
  //               console.log("上传成功");
  //             } else if (result.code === 1) {
  //               console.log("不支持的请求方法");
  //             } else if (result.code === 2) {
  //               console.log("处理请求失败");
  //             } else if (result.code === 3) {
  //               console.log("存入 mq 失败");
  //             }
  //           }
  //         }) 
  //     }
  //   },
  //   requestFilters, ["requestHeaders", "extraHeaders"]);
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

function postData(url = "", data = {}) {
  // Default options are marked with *
  return fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    // mode: "cors", // no-cors, cors, *same-origin
    // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json"
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    // redirect: "follow", // manual, *follow, error
    // referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  }).then(response => response.json())
  .catch(err => {
    console.error(err);
  })
}

// chrome.webRequest.onBeforeSendHeaders.addListener(
//     (details) => {
//         // console.dir(details)
//         console.log('beforeSendHeaders');
//         console.dir(details.requestHeaders);
//         // fetch('http://127.0.0.1')
//     },
//     { urls: ["<all_urls>"] }, ['requestHeaders', 'blocking', 'extraHeaders']);


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
