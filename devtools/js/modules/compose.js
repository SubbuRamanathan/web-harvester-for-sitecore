export { composeCreateAPIRequest, getSanitizedPageName }; 

import { importMedia } from "./media.js";
import { getOrigin, getPageName, isRelativeUrl } from "./url.js";

const mediaReplaceToken = '$uploadedMediaId'
const composeCreateAPIRequest = function(url, document, mappingSection){
    var itemInfo = getBasicItemInfo(url, mappingSection);
    itemInfo = addFieldInfo(url, itemInfo, document, mappingSection);
    var importDetails = { Destination: getDestinationLocation(url, mappingSection), ItemInfo: itemInfo };
    return importDetails;
}

const getDestinationLocation = function(url, mappingSection){
    var destinationItemPath = mappingSection.contentPath.replace('$name', getSanitizedPageName(url));
    destinationItemPath = destinationItemPath.substring(1);
    return encodeURIComponent(destinationItemPath);
}

const getBasicItemInfo = function(url, mappingSection){
    return {
        ItemName: getSanitizedPageName(url),
        TemplateID: mappingSection.templateId
    }
}

const getSanitizedPageName = function(url){
    return getPageName(url).replace(/ |%20/g, '-');
}

const addFieldInfo = function(url, itemInfo, document, mappingSection){
    var mediaPath = mappingSection.mediaPath;
    mappingSection.mappings.forEach(function(mapping){
        var fieldName = mapping.field;
        if(fieldName && fieldName != ''){
            var fieldValue = getContent(url, document, mediaPath, mapping.domPath, mapping.replaceOptions);
            itemInfo[fieldName] = fieldValue;
        }
    });
    return itemInfo;
}

const getContent = function(url, document, mediaPath, xpathInfo, replaceOptions){
    var contents = []; 
    xpathInfo.split(' || ').forEach(function(xpath){
        var xpathContent = getXPathContent(url, document, xpath);
        contents.push(processReplaceOptions(xpathContent, mediaPath, replaceOptions));
    });
    return contents.join('|');
}

const getXPathContent = function(url, document, xpath){
    var domElement = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
    return domElement.innerHTML ?? ensureAbsoluteUrl(domElement.value, url);
}

const processReplaceOptions = function(originalContent, mediaPath, replaceOptionsString){
    let processedContent = originalContent;
    if(replaceOptionsString != ''){
        var replaceOptions = JSON.parse(replaceOptionsString);
        replaceOptions.forEach(function(replaceOption){
            var findPattern = new RegExp(replaceOption.find);
            var replaceText = replaceOption.replace;
            processedContent = processedContent.replace(findPattern, replaceText);
            if(processedContent.indexOf(mediaReplaceToken) != -1)
                processedContent = processedContent.replace(mediaReplaceToken, importMedia(originalContent, mediaPath));
        });
    }
    return processedContent;
}

const ensureAbsoluteUrl = function(currentUrl, websiteUrl){
    if(isRelativeUrl(currentUrl))
        return `${getOrigin(websiteUrl)}${currentUrl}`;
    return currentUrl;    
}