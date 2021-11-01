export { initializeNavigation, closeAllPanels }; 

import { sendRunTimeMessage } from "./message.js";
import { initializeSettingsForm } from "./settings.js";
import { fetchHTML } from "./url.js";

const initializeNavigation = function(){
    let defaultViewUrl = $('#sidepane1').attr('href');
    loadView(defaultViewUrl);
    $('#sidepane1').addClass('selected');
}

$('.nav__item').click(function (event) {
    let selectedViewUrl = $(event.currentTarget).attr('href');
    if(selectedViewUrl.indexOf('./views/') === 0){
        event.preventDefault();
        event.stopPropagation();
        loadView(selectedViewUrl);
        $(event.currentTarget).addClass('selected');
    }
});

$('#navigationToggle').click(function () {
    $('#submitIssue').toggle();
    let sidebarWidth = $("#sidebar").width() > 50 ? 42 : 180;
    $("#sidebar").width(sidebarWidth);
    $(".form-container").css({ left: sidebarWidth });
});

$('.close-icon').click(function () {
    closeAllPanels();
});

const closeAllPanels = function(){
    $('.active').removeClass('active');
    $('.config-section').hide();
    $('.sitecore-tree').jstree("close_all");
    $('.sitecore-tree').jstree("deselect_all", true);
    sendRunTimeMessage({ method: 'pickDOM', pickDOM: false, multiSelect: false });
}

const loadView = function(selectedViewUrl){
    var loadedViews = $('#mainContainer').find('form');
    var selectedView = loadedViews.filter(function() { return $(this).data('view') == selectedViewUrl });
    loadedViews.hide();
    if(selectedView.length > 0){
        selectedView.show();
    }
    else{
        $('#mainContainer').append(fetchHTML(selectedViewUrl));
        initializeSettingsForm();
    }
    $('#sidebar a').removeClass('selected');
}