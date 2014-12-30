var http = require('http'),
    Messenger = require('./middleware').Messenger;

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
    self.ioServer = new Messenger(httpServer, self.rootApp);
    self.ioServer.init();

    self.httpServer.listen(3000, function () {
        self.rootApp.log.info('Server listening at *:3000');
    });
}

module.exports = CoreServer;