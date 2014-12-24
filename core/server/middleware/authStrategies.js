var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/user').User;

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, fn) {
    User.findById(id).done(function(user) {
        fn(null, user);
    }, function(err) {
        fn(err);
    });
});

passport.use(new LocalStrategy(function(username, password, fn) {
    User.findByCredentials(username, password).done(function(user) {
        fn(null, user);
    }, function (err){
        fn(err);
    })
}));