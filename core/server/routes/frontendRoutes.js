var express = require('express'),
    path = require('path'),
    frontendControllers = require('../controllers/frontendControllers'),
    frontendRoutes;

frontendRoutes = function (){
    var router = express.Router();
    router.use('/js', express.static(path.join(__dirname, '/../../client/js')));
    router.use('/css', express.static(path.join(__dirname, '/../../client/css')));

    router.get('/', frontendControllers.showSignin);
    router.use('/messages', express.static(path.join(__dirname, '/../../client/html/messages')));
    return router;
}

module.exports = frontendRoutes;