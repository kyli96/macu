var CollectionBase = require('./collectionBase'),
    Message = require('./message'),
    ObjectID = require('mongodb').ObjectID,
    Promise = require('bluebird'),
    Channels;

var CHANNELS_COLLECTION = 'channels';

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
    this._dbfields = ['name', 'access', 'description', 'domain', 'includeAll', 'owner'];
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
        return collection.find({ _id: { $in: ids } }, {}, null);
    },
    findByDomain: function (domain) {
        var collection = new CollectionBase(CHANNELS_COLLECTION);
        return collection.find({domain:domain, access:'public'}, {}, null);
    }
}

Channel.findById = function (id) {
    var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
    if (!hexCheck.test(id)) {
        return Promise.reject(new Error('invalid id:' + id));
    }
    else {
        var collection = new CollectionBase(CHANNELS_COLLECTION);
        return collection.findOne({ '_id': ObjectID(id) })
            .then(function (data) {
                if (!data) {
                    return null;
                }
                return new Channel(data);
            });
    }
}

Channel.prototype.save = function () {
    var collection = new CollectionBase(CHANNELS_COLLECTION);
    if (!this.owner || !this.name || !this.access || !this.domain) {
        return Promise.reject(new Error('Missing required field(s)'));
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
        return collection.insertOne(this)
            .then(function (r) {
                if (r.result.ok != 1 || r.insertedCount != 1 || !r.ops || !r.ops[0] || !r.ops[0]._id) {
                    console.log('Failed creating channel:' + r);
                    throw new Error('Failed creating channel');
                }
                this._id = r.ops[0]._id;
                return r;
            }.bind(this));
    }
}

Channel.prototype.getHistory = function () {
    if (!this._id) {
        return Promise.reject(new Error('channel is not created yet.'));
    }
    return Message.findByChannel(this._id);
}

Channel.prototype.recordMsg = function (msg) {
    if (!this._id) {
        return Promise.reject(new Error('channel is not created yet.'));
    }
    var values = {
        t_id: 'C' + this._id,
        user_id: msg.user_id,
        username: msg.username,
        name: msg.name,
        msg: msg.msg,
        ts: msg.ts
    };
    var message = new Message(values);
    return message.save();
}

module.exports = {
    Channel: Channel,
    Channels: Channels
}