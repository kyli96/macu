var http = require('http');

function Lantern(rootApp) {
    this.rootApp = rootApp;
    this.httpServer = null;
    this.connections = {};
    this.connCounter = 0;
}

Lantern.prototype.start = function () {
    var self = this;

    var httpServer = http.Server(self.rootApp);
    self.httpServer = httpServer;

    self.httpServer.listen(4080, function () {
        self.rootApp.log.info('Lantern is listening at *:' + self.httpServer.address().port);
    });
}

module.exports = Lantern;
