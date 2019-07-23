let requestFilters = {
  urls: ["<all_urls>"],
  types: ["main_frame", "sub_frame", "object", "xmlhttprequest", "csp_report", "other"]
};


let isChecked;
let service;
let agentId;

// use to save requestBody of POST method
let requestBody = null;
let requestData = {};

// judge if object is empty
function isEmpty(obj) {
  if (JSON.stringify(obj) === "{}") {
    return true;
  }
  return false;
}

// change requestFilter when chrome storage changes
chrome.storage.onChanged.addListener(function (changes) {
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

  if (changes.hasOwnProperty("types") || changes.hasOwnProperty("urls")) {
    if (chrome.webRequest.onBeforeRequest.hasListener(beforeRequestHandler)) {
      chrome.webRequest.onSendHeaders.removeListener(beforeSendHeaderHandler);
    }
    if (chrome.webRequest.onBeforeRequest.hasListener(beforeRequestHandler)) {
      chrome.webRequest.onBeforeRequest.removeListener(beforeRequestHandler);
    }
  
    chrome.webRequest.onBeforeRequest.addListener(
      beforeRequestHandler, requestFilters, ['requestBody']
    )
    chrome.webRequest.onSendHeaders.addListener(
      beforeSendHeaderHandler, requestFilters, ["requestHeaders", "extraHeaders"]
    )
  }
})

//browserAction to control ON and OFF
chrome.browserAction.onClicked.addListener(function () {
  let checked = true;

  chrome.storage.local.get(null, function (data) {
    if (isEmpty(data)) {
      chrome.storage.local.set({ isEnable: true });
      isChecked = true;
      chrome.runtime.openOptionsPage();
    } else {
      checked = !data.isEnable;
      chrome.storage.local.set({ isEnable: checked });
    }
    isChecked = checked;
    setIcon(checked);
  });
});

// judge if the two urls has the common host
function isCommonHost(url, url1) {
  const urlA = new URL(url);
  const urlB = new URL(url1);
  return urlA.host === urlB.host
}

// onBeforeHandler listener
function beforeSendHeaderHandler(details) {
  if (isChecked === undefined) {
    chrome.storage.local.get("isEnable", result => {
      isChecked = result.isEnable;
    })
  }
  if (isChecked === false) {
    return
  }
  // ignore the request to the service
  if (details.url && service && isCommonHost(details.url, service)) {
    return
  }
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
  if (service === undefined) {
    chrome.storage.local.get("service", result => {
      service = result.service;
    })
  }
  fetch(service, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestData) 
  }).then(response => {
    if (response && response.text()) {
      const result = JSON.parse(response.text());
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
  }}).catch(err => {
      console.error(err);
    })
}

function beforeRequestHandler(details) {
  if (isChecked === undefined) {
    chrome.storage.local.get("isEnable", result => {
      isChecked = result.isEnable;
    })
  }
  if (isChecked && details && details.method === "POST" && details.url != service) {
    const body = JSON.stringify(details.requestBody);
    requestBody = body;
    console.log(requestBody);
  }
}

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
