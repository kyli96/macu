var express = require('express'),
    routes = require('../routes'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    authStrategies = require('./authStrategies'),
    authentication = require('./authentication'),
    Messenger = require('./messenger'),
    exphbs = require('express-handlebars'),
    Utils = require('../utils'),
    flash = require('connect-flash'),
    createReqLog,
    init;


init = function (coreApp, apiApp){
    authStragegies = authStrategies;
    
    coreApp.use(function (req, res, next) {
        req.log = Utils.createLogger('req', coreApp.log, req);
        next();
    });
    coreApp.use(cookieParser());
    coreApp.use(bodyParser.json());
    coreApp.use(bodyParser.urlencoded({ extended: true }));
    coreApp.use(authentication.expressSession());
    coreApp.use(passport.initialize());
    coreApp.use(passport.session());
    coreApp.use(flash());
    
    var hbs = exphbs.create({
        defaultLayout: 'main',
        extname: '.hbs',
        layoutsDir: 'core/server/views/layouts/',
        helpers: {
            ifInDevMode: function (options) {
                if (!Utils.isProdMode()) {
                    return options.fn(this);
                }
                return '';
            },
            ifInProdMode: function (options) {
                if (Utils.isProdMode(coreApp)) {
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
    
    apiApp.use(function (req, res, next) {
        req.log = Utils.createLogger('req', apiApp.log, req);
        next();
    });
    apiApp.use(routes.api());
    
    coreApp.use('/api', apiApp);

    coreApp.post('/login', 
        passport.authenticate('domain', { failureRedirect: '/', failureFlash: true }),
        function (req, res) {
            req.log.info('logging in ' + req.body.email);
        	res.redirect('/messages');
    });

    coreApp.use(routes.frontend());
}

module.exports = init;
module.exports.Messenger = Messenger;