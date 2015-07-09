var path = require('path');
var passport = require('passport');
var Promise = require('bluebird');
var lookup = require('../utils').lookup;
var User = require('../models/user');
var Channel = require('../models/channel');
var Team = require('../models/team');
var controllers;

controllers = {
    showSignin: function (req, res) {
        res.render(path.join(__dirname, '/../views/login'), 
            { layout: 'outside', user: req.user, locale: req.locale, message: req.flash('error'), show: 'login' });
    },
    showSignup: function (req, res) {
        res.render(path.join(__dirname, '/../views/login'), 
            { layout: 'outside', user: req.user, locale: req.locale, message: req.flash('error'), show: 'signup' });
    },
    processSignup: function (req, res) {
        var domain = lookup(req.body, 'domain');
        var name = lookup(req.body, 'name');
        var email = lookup(req.body, 'email');
        var password = lookup(req.body, 'password');
        var confirm_password = lookup(req.body, 'confirm_password');
        var team = null;
        var user = null;

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
        Team.findByName(domain.trim()).then(function (team) {
            if (team && team._id) {
                req.flash('error', 'There\'s already a Team ' + domain.trim() + '.');
                return Promise.reject();
            }
            return User.findOneAsync({ email: email.trim() });
        }).then(function (existing_user){
            if (existing_user && existing_user._id) {
                if (!existing_user.authenticate(password)) {
                    req.flash('error', 'Your passwod does not match our record.');
                    return Promise.reject();
                }
                return Promise.resolve([existing_user, 1]);
            }
            var new_user = new User({ name: name, domain: domain, email: email, password:password });
            req.log.info(new_user, 'Creating new user');
            return new_user.saveAsync();
        }).spread(function (new_user, count) {
            user = new_user;
            var new_team = new Team({ name: domain.trim(), owner: user._id });
            req.log.info(new_team, 'Creating new team');
            return new_team.saveAsync();
        }).spread(function (new_team, count) {
            team = new_team;
            Channel.getIncludeAllChannels(user.domain)
            .then(function (channels){
                if (channels && channels.length > 0) {
                    req.log.debug(channels, 'Subscribing new user to includeAll channels.');
                    var channel_ids = [];
                    for (var i = 0; i < channels.length; i++) {
                        channel_ids.push(channels[i]._id);
                    }
                    return user.subscribeChannels(channel_ids);
                }
                var general_channel = new Channel({
                    name: 'General', 
                    description: 'Something to get you started', 
                    domain: domain, 
                    owner: user._id,
                    includeAll: true
                });
                req.log.debug(general_channel, 'Creating general channel for new domain.');
                return general_channel.saveAsync();
            }).finally(function (err) {
                // swallowing channel errors
                passport.authenticate('domain', { successRedirect: '/messages', failureRedirect: '/', failureFlash: true })(req, res);
            });
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
            user: req.user,
            locale: req.locale
        };
        res.render(path.join(__dirname, '/../views/messages'), context);
    }
}

module.exports = controllers;