var M = {
    currentCid: null,
    user: null,
    messageClient: null
};
var Mf = {
    init: function () {
        Mf.socket = io();
        Mf.socket.on('profile', function (obj) {
            M.user = obj;
        })
        Mf.socket.on('sendMsg', Mf.onNewMessage);
        
        $('form').submit(function () {
            var msg = $('#message-input').val();
            Mf.sendMsg(M.messageClient.state.currentCid, msg);
            $('#message-input').val('');
            return false;
        });
    },
    renderMessageClient: function () {
        var client_props = {
            // initState: {
            //     currentCid: M.currentCid,
            // }
            getChannels: Mf.getChannels,
            getMsgs: Mf.getMsgs,
            onRefreshMsgs: Mf.onRefreshMsgs,
            onClickCreateChannel: Mf.onClickCreateChannel
        };
        M.messageClient = React.render(React.createElement(MessageClient, client_props), 
            $('#client_body')[0], Mf.onRefreshChannels);
    },
    sendMsg: function (t_id, msg) {
        console.log('send msg to ' + t_id);
        if (!t_id) {
            return;
        }
        var msg_obj = {
            t_id: t_id, 
            username: M.user.username, 
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
        $.post('/api/channels', channel).done(function(data) {
            console.log(data);
        });
        if ($('#create_channel_modal').length) {
            $('#create_channel_modal').modal('hide');
        }
    },
    getChannels: function (fn) {
        $.ajax({
            url: '/api/user/'+M.user._id+'/channels'
        }).done(function (data) {
            if (data) {
                fn(data);
            }
        });
    },
    getMsgs: function (t_id, fn) {
        $.ajax({
            url: '/api/channel/' + t_id + '/history'
        }).done(function (data) {
            fn(data);
        });
    },
    onRefreshChannels: function() {
        Wf.resizeChannelsCol();
    },
    onRefreshMsgs: function() {
        Wf.resizeMsgFiller();
    }
}

var Wf = {
    init: function(){
        $(window).on('resize', function(){
            Wf.resizeChannelsCol();
            Wf.resizeMsgFiller();
        }).trigger('resize');
    },
    resizeChannelsCol: function() {
        $('#channels_col').height($(window).height());
    },
    resizeMsgFiller: function() {
        var f_height = $(window).height() - $('#msgs_div').height() - $('#footer').height();
        if (f_height > 0) {
            $('#message_front').height(f_height);
        }
        else {
            $('#message_front').height(0);
        }
    }
}