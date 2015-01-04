var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');
var API = require('../api');

var ActionTypes = Constants.ActionTypes;

module.exports = {
    changeChannel: function(channel_id) {
        CoreAppDispatcher.handleViewAction({
            type: ActionTypes.CHANGE_CHANNEL,
            channel_id: channel_id
        });
    },
    clickCreateChannel: function() {
        CoreAppDispatcher.handleViewAction({
            type: ActionTypes.CLICK_CREATE_CHANNEL
        });
    },
    clickMoreChannels: function () {
        API.getAvailableChannels();
        CoreAppDispatcher.handleViewAction({
            type: ActionTypes.CLICK_MORE_CHANNELS
        });
    },
    joinChannel: function (channel_id) {
        API.subscribeChannel(channel_id);
        CoreAppDispatcher.handleViewAction({
            type: ActionTypes.CLICK_JOIN_CHANNEL,
            channel_id: channel_id
        });
    }
};