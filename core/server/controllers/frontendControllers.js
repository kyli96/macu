var path = require('path'),
    controllers;

controllers = {
    showSignin: function (req, res) {
        res.render(path.join(__dirname, '/../views/login'), { layout: 'outside', user: req.user, message: req.flash('error') });
    },
    showMessages: function (req, res) {
        var context = {
            user: req.user
        };
        res.render(path.join(__dirname, '/../views/messages'), context);
    }
}

module.exports = controllers;