var API = require('./api'),
    Scrollers = require('./scroller'),
    React = require('react'),
    MessageClient = require('../views/messageclient'),
    ChannelHeader = require('../views/channelheader'),
    CreateChannel = require('../views/createchannel');

var M = {
    currentCid: null,
    user: null,
    messageClient: null,
    header: null
};
var Mf = {
    init: function () {
        Mf.socket = io();
        Mf.socket.on('profile', function (obj) {
            M.user = obj;
            Mf.renderHeader();
            Mf.renderMessageClient();
            Wf.init();
       })
        Mf.socket.on('sendMsg', Mf.onNewMessage);
        Mf.socket.on('newChannel', Mf.onNewChannel);
        
        $('form').submit(function () {
            var msg = $('#message-input').val();
            Mf.sendMsg('C' + M.messageClient.state.currentCid, msg);
            $('#message-input').val('');
            return false;
        });
    },
    renderHeader: function () {
        var header_props = {
            domain: { name: M.user.domain }
        };
        M.header = React.render(React.createElement(ChannelHeader, header_props), $('#header')[0]);
    },
    renderMessageClient: function () {
        var client_props = {
            // initState: {
            //     currentCid: M.currentCid,
            // }
            getChannels: Mf.getChannels,
            getMsgs: Mf.getMsgs,
            onRefreshMsgs: Mf.onRefreshMsgs,
            onClickCreateChannel: Mf.onClickCreateChannel,
            onRefreshChannels: Mf.onRefreshChannels,
            updateChannelHeader: Mf.updateChannelHeader,
            user: M.user,
            API: API
        };
        M.messageClient = React.render(React.createElement(MessageClient, client_props), 
            $('#client_body')[0]);
    },
    sendMsg: function (t_id, msg) {
        if (!t_id) {
            return;
        }
        var msg_obj = {
            t_id: t_id,
            user_id: M.user._id,
            name: M.user.name, 
            msg: msg, 
            ts: Date.now()
        }
        Mf.socket.emit('sendMsg', msg_obj);
        M.messageClient.onNewMessage(msg_obj);
        return true;
    },
    onNewMessage: function (obj) {
        M.messageClient.onNewMessage(obj);
    },
    onNewChannel: function (channel) {
        if (channel.domain == M.user.domain) {
            M.messageClient.onNewChannel(channel);
        }
    },
    updateChannelHeader: function (channel) {
        M.currentCid = channel._id;
        M.header.updateChannel(channel);
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
        channel.domain = M.user.domain;
        channel.owner = M.user._id;
        Mf.socket.emit('createChannel', channel);
        if ($('#create_channel_modal').length) {
            $('#create_channel_modal').modal('hide');
        }
    },
    getChannels: function (fn) {
        API.get('/user/'+M.user._id+'/channels', fn);
    },
    getMsgs: function (t_id, fn) {
        API.get('/channel/'+t_id+'/history', fn);
    },
    onRefreshChannels: function() {
        Wf.resizeChannelsCol();
    },
    onRefreshMsgs: function () {
        Wf.resizeMsgFiller();
        if (!Scrollers.scrollPanes['messages_scroll_div']) {
            Scrollers.init('messages_scroll_div');
        } else {
            Scrollers.scrollPanes['messages_scroll_div'].update();
        }
    }
}

var Wf = {
    init: function () {
        $(window).on('resize', function () {
            Wf.resizeChannelsCol();
            Wf.resizeMessageScrollDiv();
            Wf.resizeMsgFiller();
            if (Scrollers.scrollPanes['messages_scroll_div']) {
                Scrollers.scrollPanes['messages_scroll_div'].update();
            }
        }).trigger('resize');
    },
    resizeChannelsCol: function () {
        $('#channels_col').height($(window).height() - $('#header').height());
    },
    resizeMessageScrollDiv: function () {
        var scroll_div = $('#messages_scroll_div');
        var msgs_div = $('#msgs_div');
        var scroll_div_height = $(window).height() - $('#footer').height() - $('#header').height();
        scroll_div.height(scroll_div_height);
        scroll_div.width($(window).width() - $('#channels_col').width());
    },
    resizeMsgFiller: function () {
        var msgs_div = $('#msgs_div');
        var msgs_height = $('#message_front').height() + msgs_div.height() + parseInt(msgs_div.css('padding-top')) + parseInt(msgs_div.css('padding-bottom'));
        var scroll_div_height = $('#messages_scroll_div').height();
        var filler = scroll_div_height - msgs_height;
        if (filler > 0) {
            $('#message_filler').height(filler);
        }
        else {
            $('#message_filler').height(0);
        }
    }
}

module.exports = {
    M: M,
    Mf: Mf,
    Wf: Wf
}