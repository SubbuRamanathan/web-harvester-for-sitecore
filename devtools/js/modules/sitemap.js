export { initializeSitemap }

import { getOrigin } from "./url.js";

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
                $('#fetchedUrlsCount').html(matchingUrls.length);
                $('#fetchedUrlsCount').parent().show().delay(2400).fadeOut(300);
                $('.close-icon').trigger('click');
            }
        });
    });
}