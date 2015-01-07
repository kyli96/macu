var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

Promise.promisifyAll(mongoose);

var MessageSchema = new Schema({
    t_id: String,
    domain: String,
    user_id: String,
    name: String,
    msg: String,
    ts: { type: Date, default: Date.now }
});

MessageSchema.index({msg: 'text', ts: -1});

MessageSchema.statics = {
    findByChannel: function (channel_id) {
        return this.find({ t_id: 'C' + channel_id }).sort('ts').execAsync();
    },
    search: function (domain, text) {
        return this
        .find(
            { $text: { $search: text }, domain: domain }, 
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .execAsync();
    }
}

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;