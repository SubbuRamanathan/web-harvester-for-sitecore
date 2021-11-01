export { updateAuthenticationStatus }

import { isValidUrl, fetchHTML } from "./url.js";
import { initializeTree } from "./tree.js";
import { populateMappingSection } from "./template.js";

const updateAuthenticationStatus = function(sitecoreUrl) {
    $('.authenticate').removeClass('d-none success unauthorized');
    $('#authenticateLoading').removeClass('d-none');
    $('#authenticateText').text('Checking..');
    $('.authenticate').prop("disabled", true);
    if(isValidUrl(sitecoreUrl)){
        if(isAuthenticated(sitecoreUrl)){
            $('.authenticate').addClass('success');
            $('#authenticateText').text('Authenticated');
            populateMappingSection();
            initializeTree();
        }
        else{
            $('.authenticate').addClass('unauthorized');
            $('#authenticateText').text('Authenticate to Proceed ➡');
            $('.authenticate').prop("disabled", false);
        }
    }
    else{
        $('#authenticateText').text('Invalid Sitecore Url');
    }
    $('#authenticateLoading').addClass('d-none');
};

const isAuthenticated = function(sitecoreUrl) {
    var sitecoreLaunchpadUrl = `${sitecoreUrl}/shell/sitecore/client/Applications/Launchpad`;
    var response = fetchHTML(sitecoreLaunchpadUrl);
    return response.indexOf('Content Editor') > 0;
}