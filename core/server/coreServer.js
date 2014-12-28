var http = require('http'),
    sio = require('socket.io'),
    middleware = require('./middleware');

function CoreServer(rootApp) {
    this.rootApp = rootApp;
    this.httpServer = null;
    this.ioServer = null;
    this.connections = {};
    this.connCounter = 0;
}

CoreServer.prototype.start = function () {
    var self = this;

    var httpServer = http.Server(self.rootApp);
    self.httpServer = httpServer;
    var io = sio(httpServer);
    self.ioServer = io;
    middleware.messenger(io);

    self.httpServer.listen(3000, function () {
        console.log('Server listening at *:3000');
    });
}

module.exports = CoreServer;