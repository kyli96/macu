var express = require('express'),
    middleware = require('./middleware'),
    Utils = require('./utils'),
    CoreServer = require('./coreServer'),
    config = require('config'),
    mongoose = require('mongoose');

var _connectMongoose = function () {
    mongoose.connect(config.get('Core.mongoConfig').url, config.get('Core.mongoConfig').options);
};

var _server_log = Utils.createLogger('server');

function init(options){
    var messageApp = express(),
        apiApp = express();
    
    _connectMongoose();
    mongoose.connection.on('error', _server_log.error);
    mongoose.connection.on('disconnected', _connectMongoose);

    messageApp.log = Utils.createLogger('messageApp');
    apiApp.log = Utils.createLogger('apiApp');
    middleware(messageApp, apiApp);
    
    return new CoreServer(messageApp);
}

module.exports = init;