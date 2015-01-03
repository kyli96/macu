var Dispatcher = require('flux').Dispatcher;
var assign = require('object-assign');
var Constants = require('../constants/CoreConstants');

var CoreAppDispatcher = assign(new Dispatcher(), {
    /**
    * @param {object} action The details of the action, including the action's
    * type and additional data coming from the server.
    */
    handleServerAction: function(action) {
        var payload = {
            source: Constants.PayloadSources.SERVER_ACTION,
            action: action
        };
        this.dispatch(payload);
    },

    /**
    * @param {object} action The details of the action, including the action's
    * type and additional data coming from the view.
    */
    handleViewAction: function(action) {
        var payload = {
            source: Constants.PayloadSources.VIEW_ACTION,
            action: action
        };
        this.dispatch(payload);
    }

});

module.exports = CoreAppDispatcher;