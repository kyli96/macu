var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Users = require('../models/user').Users;

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    Users.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(Users.findByCredentials));