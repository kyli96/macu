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
    },
    getDomainChannels: function(domain, countOnly, fn) {
        if (!domain || !fn) {
            console.log('missing required param');
            return;
        }
        var url = '/' + domain + '/channels';
        if (countOnly) {
            url += '?countOnly=1';
        }
        API.get(url, fn);
    }
};
