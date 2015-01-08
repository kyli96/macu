var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');

var ActionTypes = Constants.ActionTypes;

module.exports = {
    toggleSidePane: function () {
        CoreAppDispatcher.handleViewAction({
            type: ActionTypes.TOGGLE_SIDE_PANE
        });
    }
};