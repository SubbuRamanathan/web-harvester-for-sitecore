import { initializeSettings } from "./modules/settings.js";
import { initializeNavigation } from "./modules/navigation.js";
import { initializeImportForm } from "./modules/form.js";

initializeSettings();

$(document).ready(function () {
    initializeNavigation();
    initializeImportForm();
});