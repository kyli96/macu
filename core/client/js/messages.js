var API = require('./api'),
    React = require('react'),
    MessageClient = require('./components/messageclient'),
    CreateChannel = require('./components/createchannel');
var Header = require('./components/Header');
var SidePane = require('./components/SidePane');
var JoinChannel = require('./components/JoinChannel');
var ServerActionCreators = require('./actions/ServerActionCreators');
var CoreAppDispatcher = require('./dispatcher/CoreAppDispatcher');
var ChannelStore = require('./stores/ChannelStore');
var Constants = require('./constants/CoreConstants');
var UserStore = require('./stores/UserStore');
var ActionTypes = Constants.ActionTypes;
var ResizeUtils = require('./resizeUtils');
var Scrollers = require('./scroller');

var Mf = {
    init: function () {
        Mf.socket = io();
        Mf.socket.on('profile', function (obj) {
            ServerActionCreators.receiveProfile(obj);
            
            API.getChannels(function (data) {
                ServerActionCreators.receiveChannels(data);
                
                Mf.initMessageInput();
            });
            API.getDomainChannels(obj.domain, true, function (data) {
                if (!data || !data.count) {
                    return;
                }
                ServerActionCreators.receiveDomainChannelCount(data);
            });
            
            Mf.renderHeader();
            Mf.renderMessageClient();
            Mf.renderSidePane();
            ResizeUtils.init();
        })
        Mf.socket.on('sendMsg', ServerActionCreators.receiveNewMessage);
        Mf.socket.on('newChannel', ServerActionCreators.receiveNewChannel);
        
        CoreAppDispatcher.register(function (payload) {
            var action = payload.action;
            
            switch (action.type) {
                case ActionTypes.RECEIVE_CHANNELS:
                    CoreAppDispatcher.waitFor([ChannelStore.dispatchToken]);
                    break;
                case ActionTypes.CLICK_CREATE_CHANNEL:
                    Mf.onClickCreateChannel();
                    break;
                case ActionTypes.CLICK_MORE_CHANNELS:
                    Mf.renderJoinChannel();
                    break;
                case ActionTypes.TOGGLE_SIDE_PANE:
                    Mf.onToggleSidePane();
                    break;
                case ActionTypes.RECEIVE_SEARCH_RESULTS:
                    Mf.showSidePane();
                    break;
                default:
                    // no-op
            }
        });
    },
    initMessageInput: function () {
        $('#message-form').submit(function () {
            var msg = $('#message-input').val();
            Mf.sendMsg('C' + ChannelStore.getCurrentID(), msg);
            $('#message-input').val('');
            return false;
        });
    },
    renderHeader: function () {
        var header_props = {
            domain: { name: UserStore.getData().domain }
        };
        React.render(React.createElement(Header, header_props),
            $('#header')[0]);
    },
    renderMessageClient: function () {
        React.render(React.createElement(MessageClient, null), 
            $('#client_body')[0]);
    },
    renderSidePane: function () {
        React.render(React.createElement(SidePane, null), 
            $('#side_pane')[0]);
    },
    renderJoinChannel: function () {
        if ($('#more_channels_modal').length === 0) {
            $(document.body).append($('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">')
                .attr('id', 'more_channels_modal'));
            React.render(React.createElement(JoinChannel), $('#more_channels_modal')[0], function () {
                $('#more_channels_modal').modal();
            });
        }
    },
    sendMsg: function (t_id, msg) {
        if (!t_id) {
            return;
        }
        var msg_obj = {
            t_id: t_id,
            user_id: UserStore.getData()._id,
            name: UserStore.getData().name, 
            msg: msg, 
            ts: Date.now()
        }
        Mf.socket.emit('sendMsg', msg_obj);
        ServerActionCreators.receiveNewMessage(msg_obj);
    },
    onClickCreateChannel: function () {
        if ($('#create_channel_modal').length === 0) {
            $(document.body).append($('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">')
                .attr('id', 'create_channel_modal'));
            var props = {
                onClickSave: Mf.createChannel
            };
            React.render(React.createElement(CreateChannel, props), $('#create_channel_modal')[0], function () {
                $('#create_channel_modal').modal();
            });
        }
        else {
            $('#create_channel_modal').modal();
        }
    },
    createChannel: function (channel) {
        channel.access = "public";
        channel.domain = UserStore.getData().domain;
        channel.owner = UserStore.getData()._id;
        Mf.socket.emit('createChannel', channel);
        if ($('#create_channel_modal').length) {
            $('#create_channel_modal').modal('hide');
        }
    },
    onToggleSidePane: function () {
        console.log('messages.js');
        $('#client-ui').toggleClass('showing_side_pane');
        ResizeUtils.resizeMessageScrollDiv();
        if (Scrollers.scrollPanes['messages_scroll_div']) {
            Scrollers.scrollPanes['messages_scroll_div'].update();
        }
        if (Scrollers.scrollPanes['search_results_scroll_div']) {
            console.log('update in messages');
            Scrollers.scrollPanes['search_results_scroll_div'].update();
        }
    },
    showSidePane: function () {
        if (!$('#client-ui').hasClass('showing_side_pane')) {
            Mf.onToggleSidePane();
        }
    }
};

module.exports = Mf;