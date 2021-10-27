export { initializeReplaceMapping, validateAndAddReplaceMapping, validateAndAddLinkFieldReplaceOptions, updateReplaceOptions };

import { closeAllPanels } from "./navigation.js";
import { getTemplate } from "./template.js"

const linkFieldReplacePattern = '[{"find":"(.*)","replace":"<link linktype=\\"external\\" url=\\"$1\\" target=\\"_blank\\" />"}]';
const linkFieldTypes = ['Internal Link', 'General Link', 'General Link with Search', 'link']
const mediaFieldPattern = '<image mediaid="$mediaId" />';
const initializeReplaceMapping = function(target){
    clearReplaceMappingValidations();
    $('#replaceTextContainer').html('');
    var replaceOptions = $(target).siblings('.replace-options').val().trim();
    if(replaceOptions != ''){
        replaceOptions = JSON.parse(replaceOptions);
        replaceOptions.forEach(function(replaceOption){
            addReplaceMapping(replaceOption.find, replaceOption.replace);
        });
    }
    addReplaceMapping();
}

const validateAndAddReplaceMapping = function(){
    $('.find-replace-map').filter(function() { return isBlankMapping($(this)) }).remove();
    $('#confirmReplace').prop('disabled', false);
    addReplaceMapping();
}

const addReplaceMapping = function(findText, replaceText){
    $('#replaceTextContainer').append(getTemplate('./views/FindReplace.html'));
    if(findText){
        $('.find-replace-map:last .find-text').val(findText);
        $('.find-replace-map:last .replace-text').val(replaceText);
    }
}

const validateAndAddLinkFieldReplaceOptions = function(mapping){
    var replaceOptions = $(mapping).children('.replace-options');
    var fieldType = $(mapping).find('.field-select :selected').data('type');
    var isLinkFieldType = jQuery.inArray(fieldType, linkFieldTypes) != -1;
    var replaceOptionsText = replaceOptions.val().trim();
    if(isLinkFieldType){
        if(replaceOptionsText == '')
            replaceOptions.val(linkFieldReplacePattern);
    }
    else if(replaceOptionsText == linkFieldReplacePattern)
        replaceOptions.val('');
}

const clearReplaceMappingValidations = function(){
    var replaceTextForm = $('#replaceTextForm');
    if(replaceTextForm.data('bootstrapValidator')){
        replaceTextForm.data('bootstrapValidator', null);
    }
}

const initializeReplaceMappingValidations = function(){
    clearReplaceMappingValidations();
    $('.find-replace-map').filter(function() { return !isBlankMapping($(this)) }).find('.find-text').attr('name', 'findText');
    $('#replaceTextForm').bootstrapValidator({
        submitButtons: '#confirmReplace',
        fields: {
            findText: {
                validators: {
                    notEmpty: {
                        message: 'Find Text is required'
                    }
                }
            }
        }
    });
}

const updateReplaceOptions = function(){
    if(isFormValid()){
        var replaceOptions = [];
        $('.find-replace-map').each(function(){
            let findText = $(this).find('.find-text').val().trim();
            let replaceText = $(this).find('.replace-text').val().trim();
            if(findText.length > 0){
                var replaceMapping = {};
                replaceMapping['find'] = findText;
                replaceMapping['replace'] = replaceText;
                replaceOptions.push(replaceMapping);
            }
        });
        $('.find-replace.active').siblings('.replace-options').val(JSON.stringify(replaceOptions));
        closeAllPanels();
    }
}

const isFormValid = function(){
    initializeReplaceMappingValidations();
    var replaceFormValidator = $('#replaceTextForm').data('bootstrapValidator');
    replaceFormValidator.validate();
    return replaceFormValidator.isValid();
}

const isBlankMapping = function(mapping){
    return mapping.find('input').filter(function () {
        return $.trim($(this).val()).length > 0
    }).length == 0;
}