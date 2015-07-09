var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');
var ChannelStore = require('./ChannelStore');
var API = require('../api');
var EventEmitter = require('events');
var assign = require('object-assign');

var ActionTypes = Constants.ActionTypes;
var CHANGE_EVENT = 'change';

_messages = {};
_gotoMessage = null;

var MessageStore = assign({}, EventEmitter.prototype, {
    loadChannelMessages: function (cid) {
        if (!cid) {
            return;
        }
        API.getMsgs(cid, function(data){
            // TODO: race condition
            _messages[cid] = data;
            if (data.length) {
                _gotoMessage = data[data.length - 1]._id;
            }
            else {
                _gotoMessage = null;
            }
            MessageStore.emitChange();
        });
    },
    gotoMessage: function (msg) {
        if (!msg || !msg.t_id) {
            return;
        }
        var cid = msg.t_id.substring(1);
        API.getMsgs(cid, function (data) {
            _messages[cid] = data;
            _gotoMessage = msg._id;
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
    getFocusId: function () {
        return _gotoMessage;
    },
    addNewMessage: function(message) {
        if (message.t_id.substring(0, 1) == 'C') {
            if (!_messages[message.t_id.substring(1)]) {
                _messages[message.t_id.substring(1)] = [message];
            }
            else {
                _messages[message.t_id.substring(1)].push(message);
            }
            _gotoMessage = null;
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
        case ActionTypes.GOTO_MESSAGE:
            CoreAppDispatcher.waitFor([ChannelStore.dispatchToken]);
            MessageStore.gotoMessage(action.msg);
            break;
        case ActionTypes.CHANGE_CHANNEL:
            MessageStore.loadChannelMessages(action.channel_id);
            break;
        case ActionTypes.NEW_MESSAGE:
            MessageStore.addNewMessage(action.message);
            break;
        case ActionTypes.JOINED_CHANNEL:
            CoreAppDispatcher.waitFor([ChannelStore.dispatchToken]);
            MessageStore.loadChannelMessages(action.channel._id);
            break;
        default:
            // no-op
    }
});

module.exports = MessageStore;