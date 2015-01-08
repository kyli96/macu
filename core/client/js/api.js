var UserStore = require('./stores/UserStore');
var ServerActionCreators = require('./actions/ServerActionCreators');

var API = {
    get: function(url, data, fn) {
        $.ajax({
            url: '/api' + url,
            data: data
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
    put: function(url, data, fn) {
        $.ajax({
            type: 'PUT',
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
        API.get(url, null, fn);
    },
    getMsgs: function (cid, fn) {
        API.get('/channel/'+cid+'/history', null, fn);
    },
    getChannels: function (fn) {
        API.get('/user/'+UserStore.getData()._id+'/channels', null, fn);
    },
    getAvailableChannels: function (filter, fn) {
        API.get('/user/' + UserStore.getData()._id + '/channels?nonSubscribedOnly=1', null, function (data) {
            ServerActionCreators.receiveDomainChannels(data);
            if (fn) {
                fn(data);
            }
        });
    },
    subscribeChannel: function (channel_id, fn) {
        var data = {
            action: 'subscribeChannel',
            channel_id: channel_id
        };
        API.put('/user/' + UserStore.getData()._id, data, function (result) {
            if (result && result.ok && result.channel) {
                ServerActionCreators.joinedChannel(result.channel);
            }
        });
    },
    search: function (search_terms, fn) {
        API.get('/search', { domain: UserStore.getData().domain, q: search_terms }, function (data) {
            ServerActionCreators.receiveSearchResults(data);
            if (fn) {
                fn(data);
            }
        });
    }
};

module.exports = API;