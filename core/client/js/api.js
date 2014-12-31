var API = {
    get: function(url, fn) {
        $.ajax({
            url: '/api' + url
        }).done(function (data) {
            fn(data);
        });
    },
    post: function(url, data, fn) {
        $.ajax({
            type: 'POST',
            url: '/api' + url,
            data: data
        }).done(function(r) {
            fn(r);
        });
    }
};
