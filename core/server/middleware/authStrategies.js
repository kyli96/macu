var passport = require('passport'),
    Strategy = require('passport-strategy'),
    util = require('util'),
    lookup = require('../utils').lookup,
    User = require('../models/user').User;

function DomainStrategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) { throw new TypeError('Missing verify callback'); }
    
    Strategy.Strategy.call(this);
    this.name = 'domain';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
}

util.inherits(DomainStrategy, Strategy.Strategy);

DomainStrategy.prototype.authenticate = function (req, options) {
    options = options || {};
    var domain = lookup(req.body, 'domain') || lookup(req.query, 'domain');
    var username = lookup(req.body, 'username') || lookup(req.query, 'username');
    var password = lookup(req.body, 'password') || lookup(req.query, 'password');
    
    if (!domain || !username || !password) {
        return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
    }
    
    var self = this;
    
    function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
    }
    
    try {
        if (self._passReqToCallback) {
            this._verify(req, domain, username, password, verified);
        } else {
            this._verify(domain, username, password, verified);
        }
    } catch (ex) {
        return self.error(ex);
    }
};


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

passport.use(new DomainStrategy(function(domain, username, password, fn) {
    User.findByCredentials(domain, username, password).done(function (user) {
        if (!user) {
            fn(null, false, { message: 'The info you provided does not match our record. Please try again.' });
            return;
        }
        fn(null, user);
    }, function (err){
        fn(err);
    })
}));