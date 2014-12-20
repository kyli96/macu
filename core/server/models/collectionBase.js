﻿var ObjectID = require('mongodb').ObjectID,
    MongoClient = require('mongodb').MongoClient;

var mongoUrl = 'mongodb://localhost:27017/macu';

function CollectionBase(collectionName) {
    this.collectionName = collectionName;
}

CollectionBase.prototype.getCollection = function (fn) {
    var self = this;
    MongoClient.connect(mongoUrl, function (error, db) {
        if (error) {
            fn(error);
        }
        else {
            var col = db.collection(self.collectionName);
            fn(null, col);
            db.close; // need to reuse connection
        }
    });
}

CollectionBase.prototype.find = function (filter, modifiers, orders, fn) {
    this.getCollection(function (error, collection) {
        if (error) {
            fn(error);
        }
        else {
            var cursor = collection.find(filter, modifiers);
            if (orders) {
                cursor = cursor.sort(orders);
            }
            cursor.toArray(fn);
        }
    });
}

CollectionBase.prototype.findAll = function (fn) {
    this.getCollection(function (error, collection) {
        if (error) {
            fn(error);
        }
        else {
            collection.find().toArray(fn);
        }
    });
}

CollectionBase.prototype.findOne = function (filter, fn) {
    this.getCollection(function (err, col) {
        if (err) {
            fn(err);
        }
        else {
            col.findOne(filter, fn);
        }
    });
}

CollectionBase.prototype.insertOne = function (obj, fn) {
    this.getCollection(function (err, collection) {
        if (err) {
            fn(err);
        }
        else {
            collection.insertOne(obj, fn);
        }
    });
}

CollectionBase.prototype.updateOne = function (filter, updates, options, fn) {
    this.getCollection(function (err, collection) {
        if (err) {
            fn(err);
        }
        else {
            collection.updateOne(filter, updates, options, fn);
        }
    });
}

module.exports = CollectionBase;