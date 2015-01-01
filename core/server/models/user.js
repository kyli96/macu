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
    this.name = data.name || '';
    this.email = data.email || '';
    this.domain = data.domain || '';
    this.subscribed = data.subscribed || [];
    this._dbfields = ['name', 'email', 'domain', 'subscribed'];
}
Util.inherits(User, CollectionBase);

User.collectionName = 'users';

User.findById = function (id) {
    return CollectionBase.findById(User, id);
}

User.findBySignupInfo = function (domain, email, name) {
    return CollectionBase.findOne(User, { domain: domain, $or: [{ email: email }, { name: name }] });
}

User.findByCredentials = function (domain, email, password) {
    return CollectionBase.findOne(User, { domain: domain, email: email, password: password });
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
    var self = this;
    var query = {
        $or: [
            { owner: self._id }, 
            { _id: { $in: self.subscribeChannel } }
        ]
    };
    return Channels.find(query, {}, null);
    //if (!this.subscribed || this.subscribed.length == 0) {
    //    return new Promise(function(resolve) {resolve([]);});
    //}
    //return Channels.findByDomain(this.domain);
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