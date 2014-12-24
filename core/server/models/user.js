var CollectionBase = require('./collectionBase'),
    ObjectID = require('mongodb').ObjectID,
    Channels = require('./channel').Channels,
    Users;

var USERS_COLLECTION = 'users';

function User(data) {
    this._id = data._id || null;
    this.username = data.username || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.domain = data.domain || '';
    this.subscribed = data.subscribed || [];
    this._dbfields = ['username', 'name', 'email', 'domain', 'subscribed'];
}

User.findById = function (id) {
    var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
    if (!hexCheck.test(id)) {
        throw new Error('invalid id');
    }
    else {
        var collection = new CollectionBase(USERS_COLLECTION);
        return collection.findOne({ '_id': ObjectID(id) })
            .then(function (data) {
                return new User(data);
            });
    }
}

User.findByCredentials = function (username, password) {
    var collection = new CollectionBase(USERS_COLLECTION);
    return collection.findOne({ username: username, password: password })
        .then(function (data) {
            if (!data) {
                throw new Error('User not found');
            }
            else {
                return new User(data);
            }
        });
}

User.prototype.subscribeChannel = function(channel_id) {
    if (!this._id) {
        throw new Error('Cannot find user id');
    }
    var id = this._id;
    if (!ObjectID.prototype.isPrototypeOf(id)) {
        id = new ObjectID(id);
    }
    var cid = channel_id;
    if (!ObjectID.prototype.isPrototypeOf(cid)) {
        cid = new ObjectID(cid);
    }
    var collection = new CollectionBase(USERS_COLLECTION);
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
            throw new Error('Missing domain');
        }
        if (!channel_id) {
            throw new Error('Missing channel_id');
        }
        var cid = channel_id;
        if (!ObjectID.prototype.isPrototypeOf(cid)) {
            cid = new ObjectID(cid);
        }
        var collection = new CollectionBase(USERS_COLLECTION);
        return collection.updateMany({domain: domain}, {$addToSet: {subscribed: cid}}, null);
    }
}

module.exports = {
    User: User,
    Users: Users
}