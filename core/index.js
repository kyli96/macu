// bootloader

var server = require('./server');

function makeCore(options){
    options = options || {};
    return server(options);
}

module.exports = makeCore;