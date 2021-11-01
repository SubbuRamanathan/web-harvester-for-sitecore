export { isValidUrl, getOrigin, getSitecoreUrl, getSitecoreOrigin, fetchHTML, fetchHTMLDocument, getPageName, isRelativeUrl }; 

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

const getSitecoreOrigin = function(){
    return getOrigin(getSitecoreUrl());
}

const fetchHTML = function(url) {
    var outputHTML = '';
    $.ajax({ url: url, async: false }).done(function (response){ outputHTML = response });
    return outputHTML;
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