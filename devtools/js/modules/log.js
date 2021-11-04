export { addImportSuccessLog, addCreateItemSuccessLog, addMediaItemImportedLog, addImportSkippedLog, addEditItemSuccessLog, addInfoLog, addErrorLog, updateImportStatus, clearLogs }; 

import { getChromeExtensionOrigin, getHorizonAppUrl, getSitecoreUrl } from "./url.js";
import { getContentLanguage } from "./settings.js";

let hasError = false;
const importsKey = 'imports';

const addImportSuccessLog = function(url) {
    addInfoLog(`Imported ${url} successfully!`);
}

const addImportSkippedLog = function(itemPath, itemId) {
    addInfoLog(`Item already exists at ${itemPath}. Skipping Import.`, itemId);
}

const addCreateItemSuccessLog = function(itemName, itemId) {
    if(itemId)
        addInfoLog(`Created '${itemName}' item successfully!`, itemId);
}

const addMediaItemImportedLog = function(itemName, itemId) {
    if(itemId)
        addInfoLog(`Imported '${itemName}' successfully!`, itemId);
}

const addEditItemSuccessLog = function(itemName, itemId) {
    if(itemId)
        addInfoLog(`Updated '${itemName}' item successfully!`, itemId);
}

const addInfoLog = function(text, itemId) {
    let logText = getLogText(text, itemId);
    addToLogPanel(logText);
}

const addErrorLog = function(error, url) {
    let logText = getErrorText(error.stack ?? error, url);
    addToLogPanel(logText);
    hasError = true;
}

const getLogText = function(text, itemId) {
    if(itemId){
        text += `<a href='${getItemLink(itemId)}' target='_blank'>Go to Item &#x279C;</a>`;
    }
    text += '<br/>';
    return text;
}

const getErrorText = function(error, url){
    error = error?.replaceAll(getChromeExtensionOrigin(), '');
    error = error?.replaceAll('\n', '<br/>');
    return `Encountered below error while importing ${url}, <br/><span class="error">${error}</span><br/>Continuing Import..<br/>`;
}

const getItemLink = function(itemId) {
    var horizonUrl = getHorizonAppUrl();
    if(horizonUrl != '')
        return `${horizonUrl}/content/pages/editor?sc_itemid=${itemId}&sc_lang=${getContentLanguage()}`;
    else
        return `${getSitecoreUrl()}/shell/Applications/Content%20Editor.aspx?sc_bw=1&amp;fo=${itemId}&amp;la=${getContentLanguage()}`
}

const clearLogs = function(){
    $('#importLogContainer').html('');
    hasError = false;
}

const addToLogPanel = function(logText){
    $('#importLogContainer').append(logText);
    $('#importLogContainer').scrollTop($('#importLogContainer').prop('scrollHeight'));

}

const addLogsToStorage = function(importDetails){
    chrome.storage.local.get(importsKey, async (storage) => {
        let imports = storage.imports ?? [];
        let lastImportId = imports[imports.length - 1]?.id ?? 0;
        let importInfo = new Object();
        importInfo.id = lastImportId + 1;
        importInfo.details = importDetails;
        importInfo.logs = $('#importLogContainer').html();
        imports.push(importInfo);
        chrome.storage.local.set({[importsKey]:imports});
    });
}

const updateImportStatus = function(importDetails, isAborted) {
    addInfoLog(isAborted ? 'Import Aborted' : hasError ? 'Import Completed with Errors' : 'Import Completed Successfully!');
    let timeTaken = (new Date().getTime() - importDetails.timestamp) / 1000;
    addInfoLog(`Finished in ${timeTaken} seconds`);
    $('#importForm').removeClass('importing').addClass(isAborted || hasError ? 'failed' : 'success');
    addLogsToStorage(importDetails);
}