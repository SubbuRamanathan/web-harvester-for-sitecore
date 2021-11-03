export { initializeSettings, getSettings, getCredentials, isOverwriteAllowed, updateSettings, initializeSettingsForm, getContentLanguage }; 

let settings;
const settingsKey = 'settings';
const initializeSettings = function() {
    chrome.storage.local.get(settingsKey, async (storage) => {
        settings = storage.settings;
        if(!settings){
            settings = new Object();
            settings.overwriteBehavior = 'updateItem';
            settings.contentLanguage = 'en';
            settings.username = 'admin';
            settings.password = 'b';
            settings.itemNameFindText = '( |%20)';
            settings.itemNameReplaceText = '-';
        }
    });
}

const getSettings = function(){
    return settings;
}

const getCredentials = function(){
    if(settings.username && settings.password)
        return `${settings.username}:${settings.password}`;
}

const getContentLanguage = function(){
    return settings.contentLanguage;
}

const isOverwriteAllowed = function(){
    return settings.overwriteBehavior == 'updateItem';
}

const initializeSettingsForm = function(){
    if($('#settingsForm').length > 0){
        Object.keys(settings).forEach(key => $(`#settingsForm #${key}`).val(settings[key]));
        if(settings.overwriteBehavior)
            $(`#settingsForm #${settings.overwriteBehavior}`).click();

        initializeSettingsFormValidation();
        $('#settingsForm #save').click(function(event){
            updateSettings(event);
        });
        $('[data-toggle="tooltip"]').tooltip();
    }
}

const updateSettings = function(event){
    event.preventDefault();
    event.stopPropagation();
    settings = new Object();
    $(`#settingsForm input`).each(function(){
        settings[this.id] = $(this).val();
    });
    settings.overwriteBehavior = $('#overwriteBehavior input:radio:checked').attr('id');
    chrome.storage.local.set({[settingsKey]:settings});
    $("#settingsForm #saveSuccessMessage").show().delay(2400).fadeOut(300);
}

const initializeSettingsFormValidation = function(){
    $('#settingsForm').bootstrapValidator({
        submitButtons: '#save',
        fields: {
            requiredSetting: {
                validators: {
                    notEmpty: {
                        message: 'Import Language ISO Code is required'
                    }
                }
            }
        }
    });
}