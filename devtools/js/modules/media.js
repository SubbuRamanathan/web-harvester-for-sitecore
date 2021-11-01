export { importMedia }; 

import { getCredentials } from "./settings.js";
import { getSitecoreOrigin } from "./url.js";

const speWebApiPath = '/-/script/v2/master/ImportMedia';
const guidPattern = '(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}';

const importMedia = function(mediaUrl, mediaPath){
    let mediaImportApiUrl = `${getSitecoreOrigin()}${speWebApiPath}?mediaUrl=${encodeURIComponent(mediaUrl)}&mediaPath=${mediaPath ?? ''}`;
    return invokeSPEWebApi(mediaImportApiUrl);
}

const getBasicAuthHeader = function(request){
    var credentials = getCredentials();
    if(credentials){
        let base64EncodedCredentials = btoa(credentials);
        request.setRequestHeader("Authorization", `Basic ${base64EncodedCredentials}`);
    }
}

const invokeSPEWebApi = function(mediaImportApiUrl){
    var importedMediaItemId = '';
    $.ajax({ url: mediaImportApiUrl, async: false, beforeSend: function(request) { getBasicAuthHeader(request)}})
        .done(function (response){ 
            var regexMatches = response.match(new RegExp(guidPattern, 'ig'));
            if(regexMatches)
                importedMediaItemId = regexMatches[0];
        });
    return importedMediaItemId;
}
