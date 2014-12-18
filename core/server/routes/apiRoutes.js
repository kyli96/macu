var express = require('express'),
    apiControllers = require('../controllers/apiControllers'),
    apiRoutes;

apiRoutes = function (){
    var router = express.Router();
    router.get('/channel/:id/history', apiControllers.getChannelHistory);
    router.get('/channels', apiControllers.getChannels);
    router.post('/channels', apiControllers.createChannel);
    
    router.get('/user/:id', apiControllers.getUser)

    return router;
}

module.exports = apiRoutes;