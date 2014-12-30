var CollectionBase = require('./collectionBase'),
    Promise = require('bluebird'),
    Util = require('util'),
    ObjectID = require('mongodb').ObjectID;

function Hook(values) {
    Hook.super_.call(this, Hook.collectionName);
    this.className = 'Hook';

    this._id = values._id || null;
    this.name = values.name || '';
    this.events = [];
    this.t_id = values.t_id || '';
    this.active = values.active ? true : false;
    this.config = {};
    this.updated_at = values.updated_at;
    this.created_at = values.created_at;

    if (this._id && !ObjectID.prototype.isPrototypeOf(this._id)) {
        this._id = new ObjectID(this._id);
    }
    if (Array.prototype.isPrototypeOf(values.events)) {
        for (var i = 0; i < values.events.length; i++) {
            this.events.push(values.events[i]);
        }
    }
    if (values.config) {
        this.config.url = values.config.url;
        this.config.content_type = values.config.content_type;
        this.config.token = values.config.token;
        this.config.secure = values.config.secure ? true : false;
    }
    this._dbfields = ['name', 't_id', 'events', 'active', 'config'];
}
Util.inherits(Hook, CollectionBase);

Hook.collectionName = 'hooks';

Hook.findById = function (id) {
    return CollectionBase.findById(Hook, id);
}

Hook.findByTargetId = function (t_id) {
    return CollectionBase.find(Hook, {t_id: t_id}, {}, null);
}

Hook.prototype.save = function () {
    var self = this;
    if (!self.name
        || !self.t_id
        || !self.config
        || !self.config.url) {
        return Promise.reject(new Error('missing required field(s)'));
    }
    return Hook.super_.prototype.save.apply(this);
}

module.exports = Hook;