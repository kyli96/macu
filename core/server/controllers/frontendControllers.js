var path = require('path'),
    controllers;

controllers = {
    showSignin: function (req, res) {
        res.sendFile(path.join(__dirname, '/../../client/html/index.html'));
    }
}

module.exports = controllers;