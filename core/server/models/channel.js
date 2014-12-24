var CollectionBase = require('./collectionBase'),
    ObjectID = require('mongodb').ObjectID,
    Channels;

var CHANNELS_COLLECTION = 'channels';
var MSG_HISTORY_COLLECTION = 'msg_history';

function Channel(values) {
    this._id = values._id || null;
    this.name = values.name || '';
    this.access = values.access || 'public';
    this.description = values.description || '';
    this.domain = values.domain || '';
    this.includeAll = values.includeAll || false;
    this.owner = values.owner || null;
    if (ObjectID.prototype.isPrototypeOf(this.owner)) {
        this.owner = this.owner.toHexString();
    }
}

Channels = {
    findAll: function () {
        var collection = new CollectionBase(CHANNELS_COLLECTION);
        return collection.findAll()
            .then(function (r) {
                var channels = [];
                for (var i = 0; i < r.length; i++) {
                    channels[i] = new Channel(r[i]);
                }
                return channels;
            });
    },
    findByIds: function (ids) {
        for (var i=0;i<ids.length;i++) {
            if (!ObjectID.prototype.isPrototypeOf(ids[i])) {
                ids[i] = new ObjectID(ids[i]);
            }
        }
        var collection = new CollectionBase(CHANNELS_COLLECTION);
        return collection.find({_id: {$in: ids}}, {}, null);
    }
}

Channel.prototype.save = function () {
    var collection = new CollectionBase(CHANNELS_COLLECTION);
    if (!this.owner || !this.name || !this.access || !this.domain) {
        throw new Error('Missing required field(s)');
    }
    if (this._id) {
        var updateProperties = {
            name: this.name,
            access: this.access,
            domain: this.domain,
            description: this.description,
            owner: this.owner,
            includeAll: this.includeAll
        };
        return collection.updateOne({ _id: ObjectID(this._id) }, { $set: updateProterties }, null);
    }
    else {
        var newChannel = {
            name: this.name,
            access: this.access,
            domain: this.domain,
            description: this.description,
            owner: this.owner,
            includeAll: this.includeAll
        };
        return collection.insertOne(newChannel)
            .then(function (r) {
                if (r.result.ok != 1 || r.insertedCount != 1 || !r.ops || !r.ops[0] || !r.ops[0]._id) {
                    console.log('Failed creating channel:' + r);
                    throw new Error('Failed creating channel');
                }
                return r;
            });
    }
}

Channel.prototype.getHistory = function () {
    if (!this._id) {
        throw new Error('channel is not created yet.');
    }
    var collection = new CollectionBase(MSG_HISTORY_COLLECTION);
    return collection.find({ t_id: 'C' + this._id }, {}, {ts:1});
}

Channel.prototype.recordMsg = function (msg) {
    if (!this._id) {
        throw new Error('channel is not created yet.');
    }
    var collection = new CollectionBase(MSG_HISTORY_COLLECTION);
    var msg_obj = {
        t_id: 'C'+msg.t_id,
        username: msg.username,
        name: msg.name,
        msg: msg.msg,
        ts: Date.now()
    };
    return collection.insertOne(msg_obj);
}

module.exports = {
    Channel: Channel,
    Channels: Channels
}