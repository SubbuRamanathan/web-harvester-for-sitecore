export { composeCreateAPIRequest }; 

import { getPageName } from "./url.js";

const composeCreateAPIRequest = function(url, document, mappingSection){
    var itemInfo = getBasicItemInfo(url, mappingSection);
    itemInfo = addFieldInfo(itemInfo, document);
    var importDetails = { Destination: getDestinationLocation(url), ItemInfo: itemInfo };
    return importDetails;
}

const getDestinationLocation = function(url){
    var destinationItemPath = $('.target-selector').val().replace('$name', getSanitizedPageName(url));
    destinationItemPath = destinationItemPath.substring(1);
    return encodeURIComponent(destinationItemPath);
}

const getBasicItemInfo = function(url, mappingSection){
    return {
        ItemName: getSanitizedPageName(url),
        TemplateID: mappingSection.find('.template-selector').attr('data')
    }
}

const getSanitizedPageName = function(url){
    return getPageName(url).replace(/ |%20/g, '-');
}

const addFieldInfo = function(itemInfo, document){
    $('.destination-field-map').each(function(){
        var fieldName = $(this).find('.field-select').val();
        var fieldType = $(this).find('.field-select :selected').data('type');
        if(fieldName && fieldName != ''){
            var fieldValue = getContent(document, $(this).find('.dom-path').val(), fieldType, getReplaceOptions($(this)));
            itemInfo[fieldName] = fieldValue;
        }
    });
    return itemInfo;
}

const getContent = function(document, xpathInfo, fieldType, replaceOptions){
    var contents = []; 
    xpathInfo.split(' || ').forEach(function(xpath){
        var xpathContent = getXPathContent(document, fieldType, xpath);
        contents.push(processReplaceOptions(xpathContent, replaceOptions));
    });
    return contents.join('|');
}

const getXPathContent = function(document, fieldType, xpath){
    var domElement = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
    return domElement.innerHTML;
}

const getReplaceOptions = function(fieldMap){
    return fieldMap.find('.replace-options').val().trim();
}

const processReplaceOptions = function(content, replaceOptionsString){
    if(replaceOptionsString != ''){
        var replaceOptions = JSON.parse(replaceOptionsString);
        replaceOptions.forEach(function(replaceOption){
            var pattern = new RegExp(replaceOption.find);
            content = content.replace(pattern, replaceOption.replace);
        });
    }
    return content;
}