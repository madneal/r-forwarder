// chrome.webRequest.onBeforeSendHeaders.addListener(
//     (details) => {
//         console.dir(details)
//         fetch('http://127.0.0.1')
//     },
//     { urls: ["<all_urls>"] }, ['requestHeaders', 'blocking', 'extraHeaders']);

chrome.webRequest.onCompleted.addListener(
    (details) => {
        console.dir(details)
        fetch('http://127.0.0.1')
    }, { urls: ["<all_urls>"] });

function setListeners() {
    chrome.webRequest.onBeforeSendHeaders.addListener(requestHandler,
        { urls: ["<all_urls>"] },
        ["requestHeaders"]);
    chrome.webRequest.onBeforeRequest.addListener(requestHandler,
        { urls: ["<all_urls>"] },
        ['requestBody']);
    chrome.webRequest.onCompleted.addListener(requestHandler,
        { urls: ["<all_urls>"] });
}