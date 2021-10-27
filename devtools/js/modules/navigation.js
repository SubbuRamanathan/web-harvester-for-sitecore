export { closeAllPanels }; 

import { sendRunTimeMessage } from "./message.js";

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