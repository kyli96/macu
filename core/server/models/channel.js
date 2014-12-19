var CollectionBase = require('./collectionBase'),
    ObjectID = require('mongodb').ObjectID,
    Channels;

var CHANNELS_COLLECTION = 'channels';
var MSG_HISTORY_COLLECTION = 'msg_history';

function Channel(values) {
    this._id = values._id || null;
    this.name = values.name || '';
    this.access = values.access || 'public';
    this.domain = values.domain || '';
    this.users = values.users || [];
}

Channels = {
    findAll: function (fn) {
        var collection = new CollectionBase(CHANNELS_COLLECTION);
        collection.findAll(function (err, r) {
            if (err) {
                fn(err);
            }
            else {
                var channels = [];
                for (var i = 0; i < r.length; i++) {
                    channels[i] = new Channel(r[i]);
                }
                fn(null, channels);
            }
        });
    }
}

Channel.prototype.save = function (fn) {
    var collection = new CollectionBase(CHANNELS_COLLECTION);
    if (this._id) {
        var updateProperties = {
            name: this.name,
            access: this.access,
            users: this.users
        };
        collection.updateOne({ _id: ObjectID(this._id) }, { $set: updateProterties }, null, fn);
    }
    else {
        var newChannel = {
            name: this.name,
            access: this.access,
            domain: this.domain,
            users: this.users
        };
        collection.insertOne(newChannel, function (err, r) {
            if (err) {
                fn(err);
            }
            else if (r.result.ok != 1 || r.insertedCount != 1 || !r.ops || !r.ops[0] || !r.ops[0]._id) {
                console.log('Failed creating channel:' + r);
                fn(new Error('Failed creating channel'));
            }
            else {
                var history_col = new CollectionBase(MSG_HISTORY_COLLECTION);
                history_col.insertOne({ t_id: 'C' + r.ops[0]._id, msgs: [] }, function (history_err, history_r) {
                    if (history_err) {
                        console.log(history_err); // should remove channel?
                    }
                });
                fn(null, r);
            }
        });
    }
}

Channel.prototype.getHistory = function (fn) {
    if (!this._id) {
        fn(new Error('channel is not created yet.'));
        return;
    }
    var collection = new CollectionBase(MSG_HISTORY_COLLECTION);
    collection.findOne({ t_id: 'C' + this._id }, function (err, r) {
        if (err) {
            fn(err);
            return;
        }
        if (!r) {
            fn(new Error('unable to find history for ' + this._id));
            return;
        }
        fn(null, r);
    });
}

Channel.prototype.recordMsg = function (msg, fn) {
    if (!this._id) {
        fn(new Error('channel is not created yet.'));
        return;
    }
    var collection = new CollectionBase(MSG_HISTORY_COLLECTION);
    collection.updateOne({ t_id: 'C' + this._id }, { $push: { msgs: msg } }, { upsert: true }, fn);
}

module.exports = {
    Channel: Channel,
    Channels: Channels
}