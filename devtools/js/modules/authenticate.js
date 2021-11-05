export { initializeAuthenticationEvents, updateAuthenticationStatus, checkAuthenticationStatus }

import { isValidUrl, fetchHTML, getSitecoreUrl, getSitecoreLaunchpadUrl } from "./url.js";
import { populateMappingSection } from "./template.js";
import { initializeTree } from "./tree.js";

const initializeAuthenticationEvents = function(){
    $('#sitecoreUrl').on('focusout', function () {
        updateAuthenticationStatus(getSitecoreUrl());
    });

    $(window).on('focus', function () {
        updateAuthenticationStatus(getSitecoreUrl())
    });

    $(document).on('click', '#authenticate.unauthorized button', function () {
        chrome.tabs.create({ url: getSitecoreUrl() });
    });
}

const updateAuthenticationStatus = function() {
    $('#authenticate').removeClass().addClass('checking');
    setTimeout(() => {
        checkAuthenticationStatus();
    }, 50);
};

const checkAuthenticationStatus = function(){
    $('#authenticate').removeClass().addClass('checking');
    if(isValidUrl(getSitecoreUrl()) && !$('#authenticate').parents('.form-group').hasClass('has-error')){
        if(isAuthenticated()){
            $('#authenticate').removeClass('checking').addClass('success');
            $('#import').prop('disabled', false);
            populateMappingSection();
            initializeTree();
            return true;
        }
        else{
            $('#authenticate').removeClass('checking').addClass('unauthorized');
            $('#authenticationFailed').focus();
        }
    }
    else
        $('#authenticate').removeClass('checking');
    return false;
}

const isAuthenticated = function() {
    var response = fetchHTML(getSitecoreLaunchpadUrl());
    return response.indexOf('Content Editor') > 0;
}