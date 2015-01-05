var express = require('express'),
    apiControllers = require('../controllers/apiControllers'),
    apiRoutes;

apiRoutes = function (){
    var router = express.Router();
    router.get('/channel/:id/history', apiControllers.getChannelHistory);
    router.get('/:domain/channels', apiControllers.getChannels);
    router.get('/user/:id/channels', apiControllers.getUserChannels);
    router.post('/channels', apiControllers.createChannel);
    
    router.get('/user/:id', apiControllers.getUser)
    router.put('/user/:id', function (req, res) {
        if (req.body.action == 'subscribeChannel') {
            apiControllers.subscribeChannel(req, res);
            return;
        }
        res.status(400).send('unsupported action');
    });
    
    router.post('/messages', apiControllers.postMessage);
    
    router.get('/channel/:channel_id/hook/:hook_id', apiControllers.getHook);
    router.post('/channel/:channel_id/hooks', apiControllers.createHook);
    router.put('/channel/:channel_id/hook/:hook_id', apiControllers.updateHook);

    return router;
}

module.exports = apiRoutes;