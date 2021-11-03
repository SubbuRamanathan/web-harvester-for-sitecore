export { importMedia }; 

import { getSanitizedPageName } from "./compose.js";
import { isImportAborted } from "./import.js";
import { addMediaItemImportedLog, addErrorLog } from "./log.js";
import { getCredentials } from "./settings.js";
import { extractItemId, getSitecoreOrigin } from "./url.js";

const speWebApiPath = '/-/script/v2/master/ImportMedia';

const importMedia = function(mediaUrl, mediaPath){
    if(!isImportAborted()){
        try{
            if(mediaUrl == '')
                throw 'Unable to find a media url to import from the specified xpath';

            let mediaImportApiUrl = `${getSitecoreOrigin()}${speWebApiPath}?mediaUrl=${encodeURIComponent(mediaUrl)}&mediaPath=${mediaPath ?? ''}`;
            let createdMediaItemId = invokeSPEWebApi(mediaImportApiUrl);
            addMediaItemImportedLog(getSanitizedPageName(mediaUrl), createdMediaItemId);
            return createdMediaItemId;
        }
        catch(error){
            addErrorLog(error, mediaUrl);
        }
    }
}

const getBasicAuthHeader = function(request){
    let credentials = getCredentials();
    if(credentials){
        let base64EncodedCredentials = btoa(credentials);
        request.setRequestHeader("Authorization", `Basic ${base64EncodedCredentials}`);
    }
}

const invokeSPEWebApi = function(mediaImportApiUrl){
    var importedMediaItemId = '';
    var response = $.ajax({ url: mediaImportApiUrl, async: false, beforeSend: function(request) { getBasicAuthHeader(request)}})
        .done(function (response){ 
            importedMediaItemId = extractItemId(response);
            if(!importedMediaItemId)
                throw response;
        });
    if(response.status == 401)
        throw 'Unable to create Media Item in Sitecore. Please update Sitecore credentials in Settings tab and try again.'
    return importedMediaItemId;
}