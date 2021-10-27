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
            $('.close-icon').click();
        }
    });
});