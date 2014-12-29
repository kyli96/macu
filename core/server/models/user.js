var CollectionBase = require('./collectionBase'),
    ObjectID = require('mongodb').ObjectID,
    Util = require('util'),
    Channels = require('./channel').Channels,
    Promise = require('bluebird'),
    Users;

function User(data) {
    User.super_.call(this, User.collectionName);
    this.className = 'User';

    this._id = data._id || null;
    this.username = data.username || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.domain = data.domain || '';
    this.subscribed = data.subscribed || [];
    this._dbfields = ['username', 'name', 'email', 'domain', 'subscribed'];
}
Util.inherits(User, CollectionBase);

User.collectionName = 'users';

User.findById = function (id) {
    return CollectionBase.findById(User, id);
}

User.findByCredentials = function (domain, username, password) {
    return CollectionBase.findOne(User, { domain: domain, username: username, password: password });
}

User.prototype.subscribeChannel = function(channel_id) {
    if (!this._id) {
        return Promise.reject(new Error('Cannot find user id'));
    }
    var id = this._id;
    if (!ObjectID.prototype.isPrototypeOf(id)) {
        id = new ObjectID(id);
    }
    var cid = channel_id;
    if (!ObjectID.prototype.isPrototypeOf(cid)) {
        cid = new ObjectID(cid);
    }
    var collection = new CollectionBase(User.collectionName);
    return collection.updateOne({_id: id}, {$addToSet: {subscribed: cid}}, null);
}

User.prototype.getChannels = function () {
    if (!this.subscribed || this.subscribed.length == 0) {
        return new Promise(function(resolve) {resolve([]);});
    }
    return Channels.findByIds(this.subscribed);
}

Users = {
    subscribeChannelForDomain: function (domain, channel_id) {
        if (!domain) {
            return Promise.reject( new Error('Missing domain'));
        }
        if (!channel_id) {
            return Promise.reject(new Error('Missing channel_id'));
        }
        var cid = channel_id;
        if (!ObjectID.prototype.isPrototypeOf(cid)) {
            cid = new ObjectID(cid);
        }
        var collection = new CollectionBase(User.collectionName);
        return collection.updateMany({domain: domain}, {$addToSet: {subscribed: cid}}, null);
    }
}

module.exports = {
    User: User,
    Users: Users
}