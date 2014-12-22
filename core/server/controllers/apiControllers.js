var Channel = require('../models/channel'),
    Users = require('../models/user').Users,
    User = require('../models/user').User,
    controllers;

controllers = {
    getUser: function (req, res) {
        Users.findById(req.params.id, function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                res.send(results);
            }
        });
    },
    getChannels: function (req, res) {
        Channel.Channels.findAll(function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                res.send(results);
            }
        });
    },
    getUserChannels: function (req, res) {
        //var user = req.user;
        //if (!user) {
        //    console.log('Unable to get user from req obj');
        //    res.status(401).send('Unable to get user from request');
        //    return;
        //}
        Users.findById(req.params.id, function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                if (!user.subscribed || user.subscribed.length == 0) {
                    res.status(200).send([]);
                    return;
                }
                Channel.Channels.findByIds(user.subscribed, function(err, data) {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    }
                    else {
                        res.status(200).send(data);
                    }
                });
            }
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
        channel.save(function (err, r) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
            console.log(r.insertedCount + ' channel created.'); // assert?
            owner.subscribeChannel(r._id, function(err, subscribe_r) {
                if (err) {
                    console.log('Channel ('+r._id+') created but failed to subscribe owner to channel:'+err);
                    res.status(500).send('Channel ('+r._id+') created but failed to subscribe owner to channel:'+err);
                    return;
                }
                res.status(201).send(r);
            });
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
        user.subscribeChannel(cid, function(err, r) {
            if (err) {
                console.log(err);
                res.status(500).send('Failed to subscribe to channel: '+err);
                return;
            }
            res.status(201).send(r);
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
        channel.getHistory(function (err, r) {
            if (err) {
                console.log(err);
                if (err.indexOf('unable to find') === 0) {
                    res.status(404).send(err);
                }
                else {
                    res.status(500).send(err);
                }
            }
            else {
                res.send(r);
            }
        });
    }
}

module.exports = controllers;