export { importContent, scrapeAndImport }; 

import { invokeCreateItemAPI } from "./itemservice.js";
import { composeCreateAPIRequest } from "./compose.js";
import { fetchHTMLDocument } from "./url.js";

const importContent = function(){
    var importForm = $('#importForm').data('bootstrapValidator');
    importForm.validate();
    if(importForm.isValid()){
        var websiteUrls = getWebsiteUrls();
        websiteUrls.forEach(url => {
            scrapeAndImport(url);
        });
    }
}

const getWebsiteUrls = function(){
    return $('#webpageUrls').val().split(';');
}

const scrapeAndImport = function(url) {
    var document = fetchHTMLDocument(url);
    $('.destination-group-map').each(function(){
        var requestInfo = composeCreateAPIRequest(url, document, $(this));
        var response = invokeCreateItemAPI(requestInfo.Destination, requestInfo.ItemInfo);
        console.log(response);
    });
}
