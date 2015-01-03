var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');

var ActionTypes = Constants.ActionTypes;

module.exports = {
    receiveChannels: function(data) {
        CoreAppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_CHANNELS,
            channels: data
        });
    },
    receiveDomainChannelCount: function(data) {
        CoreAppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_DOMAIN_CHANNEL_COUNT,
            count: data.count
        });
    },
    receiveNewMessage: function(data) {
        CoreAppDispatcher.handleServerAction({
            type: ActionTypes.NEW_MESSAGE,
            message: data
        });
    },
    receiveNewChannel: function(data) {
        CoreAppDispatcher.handleServerAction({
            type: ActionTypes.NEW_CHANNEL,
            channel: data
        });
    },
    receiveProfile: function(data) {
        CoreAppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_PROFILE,
            user: data
        });
    }
};