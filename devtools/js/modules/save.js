export { getImportDetails }; 

const getImportDetails = function(){
    let importDetails = {
        urlList: getValue('#webpageUrls'),
        sitecoreUrl: getValue('#sitecoreUrl'),
        mappingSections: getMappingSections()
    }
    return importDetails;
}

const getMappingSections = function(){
    let mappingSections = [];
    $('.destination-group-map').each(function(){
        let mappingSection = {
            contentPath: getValue('.target-selector', $(this)),
            templatePath: getValue('.template-selector', $(this)),
            templateId: getElement('.template-selector', $(this)).attr('data'),
            mediaPath: getValue('.media-selector', $(this)),
            mappings: getMappings($(this))
        }
        mappingSections.push(mappingSection);
    });
    return mappingSections;
}

const getMappings = function(mappingSection){
    let mappings = [];
    $(mappingSection).find('.destination-field-map').each(function(){
        let mapping = {
            domPath: getValue('.dom-path', $(this)),
            field: getValue('.field-select', $(this)),
            replaceOptions: getValue('.replace-options', $(this))
        }
        mappings.push(mapping);
    });
    return mappings;
}

const getElement = function(selector, location){
    if(location)
        return $(location).find(selector);
    return $(selector);
}

const getValue = function(selector, location){
    return getElement(selector, location).val();
}