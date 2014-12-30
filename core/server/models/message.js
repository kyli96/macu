var CollectionBase = require('./collectionBase'),
    Promise = require('bluebird'),
    ObjectID = require('mongodb').ObjectID;

function Message(values) {
    this._id = values._id || null;
    this.t_id = values.t_id || null;
    this.user_id = values.user_id || null;
    this.username = values.username || '';
    this.name = values.name || '';
    this.msg = values.msg || '';
    this.ts = values.ts || Date.now();
    if (this._id && !ObjectID.prototype.isPrototypeOf(this._id)) {
        this._id = new ObjectID(this._id);
    }
    if (this.user_id && !ObjectID.prototype.isPrototypeOf(this.user_id)) {
        this.user_id = new ObjectID(this.user_id);
    }
    this._dbfields = ['t_id', 'user_id', 'username', 'name', 'msg', 'ts'];
}

Message.collectionName = 'messages';

Message.findByChannel = function (t_id) {
    return CollectionBase.find(Message, { t_id: 'C' + t_id }, {}, { ts: 1 });
}

Message.prototype.save = function () {
    var self = this;
    if (!self.t_id) {
        return Promise.reject(new Error('missing required field(s)'));
    }
    var col = new CollectionBase(Message.collectionName);
    return col.insertOne(self);
}

module.exports = Message;