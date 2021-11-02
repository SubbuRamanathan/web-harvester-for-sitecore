export { invokeReadItemServiceAPI, invokeGetItemAPI, invokeGetChildrenAPI, getAllGrandChildren, getItemId, invokeCreateItemAPI }; 

import { getContentLanguage } from "./settings.js";
import { extractItemId, getSitecoreUrl } from "./url.js";

const invokeGetItemAPI = function(itemid){
    var itemServiceAPIUrl = `${getSitecoreUrl()}/api/ssc/item/${itemid}?database=master&language=${getContentLanguage()}&fields=ItemID,ItemName,ItemPath,ItemIcon`;
    return invokeReadItemServiceAPI(itemServiceAPIUrl);
}

const invokeGetChildrenAPI = function(itemid){
    var itemServiceAPIUrl = `${getSitecoreUrl()}/api/ssc/item/${itemid}/children?database=master&language=${getContentLanguage()}&fields=ItemID,ItemName,ItemPath,ItemIcon,TemplateName,Type`;
    return invokeReadItemServiceAPI(itemServiceAPIUrl);
}

const getAllGrandChildren = function(itemid, templateName){
    var childItems = invokeGetChildrenAPI(itemid);
    var grandChildren = [];
    childItems?.forEach(function(item) {
        var childItems = invokeGetChildrenAPI(item.ItemID);
        var filteredChildItems = childItems.filter(function(item) { return item.TemplateName.toLowerCase() == templateName.toLowerCase() });
        grandChildren = grandChildren.concat(filteredChildItems);
    });
    return grandChildren;
}

const invokeReadItemServiceAPI = function(itemServiceAPIUrl){
    var itemInfo;
    $.ajax({ url: itemServiceAPIUrl, async: false }).done(function (response){ itemInfo = response });
    return itemInfo;
}

const invokeCreateItemAPI = function(itempath, data){
    var itemServiceAPIUrl = `${getSitecoreUrl()}/api/ssc/item/${itempath}?database=master&language=${getContentLanguage()}`;
    var response = invokeWriteItemServiceAPI(itemServiceAPIUrl, data);
    let createdItemId = extractItemId(response.getResponseHeader('location'));
    if(!createdItemId)
        throw 'Unable to create item in Sitecore';
    return createdItemId;
}

const invokeWriteItemServiceAPI = function(itemServiceAPIUrl, data){
    var formattedData = JSON.stringify(data);
    var response = $.ajax({ url: itemServiceAPIUrl, type: 'POST', contentType: "application/json", data: formattedData, async: false })
        .done(function (response){ return response });
    return response;
}

const getItemId = function(itemPath){
    var itemServiceAPIUrl = `${getSitecoreUrl()}/api/ssc/item/?path=${itemPath}&database=master&language=${getContentLanguage()}&fields=ItemID`;
    var itemInfo = invokeReadItemServiceAPI(itemServiceAPIUrl);
    return itemInfo.ItemID;
}