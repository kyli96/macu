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
        //var user = req.user;
        //if (!user) {
        //    req.log.info('Unable to get user from req obj');
        //    res.status(401).send('Unable to get user from request');
        //    return;
        //}
        User.findById(req.params.id)
            .then(function (user) {
                req.log.debug(user, 'getting channels for user.');
                return user.getChannels();
            }).done(function(data) {
                res.status(200).send(data);
            }, function(err) {
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
        //var user = req.user;
        //if (!user) {
        //    req.log.info('Unable to get user from req obj');
        //    res.status(401).send('Unable to get user from request');
        //    return;
        //}
        var user = new User({_id:req.params.id});
        var cid = req.body.channel_id;
        if (!cid) {
            controllers.respondError(req, res, 'missing channel_id');
            return;
        }
        if (!User.prototype.isPrototypeOf(user)) {
            user = new User(user);
        }
        user.subscribeChannel(cid).done(function(r) {
            res.status(200).send(r);
        }, function(err) {
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
        Hook.findById(req.params.hook_id).done(function (obj) { 
            res.status(200).send(obj.getView());
        }, function(err) {
            controllers.respondError(req, res, err);
        });
    },
    createHook: function (req, res) {
        var hook = new Hook(req.body);
        hook.t_id = 'C' + req.params.channel_id;
        hook.save().then(function (r) {
            var status = 200;
            if (!req.body._id) {
                status = 201;
                req.log.info('new hook created');
            } else {
                req.log.info('hook ' + req.body._id + ' updated');
            }
            res.status(status).send({ ok: true, ts: r.updated_at, url: '/api/channel/' + req.params.channel_id + '/hook/' + r._id });
        }).catch(function (err) {
            controllers.respondError(req, res, err);
        });
    },
    respondError: function (req, res, err, status) {
        var res_status = 500;
        if (status) {
            res_status = status;
        }
        else if (err.message.indexOf('missing ') === 0
            || err.message.indexOf('invalid ') === 0) {
            res_status = 400;
        }
        else if (err.message.indexOf('not found') > 0) {
            res_status = 404;
        }
        res.status(res_status).send({ ok: false, error: err });
        req.log.error(err.message);
        req.log.debug({ req: req, res: res, err: err }, err.message);
    }
}

module.exports = controllers;