var path = require('path'),
    controllers;

controllers = {
    showSignin: function (req, res) {
        res.sendFile(path.join(__dirname, '/../../client/html/index.html'));
    },
    showMessages: function (req, res) {
        var context = {
            user: req.user
        };
        res.render(path.join(__dirname, '/../views/messages'), context);
    }
}

module.exports = controllers;