export { composeCreateAPIRequest, getSanitizedPageName }; 

import { addWarningLog } from "./log.js";
import { importMedia } from "./media.js";
import { getSettings } from "./settings.js";
import { getOrigin, getPageName, isRelativeUrl } from "./url.js";

const mediaReplaceToken = '$uploadedMediaId'
const composeCreateAPIRequest = function(url, document, mappingSection){
    let itemPath = getItemPath(url, mappingSection.contentPath);
    let itemName = getItemName(itemPath);
    let itemInfo = getBasicItemInfo(itemName, mappingSection);
    itemInfo = addFieldInfo(url, itemInfo, document, mappingSection);
    let importDetails = { ParentPath: getParentPath(itemPath), ItemPath: encodeURIComponent(itemPath), ItemInfo: itemInfo };
    return importDetails;
}

const getItemPath = function(url, contentPath){
    return contentPath.replace('$name', getSanitizedPageName(url)).substring(1);
}

const getItemName = function(itemPath){
    return itemPath.split('/').pop();
}

const getParentPath = function(itemPath){
    let ancestors = itemPath.split('/');
    ancestors.pop();
    return ancestors.join('/');
}

const getBasicItemInfo = function(itemName, mappingSection){
    return {
        ItemName: itemName,
        TemplateID: mappingSection.templateId
    }
}

const getSanitizedPageName = function(url){
    let settings = getSettings();
    let findRegexPattern = new RegExp(settings.itemNameFindText);
    return getPageName(url).replace(findRegexPattern, settings.itemNameReplaceText);
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
    if(!domElement) {
        addWarningLog(`XPath(${xpath}) not found in ${url}`);
        return '';
    }
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