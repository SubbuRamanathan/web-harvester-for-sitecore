export { saveForm }; 

const saveForm = () => {
    var id = getMappingId();
    
    chrome.storage.sync.set({[id]: getMapping()}, function() {
        console.log('Stored Mapping in Chrome Storage');
    });
}

const getMappingId = function(){
    chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        return Math.max(allKeys) + 1;
    });
}

const getMapping = function(){
    return {
        "webpageUrls": $('#webpageUrls').val(),
        "sitecoreUrl": $('#sitecoreUrl').val()
    };
}