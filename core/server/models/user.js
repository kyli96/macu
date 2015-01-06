var Channel = require('./channel');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');
var crypto = require('crypto');

Promise.promisifyAll(mongoose);

var UserSchema = new Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    domain: { type: String, default: '' },
    subscribed: [Schema.Types.ObjectId],
    hashed_password: { type: String, default: '' },
    salt: { type:String, default: ''},
    updated_at: { type: Date },
    created_at: { type: Date }
});

UserSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () { return this._password });

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
    findByCredentials: function (domain, email) {
        return this.findOneAsync({ domain: domain, email: email });
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
    },
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    }
}

var User = mongoose.model('User', UserSchema);

module.exports = User;