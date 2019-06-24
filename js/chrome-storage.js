export function saveConfig(config) {
    for (const key in config) {
        chrome.storage.local.set({key: config[key]});
    }
}

export function getConfig(key) {
    return chrome.storage.local.get(key);
}