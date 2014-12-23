var Channel = require('../models/channel'),
    Users = require('../models/user').Users,
    User = require('../models/user').User,
    controllers;

controllers = {
    getUser: function (req, res) {
        Users.findById(req.params.id).done(function (results) {
            res.send(results);
        }, function (err) {
            console.log(err);
            res.status(500).send(err);
        });
    },
    getChannels: function (req, res) {
        Channel.Channels.findAll().done(function (results) {
            res.send(results);
        }, function(err) {
            console.log(err);
            res.status(500).send(err);
        });
    },
    getUserChannels: function (req, res) {
        //var user = req.user;
        //if (!user) {
        //    console.log('Unable to get user from req obj');
        //    res.status(401).send('Unable to get user from request');
        //    return;
        //}
        Users.findById(req.params.id)
            .then(function (user) {
                if (!user.subscribed || user.subscribed.length == 0) {
                    return [];
                }
                return Channel.Channels.findByIds(user.subscribed);
            }).done(function(data) {
                res.status(200).send(data);
            }, function(err) {
                console.log(err);
                res.status(500).send(err);
            });
    },
    createChannel: function (req, res) {
        if (!req.body.name) {
            res.status(400).send('Missing channel name.');
            return;
        }
        var channel = new Channel.Channel(req.body);
        // set owner using session instead
        var owner = new User({_id: req.body.owner});
        channel.save().then(function (r) {
            console.log(r.insertedCount + ' channel created.');
            return owner.subscribeChannel(r._id);
        }).done(function(r) {
            res.status(201).send(r);
        }, function(err) {
            console.log(err);
            res.status(500).send(err);
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
            res.status(400).send('Missing channel_id');
            return;
        }
        if (!User.prototype.isPrototypeOf(user)) {
            user = new User(user);
        }
        user.subscribeChannel(cid).done(function(r) {
            res.status(201).send(r);
        }, function(err) {
            console.log(err);
            res.status(500).send('Failed to subscribe to channel: '+err);
        });
    },
    getChannelHistory: function (req, res) {
        var id = req.params.id;
        var hexCheck = new RegExp('^[0-9a-fA-F]{24}$');
        if (!hexCheck.test(id)) {
            res.status(400).send({ error: 'invalid id' });
            return;
        }
        var channel = new Channel.Channel({_id:id});
        channel.getHistory().done(function (r) {
            res.send(r);
        }, function(err) {
            console.log(err);
            if (err.indexOf('unable to find') === 0) {
                res.status(404).send(err);
            }
            else {
                res.status(500).send(err);
            }
        });
    }
}

module.exports = controllers;