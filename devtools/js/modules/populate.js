export { populateImportForm }; 

import { checkAuthenticationStatus } from "./authenticate.js";
import { updateTemplateFields } from "./fields.js";
import { clearValidations } from "./form.js";
import { clearLogs } from "./log.js";
import { addMapping, addMappingSection, initializeDeleteOptions } from "./template.js";

const populateImportForm = function(importDetails){
    $('#sidepane1').trigger('click');
    clearValidations();
    $('#webpageUrls').val(importDetails.urlList);
    $('#sitecoreUrl').val(importDetails.sitecoreUrl);
    if(checkAuthenticationStatus())
        populateMappingSections(importDetails.mappingSections);
    else{
        $('#mappingTemplateSection').addClass('d-none');
        $("#importForm #importConfigFailed").show().delay(3200).fadeOut(300);
    }

    clearLogs();
}

const populateMappingSections = function(mappingSections){
    if(mappingSections.length > 0){
        $('#mappingTemplateSection').html('');
        mappingSections.forEach(function(mappingSection){
            populateMappingSection(mappingSection);
        });
    }
}

const populateMappingSection = function(mappingSection){
    addMappingSection();
    
    let addedMappingSection = $('#mappingTemplateSection .destination-group-map:last');
    populateValue(addedMappingSection, '.target-selector', mappingSection.contentPath);
    populateValue(addedMappingSection, '.template-selector', mappingSection.templatePath);
    populateValue(addedMappingSection, '.media-selector', mappingSection.mediaPath);
    let templateSelector = addedMappingSection.find('.template-selector');
    templateSelector.attr('data', mappingSection.templateId);

    for(let i = 0; i < mappingSection.mappings.length - 1; i++)
        addMapping(addedMappingSection);

    updateTemplateFields(templateSelector, mappingSection.templateId);
    populateMappings(addedMappingSection, mappingSection.mappings);
    initializeDeleteOptions(addedMappingSection);
}

const populateMappings = function(addedMappingSection, mappings){
    let i = 0;
    addedMappingSection.find('.destination-field-map').each(function(){
        populateValue($(this), '.dom-path', mappings[i].domPath);
        populateValue($(this), '.field-select', mappings[i].field);
        populateValue($(this), '.replace-options', mappings[i].replaceOptions);
        i++;
    })
}

const populateValue = function(location, selector, value){
    return location.find(selector).val(value);
}