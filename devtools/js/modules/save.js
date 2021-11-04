export { getImportDetails, addImportToStorage, initializeSaveLog }; 

import { addInfoLog, clearLogs } from "./log.js";

const importsKey = 'imports';

const getImportDetails = function(){
    let importDetails = {
        timestamp: new Date().getTime(),
        urlList: getValue('#webpageUrls'),
        sitecoreUrl: getValue('#sitecoreUrl'),
        mappingSections: getMappingSections()
    }
    return importDetails;
}

const getMappingSections = function(){
    let mappingSections = [];
    $('.destination-group-map').each(function(){
        let mappingSection = {
            contentPath: getValue('.target-selector', $(this)),
            templatePath: getValue('.template-selector', $(this)),
            templateId: getElement('.template-selector', $(this)).attr('data'),
            mediaPath: getValue('.media-selector', $(this)),
            mappings: getMappings($(this))
        }
        mappingSections.push(mappingSection);
    });
    return mappingSections;
}

const getMappings = function(mappingSection){
    let mappings = [];
    $(mappingSection).find('.destination-field-map').each(function(){
        let mapping = {
            domPath: getValue('.dom-path', $(this)),
            field: getValue('.field-select', $(this)),
            replaceOptions: getValue('.replace-options', $(this))
        }
        mappings.push(mapping);
    });
    return mappings;
}

const initializeSaveLog = function(){
    clearLogs();
    addInfoLog('Saved Import Configuration Successfully!');
}

const addImportToStorage = function(importDetails){
    chrome.storage.local.get(importsKey, async (storage) => {
        let imports = storage.imports ?? [];
        let lastImportId = imports[imports.length - 1]?.id ?? 0;
        let importInfo = new Object();
        importInfo.id = lastImportId + 1;
        importInfo.details = importDetails ?? getImportDetails();
        importInfo.logs = $('#importLogContainer').html();
        imports.push(importInfo);
        chrome.storage.local.set({[importsKey]:imports});
    });
}

const getElement = function(selector, location){
    if(location)
        return $(location).find(selector);
    return $(selector);
}

const getValue = function(selector, location){
    return getElement(selector, location).val();
}