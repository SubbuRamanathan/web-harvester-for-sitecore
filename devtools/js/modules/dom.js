export { initializeDomEvents }

import { reinitializeValidations } from "./form.js";
import { sendRunTimeMessage } from "./message.js";
import { initializeMappingValidation, validateAndAddMapping } from "./template.js";

const initializeDomEvents = function(){
    var timer = 0;
    var preventSingleClick = false;
    var lastActiveDOMPicker;

    $(document).on('dblclick', '.dom-picker', function (event) {
        clearTimeout(timer);
        preventSingleClick = true;
        pickDOMElement(event, true);
    });

    $(document).on('click', '.dom-picker', function (event) {
        timer = setTimeout(validateSingleClick, 200, event);
    });

    const validateSingleClick = function(event){
        if (!preventSingleClick) {
            pickDOMElement(event, false);
        }
        preventSingleClick = false;
    }

    const pickDOMElement = function(event, multiselect){
        var pickDOMButton = $(event.target).parents('.dom-picker');
        pickDOMButton.toggleClass('active');
        var isDOMPickerActive = pickDOMButton.hasClass('active');
        if(!isDOMPickerActive) 
            lastActiveDOMPicker = pickDOMButton;
        sendRunTimeMessage({ method: 'pickDOM', pickDOM: isDOMPickerActive, multiSelect: multiselect });
    }

    chrome.runtime.onMessage.addListener(function(message) {
        switch(message.method){
            case 'pickDOM':
                processXPaths(message);
                break;
        }
    });

    const processXPaths = function(message){
        var selectedXPaths = message.xpaths.join(' || ')
        var associatedDomPicker = $('.dom-picker.active');
        if(associatedDomPicker.length == 0) 
            associatedDomPicker = lastActiveDOMPicker;
        associatedDomPicker.removeClass('active').siblings('.dom-path').val(selectedXPaths);
        initializeMappingValidation(associatedDomPicker.parents('.destination-field-map'));
        validateAndAddMapping(associatedDomPicker.parents('.destination-group-map'));
        reinitializeValidations();
    }
    
    $(document).on('focusout', '.dom-path', function (event) {
        initializeMappingValidation($(event.currentTarget).parents('.destination-field-map'));
        reinitializeValidations();
    });
}