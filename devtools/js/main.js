import { initializeForm, initializeFormValidation } from "./modules/form.js";
import { importContent } from "./modules/import.js";
import "./modules/navigation.js";
import "./modules/form.js";

$(document).ready(function () {
    initializeForm();
    initializeFormValidation();
});

$('#import').click(function (event) {
    event.stopPropagation();
    event.preventDefault();
    updateLocalStorage();
    importContent();
});

const updateLocalStorage = function () {
    localStorage.setItem('sitecoreUrl', $('#sitecoreUrl').val());
    localStorage.setItem('sitemapUrl', $('#sitemapUrl').val());
};






