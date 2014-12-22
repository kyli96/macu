var CollectionBase = require('./collectionBase'),
    ObjectID = require('mongodb').ObjectID,
    Users;

var USERS_COLLECTION = 'users';

function User(data) {
    this._id = data._id || null;
    this.username = data.username || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.domain = data.domain || '';
    this.subscribed = data.subscribed || [];
}

Users = {
    findById: function (id, fn) {
        var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
        if (!hexCheck.test(id)) {
            fn({ error: 'invalid id' });
        }
        else {
            var collection = new CollectionBase(USERS_COLLECTION);
            collection.findOne({ '_id': ObjectID(id) }, function (err, data) {
                if (err) {
                    fn(err);
                }
                else {
                    fn(null, new User(data));
                }
            });
        }
    },
    findByCredentials: function (username, password, fn) {
        var collection = new CollectionBase(USERS_COLLECTION);
        collection.findOne({ username: username, password: password }, function (err, data) {
            if (err) {
                fn(err);
            }
            else if (!data) {
                fn(new Error('User not found.'));
            }
            else {
                fn(null, new User(data));
            }
        });
    }
}

User.prototype.subscribeChannel = function(channel_id, fn) {
    if (!this._id) {
        fn(new Error('Cannot find user id'));
        return;
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
    collection.updateOne({_id: id}, {$addToSet: {subscribed: cid}}, null, fn);
}

module.exports = {
    User: User,
    Users: Users
}