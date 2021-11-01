export { populateMappingSection, validateAndAddMapping, initializeDeleteOptions, addComplexFieldWarning };

import { clearValidations, initializeFormValidation, reinitializeValidations } from "./form.js"
import { fetchHTML } from "./url.js";

const linkFieldTypes = ['Internal Link', 'General Link', 'General Link with Search', 'link'];
const warningMessage = 'Ensure that the selected Element/Attribute text format is supported by the Template Field'
const populateMappingSection = function(){
    $('#mappingTemplateSection').removeClass('d-none');
    if($('#mappingTemplateSection').html().trim() == ''){
        appendMappingSection();
        initializeAddMappingSectionLink();
    }
}

const appendMappingSection = function(){
    $('#mappingTemplateSection').append(fetchHTML('./views/MappingSection.html'));
    addMapping($('#mappingTemplateSection .destination-group-map:last'));
    reinitializeValidations();
}

const addMappingSection = function(){
    appendMappingSection();
    var deleteMappingSection = $('#mappingTemplateSection .delete-mapping-section:last');
    deleteMappingSection.removeClass('d-none');
    deleteMappingSection.click(function(event){
        clearValidations();
        $(event.currentTarget).parents('.destination-group-map').remove();
        initializeFormValidation();
    });
}

const initializeAddMappingSectionLink = function(){
    $('#addLinkSection').append(fetchHTML('./views/AddSectionLink.html'));
    $('[data-toggle="tooltip"]').tooltip();
    $('#addMappingSection').click(function(){
        addMappingSection();
    });
}

const validateAndAddMapping = function(mappingSection){
    var blankMappings = mappingSection.find('.destination-field-map')
        .filter(function() { return isBlankMapping($(this)) });
    if(blankMappings.length == 0){
        addMapping(mappingSection);
    }
}

const addMapping = function(mappingSection){
    initializeMappingValidations(mappingSection, 'last');

    mappingSection.append(fetchHTML('./views/Mapping.html'));
    initializeMappingValidations(mappingSection, 'first');
    var addedFieldSelector = mappingSection.find('.field-select:last');
    addedFieldSelector.html(mappingSection.find('.field-select:first').html());
    addedFieldSelector.val('');
    
    initializeDeleteOptions(mappingSection);
    reinitializeValidations();
}

const initializeMappingValidations = function(mappingSection, selector){
    mappingSection.find(`.field-select:${selector}`).attr('name', 'fieldSelector');
    mappingSection.find(`.dom-path:${selector}`).attr('name', 'domSelector');
}

const initializeDeleteOptions = function(mappingSection){
    var fieldMappingsDeleteOptions = mappingSection.find('.delete-mapping');
    if(fieldMappingsDeleteOptions.length > 1)
        fieldMappingsDeleteOptions.filter(function(){ return !isBlankMapping($(this).parents('.destination-field-map')) }).removeClass('d-none');
    else
        fieldMappingsDeleteOptions.addClass('d-none');
}

const isBlankMapping = function(mapping){
    return mapping.find('input').val().trim() == '' && mapping.find('select').val() == null;
}

const addComplexFieldWarning = function(fieldSelector){
    var fieldType = $(fieldSelector).find(':selected').data('type');
    var isLinkFieldType = jQuery.inArray(fieldType, linkFieldTypes) != -1;
    var domPicker = $(fieldSelector).parents('.destination-field-map').find('.dom-path');
    if(isLinkFieldType || fieldType == 'Image'){
        domPicker.addClass('btn-warning');
        domPicker.attr('title', warningMessage);
        domPicker.tooltip();
    }
    else{
        domPicker.removeClass('btn-warning');
        domPicker.attr('title', '');
    }
}