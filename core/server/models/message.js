var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

Promise.promisifyAll(mongoose);

var MessageSchema = new Schema({
    t_id: String,
    user_id: String,
    name: String,
    msg: String,
    ts: { type: Date, default: Date.now }
});

MessageSchema.statics = {
    findByChannel: function (channel_id) {
        return this.find({ t_id: 'C' + channel_id }).sort('ts').execAsync();
    }
}

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;