const options = [
  "main_frame",
  "sub_frame",
  "stylesheet",
  "script",
  "image",
  "font",
  "object",
  "xmlhttprequest",
  "ping",
  "csp_report",
  "media",
  "websocket",
  "other"
];

function createOptions(data) {
  let optionsEle = [];
  for (const index in options) {
    let option = document.createElement('option');
    option.value = options[index];
    option.text = options[index];
    if (options[index] in data) {
      option.setAttribute('selected');
    }
    optionsEle.push(option);
  }
  return optionsEle;
}

function modifyOptions(data, options) {
  let result = [];
  if (!data) {
    data = ["main_frame", "sub_frame", "xmlhttprequest"];
  }
  for (const key in options) {
    const option = options[key];
    if (data && data.includes(option.value)) {
      option.setAttribute('selected', '');
    }
    result.push(option);
  }
  return result;
}

document.addEventListener("DOMContentLoaded", function() {
  var elem = document.querySelector("select");
  chrome.storage.local.get(null, function (items) {
    if (items !== null & items !== undefined) {
      const labels = document.querySelectorAll('label');
      for (const index in labels) {
        labels[index].className += 'active';
      }
    }
    document.querySelector('#service').value = items.service === undefined ? "http://hydra.qa.pab.com.cn/api" : items.service;
    document.querySelector('#agentId').value = items.agentId === undefined ? '' : items.agentId;
    document.querySelector('#urls').value = items.urls === undefined ? '' : items.urls;

    let options = document.querySelectorAll('option');
    options = modifyOptions(items.types, options);
    let instance = M.FormSelect.init(elem, options);
    M.updateTextFields();  
  })
});

document.querySelector(".save").addEventListener("click", function() {
  var elem = document.querySelector("select");
  const types = M.FormSelect.getInstance(elem).getSelectedValues();
  let service = document.querySelector("#service").value;
  const agentId = document.querySelector("#agentId").value;
  let urls = document.querySelector('#urls').value;
  urls = urls.split(';');
  urlArr = [];
  urls = urls.forEach((ele) => {
    if (ele) {
      urlArr.push(ele);
    }
  }) 
  const data = {
    service: service,
    agentId: agentId,
    types: types,
    urls: urlArr
  };

  // save config to chrome storage
  chrome.storage.local.set(data);

  let body = '{"um":"' + agentId + '"}'
  
  service = service.replace("api", "saveOptions");

fetch(service, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body) 
  }).then(response => {
    if (response.ok) {
      return response.text()
    }
}).then(resTxt => {
    let result;
    if (isJson(resTxt)) {
      result = JSON.parse(resTxt);
    } else {
      console.error(resTxt);
      console.error("There is error for request for " + service);
    }
    M.toast({html: result.reason, inDuration: 100, outDuration: 100, displayLength: 2000});
})
.catch(err => {
      console.error(err);
})


  // let message = "保存成功";
  // if (!/[a-zA-Z]+\d+/.test(agentId)) {
  //   message = "保存失败，agentId 请填写 UM 号!!"
  // }
  // M.toast({html: message, inDuration: 100, outDuration: 100, displayLength: 2000});
});

document.querySelector('.cancel').addEventListener("click", function () {
  window.close();
})

// judge if the str is a valid JSON string
function isJson(str) {
  if (typeof str === "string") {
    try {
      const obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch(e) {
      return false;
    }
  }
  return false;
}
