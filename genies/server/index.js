﻿var express = require('express'),
    bodyParser = require('body-parser'),
    Lantern = require('./lantern'),
    Utils = require('../../core/server/utils'),
    dummyBot,
    routes;

dummyBot = function (req, res) {
    req.log.debug(req);
    var payload = req.body;
    if (payload.msg.toLowerCase().indexOf('what is the unix time now?') !== -1) {
        res.send({ msg: 'it\'s ' + Date.now() + '.' });
        return;
    }
    res.send({ msg: 'woot woot!' });
}
routes = function () {
    var router = express.Router();
    router.post('/genies/dummyBot', dummyBot);

    return router;
}

function init(options){
    var app = express();
    app.log = Utils.createLogger('geniesApp');
    app.use(function (req, res, next) {
        req.log = Utils.createLogger('req', app.log, req);
        next();
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(routes());

    return new Lantern(app);
}

module.exports = init;