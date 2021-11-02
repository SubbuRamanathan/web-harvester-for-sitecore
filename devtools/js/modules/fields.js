export { updateTemplateFields }; 

import { invokeReadItemServiceAPI, getAllGrandChildren } from "./itemservice.js";
import { getContentLanguage } from "./settings.js";
import { getSitecoreUrl } from "./url.js";

const templateFieldTemplateName = 'template field';
const standardTemplateId = '{1930BBEB-7805-471A-A3BE-4858AC7CF696}';
const updateTemplateFields = function(associatedElement, templateId){
    if($(associatedElement).attr('href') == '#templatePathPanel'){
        var templateFieldOptions = [];
        var templateFields = getAllTemplateFields(templateId);
        templateFields.forEach(function (field) { templateFieldOptions.push(`<option value="${field.ItemName}" data-type="${field.Type}">${field.ItemName}</option>`); });
        var associatedFieldSelectors = $(associatedElement).parents('.destination-group-map').find('select');
        associatedFieldSelectors.each(function(){ 
            $(this).empty();
            $(this).append(`<option value="" disabled selected hidden>Select Destination Item Field</option>`);
            $(this).append(templateFieldOptions); 
        });
    }
}

const getAllTemplateFields = function(templateId){
    var directTemplateFields = getAllGrandChildren(templateId, templateFieldTemplateName);
    var inheritedTemplateFields = getInheritedTemplateFields(templateId);
    return directTemplateFields.concat(inheritedTemplateFields);
}

const getInheritedTemplateFields = function(templateId){
    var inheritedTemplateFields = [];
    var sitecoreUrl = getSitecoreUrl();
    var fetchBaseTemplatesAPIUrl = `${sitecoreUrl}/api/ssc/item/${templateId}?database=master&language=${getContentLanguage()}&fields=__Base template`;
    var baseTemplatesAPIResponse = invokeReadItemServiceAPI(fetchBaseTemplatesAPIUrl);
    if(baseTemplatesAPIResponse){
        var baseTemplates = baseTemplatesAPIResponse['__Base template']?.split('|');
        baseTemplates?.forEach(function(inheritedTemplateId){
            if(inheritedTemplateId.toUpperCase() != standardTemplateId){
                inheritedTemplateFields = inheritedTemplateFields.concat(getAllTemplateFields(inheritedTemplateId));
            }
        });
    }
    return inheritedTemplateFields;
}