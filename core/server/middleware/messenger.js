var authentication = require('./authentication'),
    messageControllers = require('../controllers/messageControllers'),
    User = require('../models/user').User,
    io,
    init;

function onConnection(socket) {
    var user = new User(socket.request['user']); //from passport.socketio
    messageControllers.onConnection(socket, user);
    setHandlers(socket, user);
}

function setHandlers(socket, user) {
    socket.on('disconnect', function () { messageControllers.onDisconnection(user); });
    socket.on('sendMsg', messageControllers.onSendMsg.bind(socket));
}

init = function (ioServer) {
    io = ioServer;
    io.use(authentication.authorizeIo());
    messageControllers.init(io);
    io.on('connection', onConnection);
}

module.exports = init;