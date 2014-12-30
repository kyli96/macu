var User = require('../models/user').User,
    Channel = require('../models/channel'),
    Message = require('../models/message'),
    Hook = require('../models/hook'),
    Promise = require('bluebird'),
    Request = require('request'),
    Url = require('url'),
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
        var msg = new Message(obj);
        messageControllers.processNewMessage(msg, socket).catch(function (err) {
            console.log('error while processing message:' + err.stack);
        });
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
    processNewMessage: function (msg, socket){
        var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
        if ((msg.t_id.substring(0,1) != 'C')
            || !hexCheck.test(msg.t_id.substring(1))) {
            console.log('invalid target id: ' + msg.t_id);
        }
        var getTarget;
        if (msg.t_id.substring(0, 1) == 'C') {
            getTarget = Channel.Channel.findById;
        }
        return getTarget(msg.t_id.substring(1)).then(function (target) {
                if (!target) {
                    return Promise.reject(new Error('target not found'));
                }
                return target.recordMsg(msg);
            }).then(function () {
                if (!socket) {
                    io.to(msg.t_id.substring(1)).emit('sendMsg', msg);
                }
                else {
                    socket.broadcast.to(msg.t_id.substring(1)).emit('sendMsg', msg);
                }
                messageControllers.processHooks(msg, ['mention']);
            });
    },
    processHooks: function (msg, events) {
        if (!msg || !events) {
            return;
        }
        return Hook.findByTargetId(msg.t_id).then(function (hooks) {
            if (!hooks) {
                return;
            }
            for (var i = 0; i < hooks.length; i++) {
                var hook = hooks[i];
                if (!hook.events) {
                    continue;
                }
                for (var j = 0; j < events.length; j++) {
                    if (hook.events.indexOf(events[j]) === -1) {
                        continue;
                    }
                    switch (events[j]) {
                        case 'mention':
                            if (msg.msg.toLowerCase().indexOf(hook.name.toLowerCase() + ':') === 0) {
                                Request.post({
                                    url: Url.parse(hook.config.url),
                                    json: true,
                                    body: {msg: msg.msg}
                                }, function (err, res, body) {
                                    if (err) {
                                        console.log('failed kicking hook ' + hook._id + ':' + err);
                                        return;
                                    }
                                    if (res.statusCode >= 300) {
                                        console.log('hook ' + hook._id + ' responded with ' + res.statusCode);
                                        return;
                                    }
                                    if (!body || !body.msg) {
                                        return;
                                    }
                                    var resMsg = new Message(body);
                                    resMsg.t_id = msg.t_id;
                                    resMsg.user_id = hook._id;
                                    resMsg.name = hook.name;
                                    messageControllers.processNewMessage(resMsg);
                                });
                            }
                            break;
                        default:
                            continue;
                    }
                }
            }
        });
    },
    init: function (mio) {
        io = mio;
    }
}

module.exports = messageControllers;