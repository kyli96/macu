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
        socket.request.log.info(user.username + ' connected');
        if (!connected_users['' + user.domain]) {
            connected_users['' + user.domain] = { users: {} };
        }
        connected_users['' + user.domain].users["" + user._id] = { socket: socket };
        user.getChannels().done(function (data) {
            for (var i = 0; i < data.length; i++) {
                socket.request.log.info('joining channel '+data[i]._id);
                socket.join(data[i]._id);
            }
        }, function (err) { 
            socket.request.log.error('Unable to get channels for user ' + user.username);
        });
        socket.emit('profile', user);
    },
    onDisconnection: function (socket, user) {
        if (connected_users['' + user.domain]) {
            connected_users['' + user.domain].users['' + user._id] = null;
        }
        socket.request.log.info(user.name + ' disconnected');
    },
    onSendMsg: function (obj) {
        var socket = this;
        if (!obj.t_id) {
            socket.request.log.error('Missing t_id. All msgs should have target id.');
            return;
        }
        var msg = new Message(obj);
        messageControllers.processNewMessage(msg, socket.request.log, socket).catch(function (err) {
            socket.request.log.error('error while processing message:' + err.stack);
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
    processNewMessage: function (msg, logger, socket){
        var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
        if ((msg.t_id.substring(0,1) != 'C')
            || !hexCheck.test(msg.t_id.substring(1))) {
            socket.request.log.error('invalid target id: ' + msg.t_id);
            return;
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
                messageControllers.processHooks(msg, ['mention'], logger);
            });
    },
    processHooks: function (msg, events, logger) {
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
                                        logger.warn('failed kicking hook ' + hook._id + ':' + err);
                                        return;
                                    }
                                    if (res.statusCode >= 300) {
                                        logger.warn('hook ' + hook._id + ' responded with ' + res.statusCode);
                                        return;
                                    }
                                    if (!body || !body.msg) {
                                        return;
                                    }
                                    var resMsg = new Message(body);
                                    resMsg.t_id = msg.t_id;
                                    resMsg.user_id = hook._id;
                                    resMsg.name = hook.name;
                                    messageControllers.processNewMessage(resMsg, logger);
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