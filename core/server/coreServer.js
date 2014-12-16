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

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept();
}

function onAuthorizeFail(data, message, error, accept) {
    if (error) {
        throw new Error(message);
    }
    console.log('failed connecting to socket.io:', message);
    if (error) {
        accept(new Error(message));
    }
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