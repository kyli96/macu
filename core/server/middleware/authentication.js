var cookieParser = require('cookie-parser'),
    passportSocketio = require('passport.socketio'),
    session = require('express-session'),
    MongoStore = require('connect-mongostore')(session),
    config = require('config'),
    authentication;

var sessionStore = new MongoStore(config.get('Core.mongoStoreConfig'));
var COOKIE_SECRET = config.get('Core.cookie.secret');

function onIoAuthorizeSuccess(data, next) {
    data.log.debug(data['user'].email + ' successful authorized connecting to socket.io');
    next();
}

function onIoAuthorizeFail(data, message, error, next) {
    data.log.warn('failed connecting to socket.io:', message);
    if (error)
        next(new Error(message));
}

authentication = {
    expressSession: function () {
        return session({
            store: sessionStore,
            secret: COOKIE_SECRET, 
            resave: false, 
            saveUninitialized: true
        });
    },
    authorizeIo: function () {
        return passportSocketio.authorize({
            cookieParser: cookieParser,
            store: sessionStore,
            secret: COOKIE_SECRET, 
            success: onIoAuthorizeSuccess,
            fail: onIoAuthorizeFail
        });
    },
    authorizeExpress: function () {
        return function (req, res, next) {
            if (req.isAuthenticated()) {
                req.log.debug('user ' + req.user.email + ' is authenticated.');
                return next();
            }
            req.log.info('user is not authenticated. redirecting to signin page.');
            res.redirect('/');
        }
    }
}

module.exports = authentication;
module.exports.sessionStore = sessionStore;