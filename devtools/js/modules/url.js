export { isValidUrl, getOrigin, getSitecoreUrl, getSitecoreOrigin, fetchHTML, fetchHTMLDocument, getPageName }; 

const isValidUrl = async (urlString) => {
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

const getSitecoreOrigin = function(urlString){
    return getOrigin(getSitecoreUrl())
}

const fetchHTML = async (url) => {
    try{
        const response = await fetch(url);
        return await response.text(); 
    }
    catch{}
}

const fetchHTMLDocument = async (url) => {
    const response = await fetch(url, { redirect: 'manual'});
    if(response.status == 200){
        const responseText = await response.text(); 
        var parser = new DOMParser();
        return parser.parseFromString(responseText, 'text/html');
    }
}

const getPageName = function(url){
    var pathname = new URL(url).pathname;
    return pathname == '/' ? 'Home' : pathname.split('/').pop();
}