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

document.addEventListener("DOMContentLoaded", function() {
  var elems = document.querySelector("select");
  var instances = M.FormSelect.init(elems, options);
});

document.querySelector(".save").addEventListener("click", function() {
  var elem = document.querySelector("select");
  const types = M.FormSelect.getInstance(elem).getSelectedValues();
  const service = document.querySelector("#service").value;
  const agentId = document.querySelector("#agentId").value;
  const data = {
    service: service,
    agentId: agentId,
    types: types
  };

  // save config to chrome storage
  chrome.storage.local.set(data);
});
