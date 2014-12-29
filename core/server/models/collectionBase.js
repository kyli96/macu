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

CollectionBase.findById = function (model_class, id) {
    var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
    if (!hexCheck.test('' + id)) {
        return Promise.reject(new Error('invalid id'));
    }
    else {
        var _id = id;
        if (!ObjectID.prototype.isPrototypeOf(_id)) {
            _id = new ObjectID(_id);
        }
        var col = new CollectionBase(model_class.collectionName);
        return col.findOne({ _id: _id }).then(function (data) {
            if (!data) {
                return null;
            }
            return new model_class(data);
        });
    }
}

CollectionBase.prototype.insertOne = function (obj) {
    return this.getCollection()
        .then(function (collection) {
            var doc = {};
            if (obj._dbfields && obj._dbfields.length) {
                for (var i=0; i<obj._dbfields.length; i++) {
                    doc[obj._dbfields[i]] = obj[obj._dbfields[i]];
                }
            }
            else {
                doc = obj;
            }
            return collection.insertOneAsync(doc);
        });
}

CollectionBase.prototype.updateOne = function (filter, updates, options) {
    return this.getCollection()
        .then(function (collection) {
            return collection.updateOneAsync(filter, updates, options);
        });
}

CollectionBase.prototype.updateMany = function (filter, updates, options) {
    return this.getCollection()
        .then(function (collection) {
            return collection.updateManyAsync(filter, updates, options);
        });
}

CollectionBase.prototype.save = function () {
    var doc = {};
    for (var i = 0; i < this._dbfields.length; i++) {
        doc[this._dbfields[i]] = this[this._dbfields[i]];
    }
    if (this._id) {
        doc.updated_at = this.updated_at = Date.now();
        if (!ObjectID.prototype.isPrototypeOf(this._id)) {
            this._id = new ObjectID(this._id);
        }
        return this.updateOne({ _id: this._id }, { $set: doc }, null)
            .then(function (r) {
                if (r.result.ok != 1 || r.result.nModified < 1) {
                    throw new Error('resource not found');
                }
                return this;
            }.bind(this));
    }
    else {
        doc.updated_at = this.updated_at = doc.created_at = this.created_at = Date.now();
        return this.insertOne(doc)
            .then(function (r) {
                if (r.result.ok != 1 || r.insertedCount != 1 || !r.ops || !r.ops[0] || !r.ops[0]._id) {
                    throw new Error('failed inserting document');
                }
                this._id = r.ops[0]._id;
                return this;
            }.bind(this));
    }
}

module.exports = CollectionBase;