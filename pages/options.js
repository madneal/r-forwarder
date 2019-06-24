export function addConfig(key, value) {
    chrome.storage.local.set({key: value}, function() {
        
    })
}

export function getConfig(key) {
    
}