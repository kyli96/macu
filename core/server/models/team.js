var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

Promise.promisifyAll(mongoose);

var TeamSchema = new Schema({
    name: { type: String, default: '' },
    owner: Schema.Types.ObjectId,
    updated_at: { type: Date },
    created_at: { type: Date }
});

TeamSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

TeamSchema.statics = {
    findByName: function (name) {
        return this.findAsync({ name: name });
    },
    findByOwnerId: function (owner_id) {
        return this.findAsync({ owner: owner_id });
    }
}

var Team = mongoose.model('Team', TeamSchema);
module.exports = Team;