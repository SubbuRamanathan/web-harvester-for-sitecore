export { validateAndImportContent, clearAllMappingSections, abortImport, isImportAborted }; 

import { addImportToStorage, getImportDetails } from "./save.js";
import { composeCreateAPIRequest } from "./compose.js";
import { getItemId, invokeCreateItemAPI, invokeEditItemAPI } from "./itemservice.js";
import { addCreateItemSuccessLog, addEditItemSuccessLog, addErrorLog, addImportSkippedLog, addImportSuccessLog, addInfoLog, clearLogs, updateImportStatus } from "./log.js";
import { isOverwriteAllowed } from "./settings.js";
import { checkAuthenticationStatus } from "./authenticate.js";
import { initializeMappingValidations } from "./template.js";

let importDetails;
let urlsToImport;
let importedUrlCount = 0;
let isAborted = false;
const validateAndImportContent = function(){
    if(isValid()){
        initializeLogs();
        initializeImport();
    }
}

const isValid = function(){
    initializeMappingValidations();
    var importForm = $('#importForm').data('bootstrapValidator');
    importForm.validate();
    if(importForm.isValid()){
        return checkAuthenticationStatus();
    }
    return false;
}

const initializeLogs = function(){
    clearLogs();
    $('#importForm').addClass('importing');
    $('#importDetails').trigger('click');
}

const initializeImport = function() {
    isAborted = false;
    $('#import').prop('disabled', true);
    addInfoLog('Import Started..');
    importDetails = getImportDetails();
    var websiteUrls = getWebsiteUrls();
    websiteUrls.forEach((url) => {
        fetchAndProcess(url);
    });
    pollImportStatus();
}

const getWebsiteUrls = function(){
    urlsToImport = importDetails.urlList.split(';');
    return urlsToImport;
}

const fetchAndProcess = async (url) => {
    fetch(url).then(response => {
        response.text().then(responseText => {
            setTimeout(scrapeAndImport, 50, url, responseText);
        });
    });
}

const scrapeAndImport = function(url, responseText){
    if(!isAborted){
        try{
            var parser = new DOMParser();
            var document = parser.parseFromString(responseText, 'text/html');
            importDetails.mappingSections.forEach(function(mappingSection){
                var requestInfo = composeCreateAPIRequest(url, document, mappingSection);
                createOrUpdateItem(requestInfo);
            });
            addImportSuccessLog(url);
        }
        catch(error){
            addErrorLog(error, url);
        }
        importedUrlCount++;
    }
}

const createOrUpdateItem = function(requestInfo){
    let itemId = getItemId(requestInfo.ItemPath)
    if(!itemId){
        var createdItemId = invokeCreateItemAPI(requestInfo.ParentPath, requestInfo.ItemInfo);
        addCreateItemSuccessLog(requestInfo.ItemInfo.ItemName, createdItemId);
    }
    else{
        if(isOverwriteAllowed()){
            invokeEditItemAPI(itemId, requestInfo.ItemInfo);
            addEditItemSuccessLog(requestInfo.ItemInfo.ItemName, itemId);
        }
        else
            addImportSkippedLog(decodeURIComponent(requestInfo.ItemPath), itemId);
    }
}

let timer;
const pollImportStatus = function(){
    importedUrlCount = 0;
    timer = setInterval(function(){
        if(importedUrlCount == urlsToImport.length){
            updateImportStatus(importDetails, false);
            addImportToStorage(importDetails);
            clearInterval(timer);
            $('#import').prop('disabled', false);
        }
    }, 500);
}

const clearAllMappingSections = function(){
    window.location.reload();
}

const abortImport = function(){
    isAborted = true;
    clearInterval(timer);
    updateImportStatus(importDetails, true);
    addImportToStorage(importDetails, $('#importLogContainer').html());
    $('#import').prop('disabled', false);
}

const isImportAborted = function(){
    return isAborted;
}