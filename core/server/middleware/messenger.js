var authentication = require('./authentication'),
    messageControllers = require('../controllers/messageControllers'),
    io,
    init;

function onConnection(socket) {
    messageControllers.onConnection(socket);
    setHandlers(socket);
}

function setHandlers(socket) {
    socket.on('disconnect', function (){
        console.log('user disconnected');
        io.emit('chat message', 'bot', 'someone just left.');
    });
    socket.on('chat message', function(user, msg){
        io.emit('chat message', user, msg);
    });
}

init = function (ioServer) {
    io = ioServer;
    io.use(authentication.authorizeIo());
    messageControllers.init(io);
    io.on('connection', onConnection);
}

module.exports = init;