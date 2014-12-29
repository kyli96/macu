var CollectionBase = require('./collectionBase'),
    Message = require('./message'),
    Util = require('util'),
    ObjectID = require('mongodb').ObjectID,
    Promise = require('bluebird'),
    Channels;

function Channel(values) {
    Channel.super_.call(this, Channel.collectionName);
    this.className = 'Channel';

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
Util.inherits(Channel, CollectionBase);

Channel.collectionName = 'channels';

Channels = {
    findAll: function () {
        return CollectionBase.findAll(Channel);
    },
    findByIds: function (ids) {
        for (var i=0;i<ids.length;i++) {
            if (!ObjectID.prototype.isPrototypeOf(ids[i])) {
                ids[i] = new ObjectID(ids[i]);
            }
        }
        return CollectionBase.find(Channel, { _id: { $in: ids } }, {}, null);
    },
    findByDomain: function (domain) {
        return CollectionBase.find(Channel, { domain: domain, access: 'public' }, {}, null);
    }
}

Channel.findById = function (id) {
    return CollectionBase.findById(User, id);
}

Channel.prototype.save = function () {
    if (!this.owner || !this.name || !this.access || !this.domain) {
        return Promise.reject(new Error('missing required field(s)'));
    }
    return Channel.super_.prototype.save.apply(this);
}

Channel.prototype.getHistory = function () {
    if (!this._id) {
        return Promise.reject(new Error('missing channel id'));
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