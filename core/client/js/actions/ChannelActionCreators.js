var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');

var ActionTypes = Constants.ActionTypes;

module.exports = {
    changeChannel: function(channel_id) {
        CoreAppDispatcher.handleViewAction({
            type: ActionTypes.CHANGE_CHANNEL,
            channel_id: channel_id
        });
    },
    clickCreateChannel: function(channel_id) {
        CoreAppDispatcher.handleViewAction({
            type: ActionTypes.CLICK_CREATE_CHANNEL
        });
    }
};