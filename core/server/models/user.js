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

module.exports = {
    User: User,
    Users: Users
}