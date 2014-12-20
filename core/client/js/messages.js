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

        var client_props = {
            // initState: {
            //     currentCid: M.currentCid,
            // }
            getChannels: Mf.getChannels,
            getMsgs: Mf.getMsgs
        }
        M.messageClient = React.render(React.createElement(MessageClient, client_props), $('#client_body')[0]);
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
    getChannels: function (fn) {
        $.ajax({
            url: '/api/channels'
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
    }
}
Mf.init();
