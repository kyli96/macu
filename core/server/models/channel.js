var CollectionBase = require('./collectionBase'),
    Channels;

var CHANNELS_COLLECTION = 'channels';

function Channel(values) {
    this.id = values.id || null;
    this.name = values.name || '';
    this.access = values.access || 'public';
    this.domain = values.domain || '';
    this.users = values.users || [];
}

Channels = {
    findAll: function (fn) {
        var collection = new CollectionBase(CHANNELS_COLLECTION);
        collection.findAll(fn);
    }
}

Channel.prototype.save = function (fn) {
    var collection = new CollectionBase(CHANNELS_COLLECTION);
    if (this.id) {
        var updateProperties = {
            name: this.name,
            access: this.access,
            users: this.users
        };
        collection.updateOne({ _id: this.id }, updateProterties, fn);
    }
    else {
        var newChannel = {
            name: this.name,
            access: this.access,
            domain: this.domain,
            users: this.users
        };
        collection.insertOne(newChannel, fn);
    }
}

module.exports = {
    Channel: Channel,
    Channels: Channels
}