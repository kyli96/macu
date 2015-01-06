var Channel = require('./channel');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

Promise.promisifyAll(mongoose);

var UserSchema = new Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    domain: { type: String, default: '' },
    subscribed: [Schema.Types.ObjectId],
    updated_at: { type: Date },
    created_at: { type: Date }
});

UserSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

UserSchema.statics = {
    findBySignupInfo: function (domain, email, name) {
        return this.findOneAsync({ domain: domain, $or: [{ email: email }, { name: name }] });
    },
    findByCredentials: function (domain, email, password) {
        return this.findOneAsync({ domain: domain, email: email, password: password });
    }
}

UserSchema.methods = {
    subscribeChannel: function (channel_id) {
        if (!this._id) {
            return Promise.reject(new Error('Cannot find user id'));
        }
        return this.update({$addToSet: {subscribed: cid}});
    },
    getChannels: function () {
        var self = this;
        var query = {
            $or: [
                { owner: self._id }, 
                { _id: { $in: self.subscribed } }
            ]
        };
        return Channel.findAsync(query);
    },
    getAvailableChannels: function () {
        var self = this;
        var query = {
            domain: self.domain,
            owner: { $ne: self._id },
            _id: { $nin: self.subscribed }
        };
        return Channel.findAsync(query);
    }
}

var User = mongoose.model('User', UserSchema);

module.exports = User;