var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Users = require('../models/user').Users;

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, fn) {
    Users.findById(id).done(function(user) {
        fn(null, user);
    }, function(err) {
        fn(err);
    });
});

passport.use(new LocalStrategy(function(username, password, fn) {
    Users.findByCredentials(username, password).done(function(user) {
        fn(null, user);
    }, function (err){
        fn(err);
    })
}));