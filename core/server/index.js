var express = require('express'),
    middleware = require('./middleware'),
    CoreServer = require('./coreServer');

function init(options){
    var messageApp = express(),
        apiApp = express();

    middleware(messageApp, apiApp);
    
    return new CoreServer(messageApp);
}

module.exports = init;