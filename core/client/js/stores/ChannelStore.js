var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');
var EventEmitter = require('events');
var assign = require('object-assign');
var UserStore = require('./UserStore');

var ActionTypes = Constants.ActionTypes;
var CHANGE_EVENT = 'change';

var _currentCID = null;
var _channels = {};
var _domainChannelCount = 0;
var _domainChannels = [];

function _handleNewChannel(channel) {
    var user = UserStore.getData();
    if (channel.domain != user.domain) {
        return;
    }
    _domainChannelCount++;
    if ((channel.owner+'') == (user._id + '')) {
        _addChannel(channel);
    }
    ChannelStore.emitChange();
}

function _addChannel(channel) {
    if (!_channels[channel._id]){
        _channels[channel._id] = channel;
    }
}

var ChannelStore = assign({}, EventEmitter.prototype, {
    init: function(data) {
        data.forEach(function(channel) {
            _addChannel(channel);
            if (!_currentCID) {
                _currentCID = channel._id;
            }
        });
    },
    getAll: function () {
        return _channels;
    },
    getAsArray: function() {
        var results = [];
        for (var id in _channels) {
            var channel = _channels[id];
            results.push(channel);
        }
        return results;
    },
    getAvailableChannels: function () {
        return _domainChannels;
    },
    getAvailableChannelCount: function() {
        return _domainChannelCount;
    },
    getCurrentID: function() {
        return _currentCID;
    },
    getCurrentChannel: function () {
        if (!_currentCID) {
            return null;
        }
        return _channels[_currentCID];
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

ChannelStore.dispatchToken = CoreAppDispatcher.register(function(payload){
    var action = payload.action;

    switch(action.type) {
        case ActionTypes.CHANGE_CHANNEL:
            _currentCID = action.channel_id;
            ChannelStore.emitChange();
            break;
        case ActionTypes.RECEIVE_CHANNELS:
            ChannelStore.init(action.channels);
            ChannelStore.emitChange();
            break;
        case ActionTypes.RECEIVE_DOMAIN_CHANNEL_COUNT:
            _domainChannelCount = action.count;
            ChannelStore.emitChange();
            break;
        case ActionTypes.RECEIVE_DOMAIN_CHANNELS:
            _domainChannels = action.channels;
            ChannelStore.emitChange();
            break;
        case ActionTypes.NEW_CHANNEL:
            _handleNewChannel(action.channel);
            break;
        case ActionTypes.CLICK_MORE_CHANNELS:
            if ($('#more_channels_modal').length) {
                $('#more_channels_modal').modal();
            }
            break;
        case ActionTypes.CLICK_JOIN_CHANNEL:
            if ($('#more_channels_modal').length) {
                $('#more_channels_modal').modal('hide');
            }
            break;
        case ActionTypes.JOINED_CHANNEL:
            _channels[action.channel._id] = action.channel;
            _currentCID = action.channel._id;
            ChannelStore.emitChange();
            break;
        default:
            // no-op
    }
});

module.exports = ChannelStore;