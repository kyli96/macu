var User = require('../models/user').User,
    messageControllers,
    io;

messageControllers = {
    onConnection: function (socket) {
        var user = new User(socket.request['user']); //from passport.socketio
        console.log(user.username + ' connected');
        socket.emit('profile', user);
        io.emit('sendMsg', { username: 'bot', name: 'bot', msg: user.name + ' just walked in.' });
    },
    onDisconnection: function () {
        console.log('user disconnected');
        io.emit('sendMsg', { username: 'bot', name: 'bot', msg: 'someone just left.' });
    },
    onSendMsg: function (obj) {
        io.emit('sendMsg', obj);
    },
    init: function (mio) {
        io = mio;
    }
}

module.exports = messageControllers;