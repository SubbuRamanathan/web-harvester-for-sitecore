export { initializeForm, initializeFormValidation, reinitializeValidations, clearValidations }

import { sendRunTimeMessage } from "./message.js";
import { updateAuthenticationStatus } from "./authenticate.js";
import { updateTemplateFields } from "./fields.js";
import { getOrigin } from "./url.js";
import { expandTree } from "./tree.js";
import { getItemId } from "./itemservice.js";
import { validateAndAddMapping, initializeDeleteOptions } from "./template.js";
import { initializeReplaceMapping, validateAndAddReplaceMapping, validateAndAddLinkFieldReplaceOptions, updateReplaceOptions } from "./replace.js";
import { closeAllPanels } from "./navigation.js";
import { scrapeAndImport } from "./import.js";
import "./sitemap.js";

var sitecoreUrl;
const initializeForm = function () {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        var tabUrl = tabs[0]?.url;
        if (tabUrl) {
            var defaultWildCardPattern = tabUrl?.substr(0, tabUrl.lastIndexOf("/")) + '/(.*)';
            var defaultSitemapUrl = localStorage.getItem('sitemapUrl');
            if (!defaultSitemapUrl)
                defaultSitemapUrl = `${getOrigin(tabUrl)}/sitemap.xml`;
            $('#webpageUrls').val(tabUrl);
            $('#urlPattern').val(defaultWildCardPattern);
            $('#sitemapUrl').val(defaultSitemapUrl);
        }
    });
    sitecoreUrl = localStorage.getItem('sitecoreUrl');
    $('#sitecoreUrl').val(sitecoreUrl);
    $('[data-toggle="tooltip"]').tooltip();
}

$('#fetchUrls').click(function(event){
    closeAllPanels();
    $('#sitemapPanel').show();
});

$('#sitecoreUrl').focusout(function () {
    sitecoreUrl = $('#sitecoreUrl').val();
    updateAuthenticationStatus(sitecoreUrl);
});

$(window).focus(function () {
    updateAuthenticationStatus(sitecoreUrl)
});

$(document).on('click', '.authenticate.unauthorized', function () {
    chrome.tabs.create({ url: sitecoreUrl });
});

$('.sitecore-tree').on("select_node.jstree", function (event, selected) {
    var associatedPathSelector = $('.tree-icon.active').siblings('.path-selector');
    if(associatedPathSelector.val() != selected.node.data){
        associatedPathSelector.val(selected.node.data);
        associatedPathSelector.attr('data', selected.node.id)
        updateTemplateFields('.tree-icon.active', selected.node.id);

        $('.close-icon').click();
        reinitializeValidations();
    }
});

$(document).on('focusout', '.template-selector', function(e){
    var templateId = getItemId(e.currentTarget.value);
    updateTemplateFields(e.currentTarget, templateId);
});

$(document).on('click', '[href$="PathSection"]', function (e) {
    e.stopPropagation();
    e.preventDefault();
    
    closeAllPanels();
    $(e.currentTarget).toggleClass('active');
    $(e.currentTarget.attributes['href'].value).show();

    if($(e.currentTarget).hasClass('active'))
        expandTree(e.currentTarget);
});

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
		case 'getHTML':
			scrapeAndImport(message);
			break;
	}
});

const processXPaths = function(message){
    var selectedXPaths = message.xpaths.join(' || ')
    var associatedDomPicker = $('.dom-picker.active');
    if(associatedDomPicker.length == 0) 
        associatedDomPicker = lastActiveDOMPicker;
    associatedDomPicker.removeClass('active').siblings('.dom-path').val(selectedXPaths);
    validateAndAddMapping(associatedDomPicker.parents('.destination-group-map'));
    reinitializeValidations();
}

$(document).on('change', '.field-select', function(event) {
    validateAndAddMapping($(event.target).parents('.destination-group-map'));
    validateAndAddLinkFieldReplaceOptions($(event.target).parents('.destination-field-map'));
});

$(document).on('focusout', '.find-text, .replace-text', function(event) {
    validateAndAddReplaceMapping();
});

$(document).on('click', '.delete-mapping', function(event){
    var mappingSection = $(event.currentTarget).parents('.destination-group-map');
    clearValidations();
    $(event.currentTarget).parents('.destination-field-map').remove();
    initializeDeleteOptions(mappingSection);
    initializeFormValidation();
});

$(document).on('click', '.find-replace', function(event){
    closeAllPanels();
    initializeReplaceMapping(event.currentTarget);
    $('#replaceTextPanel').show();
    $(event.currentTarget).addClass('active');
});

$(document).on('click', '#confirmReplace', function(event){
    event.stopPropagation();
    event.preventDefault();
    updateReplaceOptions();
});

const initializeFormValidation = function(){
    $('#importForm').bootstrapValidator({
        submitButtons: '#import',
        fields: {
            webpageUrls: {
                validators: {
                    notEmpty: {
                        message: 'Website Url is required'
                    },
                    regexp: {
                        regexp: '^(((http|https|www)(:\/\/|.)[^;]+))(;((http|https|www)(:\/\/|.)[^;]+))*[;]?$',
                        message: 'Enter valid semi-colon separated Website URL(s)'
                    }
                }
            },
            sitecoreUrl: {
                validators: {
                    notEmpty: {
                        message: 'Sitecore Url is required'
                    },
                    regexp: {
                        regexp: '((http|https|www)(:\/\/|.)[^;]+)\/sitecore[\/]?$',
                        message: 'Enter valid Sitecore URL (Eg: https://www.example.com/sitecore)'
                    }
                }
            },
            pathSelector: {
                validators: {
                    notEmpty: {
                        message: 'Path Selection is required'
                    },
                    regexp: {
                        regexp: '^\/sitecore\/content\/(.*)$',
                        message: 'Enter valid Path (Eg: /sitecore/content/Home)'
                    }
                }
            },
            templateSelector: {
                validators: {
                    notEmpty: {
                        message: 'Template Selection is required'
                    },
                    regexp: {
                        regexp: '^\/sitecore\/templates\/(.*)$',
                        message: 'Enter valid Template Path (Eg: /sitecore/templates/Home)'
                    }
                }
            },
            domSelector: {
                validators: {
                    notEmpty: {
                        message: 'DOM Selection is required'
                    }
                }
            },
            fieldSelector: {
                validators: {
                    notEmpty: {
                        message: 'Field Selection is required'
                    }
                }
            }
        }
    });
}

const reinitializeValidations = function(){
    clearValidations();
    initializeFormValidation();
}

const clearValidations = function(){
    $('#importForm').data('bootstrapValidator').destroy();
    $('#importForm').data('bootstrapValidator', null);
}
