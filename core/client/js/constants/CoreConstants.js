var keyMirror = require('keymirror');

module.exports = {
    ActionTypes: keyMirror({
        NEW_CHANNEL: null,
        NEW_MESSAGE: null,
        CHANGE_CHANNEL: null,
        JOINED_CHANNEL: null,
        RECEIVE_CHANNELS: null,
        RECEIVE_DOMAIN_CHANNEL_COUNT: null,
        RECEIVE_DOMAIN_CHANNELS: null,
        RECEIVE_MESSAGES: null,
        CLICK_CREATE_CHANNEL: null,
        CLICK_MORE_CHANNELS: null,
        CLICK_JOIN_CHANNEL: null,
        GOTO_MESSAGE: null,
        RECEIVE_PROFILE: null,
        RECEIVE_SEARCH_RESULTS: null,
        TOGGLE_SIDE_PANE: null
    }),

    PayloadSources: keyMirror({
        SERVER_ACTION: null,
        VIEW_ACTION: null
    })
};