var init = function () {
    var Messenger = require('./messages');
    Messenger.init();
}

jQuery.cachedScript = function (url, options) {
    options = $.extend(options || {}, {
        dataType: "script",
        cache: true,
        url: url
    });
    return jQuery.ajax(options);
};
if (!window.Intl) {
    $.when(
        $.cachedScript('/js/i18n/intl/intl.min.js'),
        $.cachedScript('/js/i18n/intl/locale-data/' + locale + '.js'),
        $.cachedScript('/js/i18n/react-intl/react-intl.min.js'),
        $.getScript('/js/i18n/' + locale + '.js'),
        $.Deferred(function (deferred) {
            $(deferred.resolve);
        })
    ).done(init);
}
else {
    $.when(
        $.cachedScript('/js/i18n/react-intl/react-intl.min.js'),
        $.getScript('/js/i18n/' + locale + '.js'),
        $.Deferred(function (deferred) {
            $(deferred.resolve);
        })
    ).done(init);
}