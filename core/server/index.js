var express = require('express'),
    middleware = require('./middleware'),
    Utils = require('./utils'),
    CoreServer = require('./coreServer');

function init(options){
    var messageApp = express(),
        apiApp = express();
    
    messageApp.log = Utils.createLogger('messageApp');
    apiApp.log = Utils.createLogger('apiApp');
    middleware(messageApp, apiApp);
    
    return new CoreServer(messageApp);
}

module.exports = init;