var Channel = require('../models/channel'),
    User = require('../models/user'),
    Promise = require('bluebird'),
    Message = require('../models/message'),
    Hook = require('../models/hook'),
    MessageController = require('./messageControllers'),
    controllers;

controllers = {
    getUser: function (req, res) {
        User.findByIdAsync(req.params.id)
        .then(function (results) {
            res.send(results);
        }).catch(function (err) {
            controllers.respondError(req, res, err);
        });
    },
    getChannels: function (req, res) {
        var domain = req.params.domain;
        var promise;
        if (req.query.countOnly) {
            promise = Channel.getCountByDomain(domain);
        }
        else {
            promise = Channel.findByDomain(domain);
        }
        promise.then(function (results) {
            var r = results;
            if (req.query.countOnly) {
                r = { count: r };
            }
            res.send(r);
        }).catch(function (err) {
            controllers.respondError(req, res, err);
        });
    },
    getUserChannels: function (req, res) {
        User.findByIdAsync(req.params.id)
        .then(function (user) {
            req.log.debug(user, 'getting channels for user.');
            if (req.query.nonSubscribedOnly) {
                return user.getAvailableChannels();
            }
            return user.getChannels();
        }).then(function(data) {
            res.status(200).send(data);
        }).catch(function (err) {
            controllers.respondError(req, res, err);
        });
    },
    createChannel: function (req, res) {
        if (!req.body.name) {
            controllers.respondError(req, res, 'missing channel name');
            return;
        }
        var channel = new Channel(req.body);
        channel.saveAsync().spread(function (obj, count) {
            req.log.info('channel ' + obj._id + ' created.');
            return new Promise(function (resolve) { resolve(); })
        }).then(function(r) {
            MessageController.onNewChannel(channel);
            res.status(200).send(channel);
        }).catch(function(err) {
            controllers.respondError(req, res, err);
        });
    },
    subscribeChannel: function (req, res) {
        var cid = req.body.channel_id;
        if (!cid) {
            controllers.respondError(req, res, 'missing channel_id');
            return;
        }
        User.findByIdAsync(req.params.id)
        .then(function (user) {
            req.log.debug(user, 'subscribing channel for user.');
            return user.subscribeChannel(cid)
        }).then(function (r) {
            return Channel.findByIdAsync(cid);
        }).then(function (channel) {
            MessageController.joinUserToChannel(req.params.id, channel);
            req.log.debug(channel, 'successfully subscribed user to channel.');
            res.status(200).send({ ok: true, channel: channel });
        }).catch(function(err) {
            controllers.respondError(req, res, err);
        });
    },
    getChannelHistory: function (req, res) {
        var id = req.params.id;
        var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
        if (!hexCheck.test(id)) {
            controllers.respondError(req, res, 'invalid id');
            return;
        }
        Channel.findByIdAsync(id)
        .then(function (channel) {
            return channel.getHistory();
        }).then(function (r) {
            res.send(r);
        }).catch(function(err) {
            controllers.respondError(req, res, err);
        });
    },
    searchMessages: function (req, res) {
        Channel.getCountByDomain(req.params.domain)
        .then(function (count) {
            if (!count) {
                return Promise.reject('invalid domain or domain does not contain any channels');
            }
            return Message.search(req.params.domain, req.query.q.trim());
        }).then(function (messages) {
            req.log.info('Search messages returns ' + messages.length + ' results');
            req.log.debug({ req: req }, 'Search messages returns ' + messages.length + ' results');
            res.send(messages);
        }).catch(function(err) {
            controllers.respondError(req, res, err);
        });
    },
    postMessage: function (req, res) {
        if (!req.body.t_id) {
            controllers.respondError(req, res, 'missing target id');
            return;
        }
        var msg = new Message(req.body);
        var ts = msg.ts;
        MessageController.processNewMessage(msg, req.log).done(function () {
            res.status(200).send({ok: true, ts: ts, t_id: msg.t_id});
        }, function (err) {
            controllers.respondError(req, res, err);
        });
    },
    getHook: function (req, res) {
        if (!req.params.hook_id) {
            controllers.respondError(req, res, 'missing hook id');
            return;
        }
        Hook.findByIdAsync(req.params.hook_id)
        .then(function (obj) { 
            res.status(200).send(obj);
        }).catch(function (err) {
            controllers.respondError(req, res, err);
        });
    },
    createHook: function (req, res) {
        var hook = new Hook(req.body);
        hook.t_id = 'C' + req.params.channel_id;
        hook.saveAsync().spread(function (r, count) {
            req.log.info('new hook created');
            res.status(201).send({ ok: true, ts: r.updated_at, url: '/api/channel/' + req.params.channel_id + '/hook/' + r._id });
        }).catch(function (err) {
            controllers.respondError(req, res, err);
        });
    },
    updateHook: function (req, res) {
        Hook.findByIdAsync(req.params.hook_id)
        .then(function (obj) {
            for (var key in req.body) {
                if (key == '_id') {
                    continue;
                }
                obj.set(key, req.body[key]);
            }
            return obj.saveAsync();
        }).spread(function (obj, count) { 
            res.status(200).send(obj);
        }).catch(function (err) {
            controllers.respondError(req, res, err);
        });
    },
    respondError: function (req, res, err, status) {
        var res_status = 500;
        if (status) {
            res_status = status;
        }
        res.status(res_status).send({ ok: false, error: err });
        req.log.error(err.message);
        req.log.debug({ req: req, res: res, err: err }, err.message);
    }
}

module.exports = controllers;