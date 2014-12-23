var ObjectID = require('mongodb').ObjectID,
    Promise = require('bluebird'),
    Utils = require('../utils'),
    MongoDB,
    MongoClient,
    MONGO_URL,
    connection;

MongoDB = Promise.promisifyAll(require('mongodb'));
MongoClient = Promise.promisifyAll(MongoDB.MongoClient);
Promise.promisifyAll(MongoDB.Cursor.prototype);

if (Utils.isProdMode()) {
    MONGO_URL = 'mongodb://localhost:27017/macu';
}
else {
    MONGO_URL = 'mongodb://localhost:27017/macu';
}

function CollectionBase(collectionName) {
    this.collectionName = collectionName;
}

CollectionBase.prototype.getCollection = function () {
    var self = this;
    if (!connection) {
        console.log('connect new db connection');
        connection = MongoClient.connectAsync(MONGO_URL);
    }
    return connection.then(function(db){
        var col = db.collection(self.collectionName);
        return col;
    });
}

CollectionBase.prototype.find = function (filter, modifiers, orders) {
    return this.getCollection()
        .then(function (collection) {
            return collection.findAsync(filter, modifiers);
        })
        .then(function (cursor) {
            if (orders) {
                cursor = cursor.sort(orders);
            }
            return cursor.toArrayAsync();
        });
}

CollectionBase.prototype.findAll = function () {
    return this.getCollection()
        .then(function (collection) {
            return collection.findAsync();
        })
        .then(function(cursor) {
            return cursor.toArrayAsync();
        });
}

CollectionBase.prototype.findOne = function (filter) {
    return this.getCollection()
        .then(function (col) {
            return col.findOneAsync(filter);
        });
}

CollectionBase.prototype.insertOne = function (obj) {
    return this.getCollection()
        .then(function (collection) {
            return collection.insertOneAsync(obj);
        });
}

CollectionBase.prototype.updateOne = function (filter, updates, options) {
    return this.getCollection()
        .then(function (collection) {
            return collection.updateOneAsync(filter, updates, options);
        });
}

module.exports = CollectionBase;