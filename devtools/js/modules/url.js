export { isValidUrl, getOrigin, getSitecoreUrl, getSitecoreLaunchpadUrl, getSitecoreOrigin, fetchHTML, fetchHTMLDocument, getPageName, isRelativeUrl, getHorizonAppUrl, extractItemId, getChromeExtensionOrigin }; 

const guidPattern = '(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}';

const isValidUrl = function(urlString) {
    try {
        new URL(urlString);
    } catch {
        return false;
    }
    return true;
}

const getOrigin = function(urlString){
    var url = new URL(urlString);
    return url.origin.trimEnd('/');
}

const getSitecoreUrl = function(){
    return $('#sitecoreUrl').val();
}

const getSitecoreLaunchpadUrl = function(){
    let sitecoreUrl = getSitecoreUrl();
    if(sitecoreUrl)
        return `${getSitecoreUrl()}/shell/sitecore/client/Applications/Launchpad`;
}

const getSitecoreOrigin = function(){
    return getOrigin(getSitecoreUrl());
}

const fetchHTML = function(url) {
    try{
        var outputHTML = '';
        $.ajax({ url: url, async: false }).done(function (response){ outputHTML = response });
        return outputHTML;
    }
    catch(error){
        console.log(`Fetch failed for ${url}`);
        console.log(error.stack);
    }
    return '';
}

const fetchHTMLDocument = function(url) {
    const responseText = fetchHTML(url); 
    var parser = new DOMParser();
    return parser.parseFromString(responseText, 'text/html');
}

const getPageName = function(url){
    var pathname = new URL(url).pathname;
    return pathname == '/' ? 'Home' : pathname.split('/').pop();
}

const isRelativeUrl = function(url){
    return url.indexOf('http://') != 0 && url.indexOf('https://') != 0;
}

const getHorizonAppUrl = function() {
    var htmlDocument = fetchHTMLDocument(getSitecoreLaunchpadUrl());
    if(htmlDocument){
        var horizonTile = htmlDocument.querySelectorAll('a[title="Horizon"]');
        if(horizonTile.length > 0)
            return horizonTile[0].href;
    }
    return '';
}

const extractItemId = function(response){
    var regexMatches = response?.match(new RegExp(guidPattern, 'ig'));
    if(regexMatches)
        return regexMatches[0];
}

const getChromeExtensionOrigin = function(){
    return new URL(document.location.href).origin;
}