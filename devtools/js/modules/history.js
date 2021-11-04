export { initializeHistoryTable }; 

import { populateImportForm } from "./populate.js";
import { fetchHTML } from "./url.js";

const importsKey = 'imports';
const initializeHistoryTable = function(){
    if(isHistoryTabSelected()){
        $('#history tbody').html('');
        chrome.storage.local.get(importsKey, async (storage) => {
            addHistoryEntries(storage.imports);
            initializeViewLogAction();
            initializeRerunImportAction();
            initializeDeleteImportAction();
        });
    }
}

const isHistoryTabSelected = function(){
    return $('#history').is(':visible');
}

const addHistoryEntries = function(imports){
    for(let i = imports.length - 1; i >= 0; i--){
        $('#history tbody').append(getEntryHTML(imports[i]));
    }
}

const getEntryHTML = function(entry){
    let entryTemplate = fetchHTML('./views/HistoryEntry.html');
    return entryTemplate.replaceAll('$importId', entry.id) 
            .replaceAll('$importTimestamp', formatDateTime(new Date(entry.details.timestamp)))
            .replaceAll('$importUrls', entry.details.urlList)
            .replaceAll('$sitecoreUrl', entry.details.sitecoreUrl);
}

const initializeViewLogAction = function(){
    $('.view-log').on('click', function(e){
        let importId = $(e.currentTarget).data('id');
        chrome.storage.local.get(importsKey, async (storage) => {
            var logs = storage.imports.find(i => i.id == importId).logs;
            $('#importLogContainer').html(logs);
        });
    });
}

const initializeRerunImportAction = function(){
    $('.rerun-import').on('click', function(e){
        let importId = $(e.currentTarget).data('id');
        chrome.storage.local.get(importsKey, async (storage) => {
            var importDetails = storage.imports.find(i => i.id == importId).details;
            populateImportForm(importDetails);
        });
    });
}

const initializeDeleteImportAction = function(){
    $('.delete-import').on('click', function(e){
        let importId = $(e.currentTarget).data('id');
        let importEntry = $(e.currentTarget).parents('tr');
        chrome.storage.local.get(importsKey, async (storage) => {
            let imports = storage.imports;
            imports = imports.filter(function(i){ return i.id != importId });
            importEntry.remove();
            chrome.storage.local.set({[importsKey]:imports});
        });
    });
}

const formatDateTime = function(dateObject){
    let date = (`0${dateObject.getDate()}`).slice(-2);
    let month = (`0${dateObject.getMonth() + 1}`).slice(-2);
    let year = dateObject.getFullYear();
    let hours = (`0${dateObject.getHours()}`).slice(-2);
    let minutes = (`0${dateObject.getMinutes()}`).slice(-2);
    let seconds = (`0${dateObject.getSeconds()}`).slice(-2);
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}