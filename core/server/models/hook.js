var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

Promise.promisifyAll(mongoose);

var HookSchema = new Schema({
    name: { type: String, trim: true, required: true },
    events: [{ type: String, lowercase: true, trim: true }],
    t_id: { type: String, trim: true, required: true },
    active: { type: Boolean, default: false },
    config: {
        url: { type: String, trim: true, required: true },
        content_type: { type: String, trim: true },
        token: { type: String, trim: true },
        secure: {type: Boolean, default: false}
    },
    updated_at: { type: Date },
    created_at: { type: Date }
});

HookSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

HookSchema.statics = {
    findByTargetId: function (t_id) {
        return this.findAsync({ t_id: t_id });
    }
}

var Hook = mongoose.model('Hook', HookSchema);

module.exports = Hook;