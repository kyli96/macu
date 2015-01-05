var Channel = require('../models/channel'),
    User = require('../models/user').User,
    Users = require('../models/user').Users,
    Promise = require('bluebird'),
    Message = require('../models/message'),
    Hook = require('../models/hook'),
    MessageController = require('./messageControllers'),
    controllers;

controllers = {
    getUser: function (req, res) {
        User.findById(req.params.id).done(function (results) {
            res.send(results);
        }, function (err) {
            controllers.respondError(req, res, err);
        });
    },
    getChannels: function (req, res) {
        var domain = req.params.domain;
        var fn = Channel.Channels;
        if (req.query.countOnly) {
            fn = fn.countByDomain;
        }
        else {
            fn = fn.findByDomain;
        }
        fn(domain).done(function (results) {
            var r = results;
            if (req.query.countOnly) {
                r = { count: r };
            }
            res.send(r);
        }, function(err) {
            controllers.respondError(req, res, err);
        });
    },
    getUserChannels: function (req, res) {
        User.findById(req.params.id)
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
        var channel = new Channel.Channel(req.body);
        channel.save().then(function (obj) {
            req.log.info('channel ' + obj._id + ' created.');
            //if (channel.access == "public") {
            //    return Users.subscribeChannelForDomain(obj.domain, obj._id);
            //}
            return new Promise(function (resolve) { resolve(); })
        }).done(function(r) {
            MessageController.onNewChannel(channel);
            res.status(200).send(channel);
        }, function(err) {
            controllers.respondError(req, res, err);
        });
    },
    subscribeChannel: function (req, res) {
        var cid = req.body.channel_id;
        if (!cid) {
            controllers.respondError(req, res, 'missing channel_id');
            return;
        }
        User.findById(req.params.id)
        .then(function (user) {
            req.log.debug(user, 'subscribing channel for user.');
            return user.subscribeChannel(cid)
        }).then(function (r) {
            return Channel.Channel.findById(cid);
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
        var channel = new Channel.Channel({_id:id});
        channel.getHistory().done(function (r) {
            res.send(r);
        }, function(err) {
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
        else if (err.message.indexOf) {
            if (err.message.indexOf('missing ') === 0
                || err.message.indexOf('invalid ') === 0) {
                res_status = 400;
            }
            else if (err.message.indexOf('not found') > 0) {
                res_status = 404;
            }
        }
        res.status(res_status).send({ ok: false, error: err });
        req.log.error(err.message);
        req.log.debug({ req: req, res: res, err: err }, err.message);
    }
}

module.exports = controllers;