export { getActiveTabId }; 

const getActiveTabId = function(){
    chrome.tabs.query({
        active: !0,
        currentWindow: !0
    }, function(tabs) {
        if (tabs[0]) {
            return tabs[0].id;
        }
    });
}