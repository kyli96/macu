var Channel = require('../models/channel'),
    Users = require('../models/user').Users,
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
    createChannel: function (req, res) {
        if (!req.body.name) {
            res.status(400).send('Missing channel name.');
            return;
        }
        var channel = new Channel.Channel(req.body);
        channel.save(function (err, r) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
            console.log(r.insertedCount + ' channel created.'); // assert?
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