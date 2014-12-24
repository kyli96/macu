var CollectionBase = require('./collectionBase'),
    ObjectID = require('mongodb').ObjectID;

var MESSAGES_COLLECTION = 'messages';

function Message(values) {
    this._id = values._id || null;
    this.t_id = values.t_id || null;
    this.username = values.username || '';
    this.name = values.name || '';
    this.msg = values.msg || '';
    this.ts = values.ts || Date.now();
    this._dbfields = ['t_id', 'username', 'name', 'msg', 'ts'];
}

Message.findByChannel = function (t_id) {
    var collection = new CollectionBase(MESSAGES_COLLECTION);
    return collection.find({ t_id: 'C' + t_id }, {}, {ts:1});
}

Message.prototype.save = function () {
    var self = this;
    if (!self.t_id) {
        throw new Error('Missing required field(s)');
    }
    var collection = new CollectionBase(MESSAGES_COLLECTION);
    return collection.insertOne(self);
}

module.exports = Message;