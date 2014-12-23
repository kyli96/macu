var express = require('express'),
    routes = require('../routes'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    authStrategies = require('./authStrategies'),
    authentication = require('./authentication'),
    messenger = require('./messenger'),
    exphbs = require('express-handlebars'),
    utils = require('../utils'),
    init;

init = function (coreApp, apiApp){
    authStragegies = authStrategies;

    coreApp.use(cookieParser());
    coreApp.use(bodyParser.json());
    coreApp.use(bodyParser.urlencoded({ extended: true }));
    coreApp.use(authentication.expressSession());
    coreApp.use(passport.initialize());
    coreApp.use(passport.session());
    
    var hbs = exphbs.create({
        defaultLayout: 'main',
        extname: '.hbs',
        layoutsDir: 'core/server/views/layouts/',
        helpers: {
            ifInDevMode: function (options) {
                if (utils.isDevMode(coreApp)) {
                    return options.fn(this);
                }
                return '';
            },
            ifInProdMode: function (options) {
                if (!utils.isDevMode(coreApp)) {
                    return options.fn(this);
                }
                return '';
            }
        }
    });
    coreApp.engine('hbs', hbs.engine);
    coreApp.set('view engine', 'hbs');

    coreApp.use('/messages', authentication.authorizeExpress());
    // coreApp.use('/api', authentication.authorizeExpress());
    
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