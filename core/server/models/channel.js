var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');
var Message = require('./message');

Promise.promisifyAll(mongoose);

var ChannelSchema = new Schema({
    name: { type: String, default: '' },
    access: { type: String, default: 'public' },
    description: { type: String, default: '' },
    domain: { type: String, default: '' },
    owner: Schema.Types.ObjectId,
    includeAll: { type: Boolean, default: false},
    updated_at: { type: Date },
    created_at: { type: Date }
});

ChannelSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

ChannelSchema.statics = {
    findByDomain: function (domain) {
        return this.findAsync({ domain: domain, access: 'public' });
    },
    getCountByDomain: function (domain) {
        return this.countAsync({ domain: domain, access: 'public' });
    },
    getIncludeAllChannels: function (domain){
        return this.findAsync({ domain: domain, access: 'public', includeAll: true });
    }
}

ChannelSchema.methods = {
    getHistory: function () {
        return Message.findByChannel(this.id);
    },
    recordMsg: function (msg) {
        var values = {
            t_id: 'C' + this._id,
            domain: this.domain,
            user_id: msg.user_id,
            name: msg.name,
            msg: msg.msg,
            ts: msg.ts
        };
        var message = new Message(values);
        return message.saveAsync().spread(function (message, numChanged) { return message });
    }
}

var Channel = mongoose.model('Channel', ChannelSchema);
module.exports = Channel;