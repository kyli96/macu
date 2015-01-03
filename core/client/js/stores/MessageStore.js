var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');
var ChannelStore = require('./ChannelStore');
var API = require('../api');
var EventEmitter = require('events');
var assign = require('object-assign');

var ActionTypes = Constants.ActionTypes;
var CHANGE_EVENT = 'change';

_messages = {};

var MessageStore = assign({}, EventEmitter.prototype, {
    loadChannelMessages: function(cid) {
        API.getMsgs(cid, function(data){
            // TODO: race condition
            _messages[cid] = data;
            MessageStore.emitChange();
        });
    },
    getCurrentChannelMessages: function() {
        if (!ChannelStore.getCurrentID()) {
            return [];
        }
        if (_messages[ChannelStore.getCurrentID()]) {
            return _messages[ChannelStore.getCurrentID()];
        }
        else {
            MessageStore.loadChannelMessages(ChannelStore.getCurrentID());
            return [];
        }
    },
    addNewMessage: function(message) {
        if (message.t_id.substring(0, 1) == 'C') {
            if (!_messages[message.t_id.substring(1)]) {
                _messages[message.t_id.substring(1)] = [message];
            }
            else {
                _messages[message.t_id.substring(1)].push(message);
            }
            MessageStore.emitChange();
        }
    },
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

MessageStore.dispatchToken = CoreAppDispatcher.register(function(payload){
    var action = payload.action;

    switch(action.type) {
        case ActionTypes.RECEIVE_CHANNELS:
            CoreAppDispatcher.waitFor([ChannelStore.dispatchToken]);
            MessageStore.loadChannelMessages(ChannelStore.getCurrentID());
            break;
        case ActionTypes.CHANGE_CHANNEL:
            MessageStore.loadChannelMessages(action.channel_id);
            break;
        case ActionTypes.RECEIVE_MESSAGES:
            MessageStore.init(action.messages);
            MessageStore.emitChange();
            break;
        case ActionTypes.NEW_MESSAGE:
            MessageStore.addNewMessage(action.message);
            MessageStore.emitChange();
            break;
        default:
            // no-op
    }
});

module.exports = MessageStore;