export { sendRunTimeMessage }; 

const sendRunTimeMessage = function(message) {
    chrome.tabs.query({
        active: !0,
        currentWindow: !0
    }, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, message)
        }
    })
}