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
            controllers.respondError(res, err);
        });
    },
    getChannels: function (req, res) {
        var domain = req.params.domain;
        Channel.Channels.findByDomain(domain).done(function (results) {
            res.send(results);
        }, function(err) {
            controllers.respondError(res, err);
        });
    },
    getUserChannels: function (req, res) {
        //var user = req.user;
        //if (!user) {
        //    console.log('Unable to get user from req obj');
        //    res.status(401).send('Unable to get user from request');
        //    return;
        //}
        User.findById(req.params.id)
            .then(function (user) {
                return user.getChannels();
            }).done(function(data) {
                res.status(200).send(data);
            }, function(err) {
                controllers.respondError(res, err);
            });
    },
    createChannel: function (req, res) {
        if (!req.body.name) {
            controllers.respondError(res, 'missing channel name');
            return;
        }
        var channel = new Channel.Channel(req.body);
        // set owner using session instead
        var owner = new User({_id: req.body.owner});
        channel.save().then(function (r) {
            console.log(r.insertedCount + ' channel created.');
            if (channel.access == "public") {
                return Users.subscribeChannelForDomain(channel.domain, channel._id);
            }
            return new Promise(function (resolve) { resolve(); })
        }).done(function(r) {
            MessageController.onNewChannel(channel);
            res.status(200).send(channel);
        }, function(err) {
            controllers.respondError(res, err);
        });
    },
    subscribeChannel: function (req, res) {
        //var user = req.user;
        //if (!user) {
        //    console.log('Unable to get user from req obj');
        //    res.status(401).send('Unable to get user from request');
        //    return;
        //}
        var user = new User({_id:req.params.id});
        var cid = req.body.channel_id;
        if (!cid) {
            controllers.respondError(res, 'missing channel_id');
            return;
        }
        if (!User.prototype.isPrototypeOf(user)) {
            user = new User(user);
        }
        user.subscribeChannel(cid).done(function(r) {
            res.status(200).send(r);
        }, function(err) {
            controllers.respondError(res, err);
        });
    },
    getChannelHistory: function (req, res) {
        var id = req.params.id;
        var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
        if (!hexCheck.test(id)) {
            controllers.respondError(res, 'invalid id');
            return;
        }
        var channel = new Channel.Channel({_id:id});
        channel.getHistory().done(function (r) {
            res.send(r);
        }, function(err) {
            controllers.respondError(res, err);
        });
    },
    postMessage: function (req, res) {
        if (!req.body.t_id) {
            controllers.respondError(res, 'missing target id');
            return;
        }
        var msg = new Message(req.body);
        var ts = msg.ts;
        MessageController.processNewMessage(msg).done(function () {
            res.status(200).send({ok: true, ts: ts, t_id: msg.t_id});
        }, function (err) {
            controllers.respondError(res, err);
        });
    },
    getHook: function (req, res) {
        if (!req.params.hook_id) {
            controllers.respondError(res, 'missing hook id');
            return;
        }
        Hook.findById(req.params.hook_id).done(function (obj) { 
            res.status(200).send(obj);
        }, function(err) {
            controllers.respondError(res, err);
        });
    },
    createHook: function (req, res) {
        var hook = new Hook(req.body);
        hook.t_id = 'C' + req.params.channel_id;
        hook.save().then(function (r) {
            var status = 200;
            if (!req.body._id) {
                status = 201;
                console.log('new hook created');
            } else {
                console.log('hook ' + req.body._id + ' updated');
            }
            res.status(status).send({ ok: true, ts: r.updated_at, url: '/api/channel/' + req.params.channel_id + '/hook/' + r._id });
        }).catch(function (err) {
            controllers.respondError(res, err);
        });
    },
    respondError: function (res, err, status) {
        console.log(err);
        var res_status = 500;
        if (status) {
            res_status = status;
        }
        else if (err.indexOf('missing ') === 0
            || err.indexOf('invalid ') === 0) {
            res_status = 400;
        }
        else if (err.indexOf('not found') > 0) {
            res_status = 404;
        }
        res.status(res_status).send({ ok: false, error: err });
    }
}

module.exports = controllers;