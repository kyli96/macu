var express = require('express'),
    path = require('path'),
    frontendControllers = require('../controllers/frontendControllers'),
    frontendRoutes;

frontendRoutes = function (){
    var router = express.Router();
    router.use('/js', express.static(path.join(__dirname, '/../../client/js')));
    router.use('/css', express.static(path.join(__dirname, '/../../client/css')));
    router.use('/fonts', express.static(path.join(__dirname, '/../../client/fonts')));

    router.get('/', frontendControllers.showSignin);
    router.get('/messages', frontendControllers.showMessages);
    return router;
}

module.exports = frontendRoutes;