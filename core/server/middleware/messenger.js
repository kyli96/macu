var authentication = require('./authentication'),
    sio = require('socket.io'),
    messageControllers = require('../controllers/messageControllers'),
    User = require('../models/user').User,
    Utils = require('../utils');

function IoServer(httpServer, expApp) {
    this.io = sio(httpServer);
    this.app = expApp;
}

IoServer.prototype.setLogger = function () {
    var self = this;
    return function (socket, next) {
        socket.request.log = self.app.log.child({ socket_id: socket.id });
        next();
    };
}

IoServer.onConnection = function (socket) {
    var user = new User(socket.request['user']); //from passport.socketio
    messageControllers.onConnection(socket, user);
    IoServer.setHandlers(socket, user);
}

IoServer.setHandlers = function (socket, user) {
    socket.on('disconnect', function () { messageControllers.onDisconnection(socket, user); });
    socket.on('sendMsg', messageControllers.onSendMsg.bind(socket));
    socket.on('createChannel', messageControllers.onCreateChannel.bind(socket));
}

IoServer.prototype.init = function () {
    var self = this;
    self.io.use(self.setLogger());
    self.io.use(authentication.authorizeIo());
    messageControllers.init(self.io);
    self.io.on('connection', IoServer.onConnection);
}

module.exports = IoServer;