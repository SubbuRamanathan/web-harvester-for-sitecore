export { initializeMappingEvents, populateMappingSection, addMappingSection, initializeMappingValidation, validateAndAddMapping, addMapping, initializeDeleteOptions };

import { clearValidations, initializeFormValidation, reinitializeValidations } from "./form.js"
import { closeAllPanels } from "./navigation.js";
import { initializeReplaceMapping, updateReplaceOptions, validateAndAddComplexFieldReplaceOptions, validateAndAddReplaceMapping } from "./replace.js";
import { fetchHTML } from "./url.js";

const linkFieldTypes = ['Internal Link', 'General Link', 'General Link with Search', 'link'];
const warningMessage = 'Ensure that the selected Element/Attribute text format is supported by the Template Field';

const initializeMappingEvents = function(){
    $(document).on('change', '.field-select', function(event) {
        validateAndAddMapping($(event.target).parents('.destination-group-map'));
        validateAndAddComplexFieldReplaceOptions($(event.target).parents('.destination-field-map'));
        addComplexFieldWarning($(event.target));
        initializeMappingValidation($(event.target).parents('.destination-field-map'));
        closeAllPanels();
    });

    $(document).on('click', '.find-replace', function(event){
        initializeReplaceMapping(event.currentTarget);
        $(event.currentTarget).addClass('active');
    });

    $(document).on('focusout', '.find-text, .replace-text', function(event) {
        validateAndAddReplaceMapping();
    });

    $(document).on('click', '#confirmReplace', function(event){
        event.stopPropagation();
        event.preventDefault();
        updateReplaceOptions();
    });

    $(document).on('click', '.delete-mapping', function(event){
        var mappingSection = $(event.currentTarget).parents('.destination-group-map');
        clearValidations();
        $(event.currentTarget).parents('.destination-field-map').remove();
        initializeDeleteOptions(mappingSection);
        initializeFormValidation();
    });
}

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
    if($('#mappingTemplateSection .delete-mapping-section').length > 1){
        var deleteMappingSection = $('#mappingTemplateSection .delete-mapping-section:last');
        deleteMappingSection.removeClass('d-none');
        deleteMappingSection.on('click', function(event){
            clearValidations();
            $(event.currentTarget).parents('.destination-group-map').remove();
            initializeFormValidation();
        });
    }
}

const initializeAddMappingSectionLink = function(){
    $('#addLinkSection').append(fetchHTML('./views/AddSectionLink.html'));
    $('[data-toggle="tooltip"]').tooltip();
    $('#addMappingSection').on('click', function(){
        addMappingSection();
        $('[data-toggle="tooltip"]').tooltip();
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
    mappingSection.append(fetchHTML('./views/Mapping.html'));
    var addedFieldSelector = mappingSection.find('.field-select:last');
    addedFieldSelector.html(mappingSection.find('.field-select:first').html());
    addedFieldSelector.val('');
    
    initializeDeleteOptions(mappingSection);
    $('[data-toggle="tooltip"]').tooltip();
}

const initializeMappingValidation = function(fieldMap){
    let enableValidation = !isBlankMapping(fieldMap);
    fieldMap.find('.field-select').attr('name', enableValidation ? 'fieldSelector' : '');
    fieldMap.find('.dom-path').attr('name', enableValidation ? 'domSelector' : '');
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