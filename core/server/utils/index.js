﻿var bunyan = require('bunyan'),
    uuid = require('node-uuid'),
    utils;

utils = {
    isProdMode: function () {
        return process.env.NODE_ENV === 'production';
    },
    lookup: function(obj, field) {
        if (!obj) { return null; }
        var chain = field.split(']').join('').split('[');
        for (var i = 0, len = chain.length; i < len; i++) {
            var prop = obj[chain[i]];
            if (typeof (prop) === 'undefined') { return null; }
            if (typeof (prop) !== 'object') { return prop; }
            obj = prop;
        }
        return null;
    },
    createLogger: function (name, parent, obj) {
        var logger;
        if (!parent) {
            logger = bunyan.createLogger({ name: name, serializers: bunyan.stdSerializers });
            if (!utils.isProdMode()) {
                logger.level(bunyan.DEBUG);
            }
        }
        else {
            logger = parent;
        }
        switch (name) {
            case 'req':
                var info = {};
                info.reqId = uuid.v1();
                if (obj) {
                    info.url = obj.url;
                    info.method = obj.method;
                }
                logger = parent.child(info);
                break;
        }
        return logger;
    }
}

module.exports = utils;