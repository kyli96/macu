var authentication = require('./authentication'),
    io,
    init;

function onConnection(socket) {
    var user = socket.request['user']; //from passport.socketio
    console.log(user.username + ' connected');
    socket.emit('profile', user);
    io.emit('chat message', 'bot', user.username + ' just walked in.');
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

    io.on('connection', function (socket){
        onConnection(socket);
    });
}

module.exports = init;