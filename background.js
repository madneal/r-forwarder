chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        console.dir(details)
    },
    { urls: ["<all_urls>"] }, ['requestHeaders', 'blocking', 'extraHeaders']);
