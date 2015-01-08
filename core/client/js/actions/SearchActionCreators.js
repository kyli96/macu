﻿var CoreAppDispatcher = require('../dispatcher/CoreAppDispatcher');
var Constants = require('../constants/CoreConstants');
var API = require('../api');

var ActionTypes = Constants.ActionTypes;

module.exports = {
    search: function (q) {
        API.search(q);
    }
}