export { initializeImportForm, initializeFormValidation, reinitializeValidations, clearValidations }

import { initializeAuthenticationEvents, updateAuthenticationStatus } from "./authenticate.js";
import { initializeTreeEvents } from "./tree.js";
import { initializeMappingEvents } from "./template.js";
import { abortImport, clearAllMappingSections, validateAndImportContent } from "./import.js";
import { addImportToStorage, initializeSaveLog } from "./save.js";
import { initializeSitemap } from "./sitemap.js";
import { initializeDomEvents } from "./dom.js";

var sitecoreUrl;
const initializeImportForm = function () {
    initializeBasicInfo();
    initializeFormEvents();
    initializeAuthenticationEvents();
    initializeMappingEvents();
    initializeTreeEvents();
    initializeDomEvents();
    initializeFormValidation();
}

const initializeBasicInfo = function(){
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        var tabUrl = tabs[0]?.url;
        if (tabUrl) {
            initializeSitemap(tabUrl);
            $('#webpageUrls').val(tabUrl);
        }
    });
    sitecoreUrl = localStorage.getItem('sitecoreUrl');
    $('#sitecoreUrl').val(sitecoreUrl);
    setTimeout(() => {
        updateAuthenticationStatus();        
    }, 100);
    $('[data-toggle="tooltip"]').tooltip();
}

const initializeFormEvents = function(){
    $('#import').on('click', function (event) {
        preventReload(event);
        updateLocalStorage();
        validateAndImportContent();
    });
    $('#importForm #save').on('click', function (event) {
        preventReload(event);
        updateLocalStorage();
        initializeSaveLog();
        addImportToStorage();
        $("#importForm #saveSuccessMessage").show().delay(2400).fadeOut(300);
    });
    $('#resetImport').on('click', function(event){
        preventReload(event);
        clearAllMappingSections();
    });
    $('#abortImport').on('click', function(event){
        preventReload(event);
        abortImport();
    });
}

const updateLocalStorage = function () {
    localStorage.setItem('sitecoreUrl', $('#sitecoreUrl').val());
    localStorage.setItem('sitemapUrl', $('#sitemapUrl').val());
};

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
            mediaSelector: {
                validators: {
                    regexp: {
                        regexp: '^\/sitecore\/media library\/(.*)$',
                        message: 'Enter valid Media Library Path (Eg: /sitecore/media library/Images)'
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
    $('#importForm').data('bootstrapValidator')?.destroy();
    $('#importForm').data('bootstrapValidator', null);
}

const preventReload = function(event){
    event.stopPropagation();
    event.preventDefault();
}
