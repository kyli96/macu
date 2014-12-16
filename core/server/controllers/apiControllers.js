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
        var channel = new Channel.Channel(); // fill in data from req
        channel.save(function (err, r) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                console.log(r.insertedCount + ' channel created.'); // assert?
                res.status(201).send(r);
            }
        });
    }
}

module.exports = controllers;