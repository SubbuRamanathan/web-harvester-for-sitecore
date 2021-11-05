export { initializeNavigation, closeAllPanels }; 

import { initializeHistoryTable } from "./history.js";
import { sendRunTimeMessage } from "./message.js";
import { initializeSettingsForm } from "./settings.js";
import { fetchHTML } from "./url.js";

const initializeNavigation = function(){
    let defaultViewUrl = $('#sidepane1').attr('href');
    loadView(defaultViewUrl);
    $('#sidepane1').addClass('selected');
    initializeNavigationEvents();
}

const initializeNavigationEvents = function(){
    $(document).on('click', 'a[href^="#"]', function(event){
        var panelId = $(event.currentTarget).attr('href');
        if(panelId != '#'){
            closeAllPanels();
            $(panelId).show();
        }
    });

    $('.nav__item').on('click', function (event) {
        let selectedViewUrl = $(event.currentTarget).attr('href');
        if(selectedViewUrl.indexOf('./views/') === 0){
            event.preventDefault();
            event.stopPropagation();
            loadView(selectedViewUrl);
            $(event.currentTarget).addClass('selected');
        }
    });

    $('#navigationToggle').on('click', function () {
        $('#submitIssue').toggle();
        let sidebarWidth = $("#sidebar").width() > 50 ? 42 : 180;
        $("#sidebar").width(sidebarWidth);
        $(".form-container").css({ left: sidebarWidth });
    });

    $('.close-icon').on('click', function () {
        closeAllPanels();
    });

    $('body').on('contextmenu', function() {
        return false;
    });
}

const closeAllPanels = function(){
    $('.active').removeClass('active');
    $('.config-section').hide();
    $('.sitecore-tree').jstree("close_all");
    $('.sitecore-tree').jstree("deselect_all", true);
    sendRunTimeMessage({ method: 'pickDOM', pickDOM: false, multiSelect: false });
}

const loadView = function(selectedViewUrl){
    var loadedViews = $('#mainContainer').find('form, table');
    var selectedView = loadedViews.filter(function() { return $(this).data('view') == selectedViewUrl });
    loadedViews.hide();
    if(selectedView.length > 0){
        selectedView.show();
    }
    else{
        $('#mainContainer').append(fetchHTML(selectedViewUrl));
        initializeSettingsForm();
    }
    initializeHistoryTable();
    $('#sidebar a').removeClass('selected');
}