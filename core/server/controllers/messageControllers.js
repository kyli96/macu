var User = require('../models/user').User,
    Channel = require('../models/channel'),
    Message = require('../models/message'),
    messageControllers,
    connected_users = {},
    io;

messageControllers = {
    onConnection: function (socket, user) {
        console.log(user.username + ' connected');
        if (!connected_users['' + user.domain]) {
            connected_users['' + user.domain] = { users: {} };
        }
        connected_users['' + user.domain].users["" + user._id] = { socket: socket };
        user.getChannels().done(function (data) {
            for (var i = 0; i < data.length; i++) {
                console.log('joining channel '+data[i]._id);
                socket.join(data[i]._id);
            }
        }, function (err) { 
            console.log('Unable to get channels for user ' + user.username);
        });
        socket.emit('profile', user);
    },
    onDisconnection: function (user) {
        if (connected_users['' + user.domain]) {
            connected_users['' + user.domain].users['' + user._id] = null;
        }
        console.log(user.name + ' disconnected');
    },
    onSendMsg: function (obj) {
        var socket = this;
        if (!obj.t_id) {
            console.log('Missing t_id. All msgs should have target id.');
            return;
        }
        var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
        if ((obj.t_id.substring(0,1) != 'C')
            || !hexCheck.test(obj.t_id.substring(1))) {
            console.log('invalid target id: ' + obj.t_id);
        }
        var getTarget;
        if (obj.t_id.substring(0, 1) == 'C') {
            getTarget = Channel.Channel.findById;
        }
        getTarget(obj.t_id.substring(1)).then(function (target) {
            if (!target) {
                return Promise.reject(new Error('target not found'));
            }
            var msg = new Message(obj);
            return target.recordMsg(msg);
        }).catch(function (err) {
            console.log('Failed to record message:' + err.stack);
        });
        socket.broadcast.to(obj.t_id.substring(1)).emit('sendMsg', obj);
    },
    onNewChannel: function (channel) {
        if (channel.access == 'public' && connected_users['' + channel.domain] && connected_users['' + channel.domain].users) {
            var users = connected_users['' + channel.domain].users;
            for (user_id in users) {
                if (users[user_id].socket) {
                    users[user_id].socket.join(channel._id);
                    users[user_id].socket.emit('newChannel', channel);
                }
            }
        }
    },
    init: function (mio) {
        io = mio;
    }
}

module.exports = messageControllers;