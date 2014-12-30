var server = require('./server');

function makeLantern(options){
    options = options || {};
    return server(options);
}

module.exports = makeLantern;
