var User = require('../models/user').User,
    Channel = require('../models/channel'),
    messageControllers,
    io;

messageControllers = {
    onConnection: function (socket) {
        var user = new User(socket.request['user']); //from passport.socketio
        console.log(user.username + ' connected');
        var channels;
        Channel.Channels.findAll(function (err, data) {
            if (err) {
                console.log('Unable to get channels for user ' + user.username);
            }
            else {
                for (var i = 0; i < data.length; i++) {
                    socket.join(data[i]._id);
                }
            }
        });
        socket.emit('profile', user);
    },
    onDisconnection: function () {
        console.log('user disconnected');
    },
    onSendMsg: function (obj) {
        if (!obj.t_id) {
            console.log('Missing t_id. All msgs should have target id.');
            return;
        }
        var channel = new Channel.Channel({ _id: obj.t_id });
        channel.recordMsg(obj, function (err, r) {
            if (err) {
                console.log('Failed to record message:' + err);
            }
        });
        io.to(obj.t_id).emit('sendMsg', obj);
    },
    init: function (mio) {
        io = mio;
    }
}

module.exports = messageControllers;