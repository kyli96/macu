var express = require('express'),
    routes = require('../routes'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    authStrategies = require('./authStrategies'),
    authentication = require('./authentication'),
    messenger = require('./messenger'),
    init;

init = function (coreApp, apiApp){
    authStragegies = authStrategies;

    coreApp.use(cookieParser());
    coreApp.use(bodyParser.urlencoded({ extended: true }));
    coreApp.use(authentication.expressSession());
    coreApp.use(passport.initialize());
    coreApp.use(passport.session());
    coreApp.use('/messages', authentication.authorizeExpress());
    
    apiApp.use(routes.api());
    
    coreApp.use('/api', apiApp);

    coreApp.post('/login', 
        passport.authenticate('local', { failureRedirect: '/' }),
        function (req, res) {
            console.log('logging in ' + req.body.username);
        	res.redirect('/messages');
    });

    coreApp.use(routes.frontend());
}

module.exports = init;
module.exports.messenger = messenger;