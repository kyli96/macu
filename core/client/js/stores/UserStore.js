var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');
var EventEmitter = require('events');
var assign = require('object-assign');

var ActionTypes = Constants.ActionTypes;
var CHANGE_EVENT = 'change';

var _user = null;

var UserStore = assign({}, EventEmitter.prototype, {
    init: function (data) {
        _user = data;
    },
    getData: function () {
        return _user;
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

UserStore.dispatchToken = CoreAppDispatcher.register(function(payload){
    var action = payload.action;

    switch(action.type) {
        case ActionTypes.RECEIVE_PROFILE:
            UserStore.init(action.user);
            break;
        default:
            // no-op
    }
});

module.exports = UserStore;