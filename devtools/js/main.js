import { initializeImportForm, initializeFormValidation } from "./modules/form.js";
import { initializeNavigation } from "./modules/navigation.js";
import { initializeSettings } from "./modules/settings.js";
import "./modules/navigation.js";
import "./modules/form.js";

$(document).ready(function () {
    initializeNavigation();
    initializeImportForm();
    initializeFormValidation();
    initializeSettings();
});






