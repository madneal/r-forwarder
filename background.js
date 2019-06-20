chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        console.dir(details)
        fetch('http://127.0.0.1')
    },
    { urls: ["<all_urls>"] }, ['requestHeaders', 'blocking', 'extraHeaders']);
