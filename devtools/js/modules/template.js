export { populateMappingSection, validateAndAddMapping, initializeDeleteOptions, getTemplate };

import { clearValidations, initializeFormValidation, reinitializeValidations } from "./form.js"

const populateMappingSection = function(){
    $('#mappingTemplateSection').removeClass('d-none');
    if($('#mappingTemplateSection').html().trim() == ''){
        appendMappingSection();
        initializeAddMappingSectionLink();
    }
}

const appendMappingSection = function(){
    $('#mappingTemplateSection').append(getTemplate('./views/MappingSection.html'));
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
    $('#addLinkSection').append(getTemplate('./views/AddSectionLink.html'));
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

    mappingSection.append(getTemplate('./views/Mapping.html'));
    initializeMappingValidations(mappingSection, 'first');
    var addedFieldSelector = mappingSection.find('.field-select:last');
    addedFieldSelector.html(mappingSection.find('.field-select:first').html());
    addedFieldSelector.val('');
    
    initializeDeleteOptions(mappingSection);
    reinitializeValidations();
}

const getTemplate = function(templateUrl){
    var templateHtml;
    $.ajax({ url: templateUrl, async: false }).done(function (response){ templateHtml = response });
    return templateHtml;
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