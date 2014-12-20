var authentication = require('./authentication'),
    messageControllers = require('../controllers/messageControllers'),
    io,
    init;

function onConnection(socket) {
    messageControllers.onConnection(socket);
    setHandlers(socket);
}

function setHandlers(socket) {
    socket.on('disconnect', messageControllers.onDisconnection);
    socket.on('sendMsg', messageControllers.onSendMsg.bind(socket));
}

init = function (ioServer) {
    io = ioServer;
    io.use(authentication.authorizeIo());
    messageControllers.init(io);
    io.on('connection', onConnection);
}

module.exports = init;