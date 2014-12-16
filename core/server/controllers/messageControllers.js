var User = require('../models/user').User,
    messageControllers,
    io;

messageControllers = {
    onConnection: function (socket) {
        var user = new User(socket.request['user']); //from passport.socketio
        console.log(user.username + ' connected');
        socket.emit('profile', user);
        io.emit('chat message', 'bot', user.username + ' just walked in.');
    },
    init: function (mio) {
        io = mio;
    }
}

module.exports = messageControllers;