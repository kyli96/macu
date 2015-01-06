var User = require('../models/user'),
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
        var log = socket.request.log;
        log.info(user.email + ' connected');
        if (!connected_users['' + user.domain]) {
            connected_users['' + user.domain] = { connections: {} };
        }
        connected_users['' + user.domain].connections["" + socket.id] = { socket: socket, user_id: user._id };
        socket.emit('profile', user);
        user.getChannels().done(function (data) {
            for (var i = 0; i < data.length; i++) {
                log.debug('joining channel ' + data[i]._id);
                socket.join(data[i]._id);
            }
        }, function (err) {
            log.error('Unable to get channels for user ' + user.email);
        });
    },
    onDisconnection: function (socket, user) {
        var log = socket.request.log;
        if (connected_users['' + user.domain]) {
            connected_users['' + user.domain].connections['' + socket.id] = null;
        }
        log.info(user.name + ' disconnected');
    },
    onSendMsg: function (obj) {
        var socket = this;
        var log = socket.request.log;
        if (!obj.t_id) {
            log.error('Missing t_id. All msgs should have target id.');
            return;
        }
        var msg = new Message(obj);
        messageControllers.processNewMessage(msg, log, socket).catch(function (err) {
            log.error('error while processing message:' + err.stack);
        });
    },
    onNewChannel: function (channel) {
        if (channel.access == 'public' && connected_users['' + channel.domain] && connected_users['' + channel.domain].connections) {
            var connections = connected_users['' + channel.domain].connections;
            for (var socket_id in connections) {
                if (connections[socket_id] && connections[socket_id].socket) {
                    if (('' + connections[socket_id].user_id) == ('' + channel.owner)) {
                        connections[socket_id].socket.join(channel._id);
                    }
                    connections[socket_id].socket.emit('newChannel', channel);
                }
            }
        }
    },
    onCreateChannel: function (data) {
        var socket = this;
        var log = socket.request.log;
        var channel = new Channel(data);
        channel.saveAsync()
        .spread(function (obj, count) {
            log.info('channel ' + obj._id + ' created.');
            return new Promise(function (resolve) { resolve(); })
        }).then(function(r) {
            messageControllers.onNewChannel(channel);
        }).catch(function(err) {
            log.error(err, 'failed creating channel');
        });
    },
    joinUserToChannel: function (user_id, channel) {
        if (connected_users['' + channel.domain] && connected_users['' + channel.domain].connections) {
            var connections = connected_users['' + channel.domain].connections;
            for (var socket_id in connections) {
                if (connections[socket_id] 
                    && connections[socket_id].socket
                    && ('' + connections[socket_id].user_id) == ('' + user_id)) {
                    connections[socket_id].socket.join(channel._id);
                }
            }
        }
    },
    processNewMessage: function (msg, logger, socket){
        var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
        if ((msg.t_id.substring(0,1) != 'C')
            || !hexCheck.test(msg.t_id.substring(1))) {
            logger.error('invalid target id: ' + msg.t_id);
            return Promise.reject(new Error('invalid target id: ' + msg.t_id));
        }
        var getTarget;
        if (msg.t_id.substring(0, 1) == 'C') {
            getTarget = Channel.findByIdAsync(msg.t_id.substring(1));
        }
        return getTarget
        .then(function (target) {
            if (!target) {
                return Promise.reject(new Error('target not found'));
            }
            return target.recordMsg(msg);
        }).then(function (doc) {
            logger.debug(doc, 'broadcast new message');
            if (!socket) {
                io.to(doc.t_id.substring(1)).emit('sendMsg', doc);
            }
            else {
                socket.broadcast.to(doc.t_id.substring(1)).emit('sendMsg', doc);
            }
            messageControllers.processHooks(doc, ['mention'], logger);
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
                            if (msg.msg.toLowerCase().indexOf(hook.name.toLowerCase() + ':') === 0
                                || msg.msg.toLowerCase().indexOf(hook.name.toLowerCase() + ',') === 0) {
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