var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');
var EventEmitter = require('events');
var assign = require('object-assign');

var ActionTypes = Constants.ActionTypes;
var CHANGE_EVENT = 'change';

_message_results = [];

var SearchStore = assign({}, EventEmitter.prototype, {
    loadResults: function (results) {
        _message_results = results
    },
    getResults: function () {
        return _message_results;
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

SearchStore.dispatchToken = CoreAppDispatcher.register(function(payload){
    var action = payload.action;

    switch(action.type) {
        case ActionTypes.RECEIVE_SEARCH_RESULTS:
            SearchStore.loadResults(action.results);
            SearchStore.emitChange();
            break;
        default:
            // no-op
    }
});

module.exports = SearchStore;