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
      // option.className = "selected";
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
    document.querySelector('#service').value = items.service === undefined ? '' : items.service;
    document.querySelector('#agentId').value = items.agentId === undefined ? '' : items.agentId;
    document.querySelector('#urls').value = items.urls === undefined ? '' : items.urls;
    // const optionsElement = createOptions(items.types);
    // elem.(optionsElement);
    let options = document.querySelectorAll('option');
    options = modifyOptions(items.types, options);
    let instance = M.FormSelect.init(elem, options);
    // elem.material_select();
    M.updateTextFields();
  })
});

document.querySelector(".save").addEventListener("click", function() {
  var elem = document.querySelector("select");
  const types = M.FormSelect.getInstance(elem).getSelectedValues();
  const service = document.querySelector("#service").value;
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
  M.toast({html: '保存成功', inDuration: 50, outDuration: 50, displayLength: 1000});
});

document.querySelector('.cancel').addEventListener("click", function () {
  window.close();
})
