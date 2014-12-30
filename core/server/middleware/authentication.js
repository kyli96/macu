var cookieParser = require('cookie-parser'),
    passportSocketio = require('passport.socketio'),
    session = require('express-session'),
    authentication;

var sessionStore = new session.MemoryStore();
var COOKIE_SECRET = 'little secret';

function onIoAuthorizeSuccess(data, next) {
    data.log.info(data['user'].username + ' successful connection to socket.io');
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
                req.log.info('user ' + req.user.username + ' is authenticated.');
                return next();
            }
            req.log.info('user is not authenticated. redirecting to signin page.');
            res.redirect('/');
        }
    }
}

module.exports = authentication;
module.exports.sessionStore = sessionStore;