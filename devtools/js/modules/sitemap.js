import { getOrigin } from "./url.js";

export { initializeSitemap }

const initializeSitemap = function(tabUrl){
    var defaultWildCardPattern = tabUrl?.substr(0, tabUrl.lastIndexOf("/")) + '/(.*)';
    var defaultSitemapUrl = localStorage.getItem('sitemapUrl');
    if (!defaultSitemapUrl)
        defaultSitemapUrl = `${getOrigin(tabUrl)}/sitemap.xml`;
    $('#sitemapUrl').val(defaultSitemapUrl);
    $('#urlPattern').val(defaultWildCardPattern);
    initializeSitemapSubmitAction();
}

const initializeSitemapSubmitAction = function(){
    $('#sitemapForm').on("submit", function (e) {
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: $('#sitemapUrl').val(),
            dataType: "xml",
            success: function (xml){
                var matchingUrls = new Array();
                var regex = new RegExp($('#urlPattern').val());
                $(xml).find("loc").each(function () {
                    if (regex.test($(this).text())) {
                        matchingUrls.push($(this).text());
                    }
                });
                $('#webpageUrls').val(matchingUrls.join(';'));
                $('.close-icon').trigger('click');
            }
        });
    });
}