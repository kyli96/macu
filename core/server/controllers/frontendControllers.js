var path = require('path'),
    passport = require('passport'),
    Promise = require('bluebird'),
    lookup = require('../utils').lookup,
    User = require('../models/user'),
    Channel = require('../models/channel'),
    controllers;

controllers = {
    showSignin: function (req, res) {
        res.render(path.join(__dirname, '/../views/login'), { layout: 'outside', user: req.user, message: req.flash('error') });
    },
    showSignup: function (req, res) {
        res.render(path.join(__dirname, '/../views/signup'), { layout: 'outside', user: req.user, message: req.flash('error') });
    },
    processSignup: function (req, res) {
        var domain = lookup(req.body, 'domain');
        var name = lookup(req.body, 'name');
        var email = lookup(req.body, 'email');
        var password = lookup(req.body, 'password');
        var confirm_password = lookup(req.body, 'confirm_password');

        if (!domain || !name || !email || !password || !confirm_password) {
            req.flash('error', 'Please fill in all fields.');
            res.redirect('/signup');
            return;
        }
        if (password != confirm_password) {
            req.flash('error', 'The passwords do not match.');
            res.redirect('/signup');
            return;
        }
        User.findBySignupInfo(domain.trim(), email.trim(), name.trim()).then(function (user){
            if (user && user._id) {
                if (user.email.trim() == email.trim()) {
                    req.flash('error', 'Your team already has a user with the same email.');
                }
                else if (user.name.trim() == name.trim()) {
                    req.flash('error', 'Your team already has a user with the same name.');
                }
                return Promise.reject();
            }
            var new_user = new User({ name: name, domain: domain, email: email, password:password });
            return new_user.saveAsync();
        }).spread(function (user, count) {
            Channel.getCountByDomain(domain)
            .then(function (count){
                if (count > 0) {
                    return new Promise(function (resolve) { resolve(); })
                }
                var general_channel = new Channel({ name: 'General', description: 'Something to get you started', domain: domain, owner: user._id });
                return general_channel.saveAsync();
            })
        }).then(function () {
            passport.authenticate('domain', { successRedirect: '/messages', failureRedirect: '/', failureFlash: true })(req, res);
        }).catch(function (err) {
            if (err) {
                req.log.warn(err, 'Unable to signup user.');
                req.flash('error', 'We are unable to process your request at the moment. Please try again later.');
            }
            res.redirect('/signup');
        });
    },
    showMessages: function (req, res) {
        var context = {
            user: req.user
        };
        res.render(path.join(__dirname, '/../views/messages'), context);
    }
}

module.exports = controllers;