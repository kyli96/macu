var cookieParser = require('cookie-parser'),
    passportSocketio = require('passport.socketio'),
    session = require('express-session'),
    authentication;

var sessionStore = new session.MemoryStore();
var COOKIE_SECRET = 'little secret';

function onIoAuthorizeSuccess(data, accept) {
    console.log(data['user'].username + ' successful connection to socket.io');
    accept();
}

function onIoAuthorizeFail(data, message, error, accept) {
    console.log('failed connecting to socket.io:', message);
    if (error)
        accept(new Error(message));
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
                console.log('user ' + req.user.username + ' is authenticated.');
                return next();
            }
            console.log('user is not authenticated. redirecting to signin page.');
            res.redirect('/');
        }
    }
}

module.exports = authentication;
module.exports.sessionStore = sessionStore;