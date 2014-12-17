var User = require('../models/user').User,
    messageControllers,
    io;

messageControllers = {
    onConnection: function (socket) {
        var user = new User(socket.request['user']); //from passport.socketio
        console.log(user.username + ' connected');
        socket.emit('profile', user);
        io.emit('receiveMessage', { username: 'bot', name: 'bot', msg: user.name + ' just walked in.' });
    },
    onDisconnection: function () {
        console.log('user disconnected');
        io.emit('receiveMessage', { username: 'bot', name: 'bot', msg: 'someone just left.' });
    },
    onMessage: function (obj) {
        io.emit('receiveMessage', obj);
    },
    init: function (mio) {
        io = mio;
    }
}

module.exports = messageControllers;