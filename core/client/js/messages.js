var M = {
    channels: [],
    currentCid: null
};
var Mf = {
    init: function () {
        Mf.socket = io();
        Mf.socket.on('profile', function (obj) {
            M.user = obj;
        })
        Mf.socket.on('sendMsg', Mf.showMessage);

        $('form').submit(function () {
            var msg = $('#message-input').val();
            Mf.sendMsg(M.currentCid, msg);
            $('#message-input').val('');
            return false;
        });

        React.render(React.createElement(ChannelsCol, null), document.getElementById('body_container'));
    },
    sendMsg: function (t_id, msg) {
        console.log('send msg to ' + t_id);
        Mf.socket.emit('sendMsg', { t_id: t_id, username: M.user.username, name: M.user.name, msg: msg });
        return true;
    },
    showMessage: function (obj) {
        if (!M.currentCid) {
            return;
        }
        if (M.currentCid == obj.t_id) {
            $('#messages').append($('<li>').text(obj.name + ': ' + obj.msg));
        }
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
    refreshMsgs: function () {
        $('#messages').empty();
        $.ajax({
            url: '/api/channel/' + M.currentCid + '/history'
        }).done(function (data) {
            var msgs = data.msgs;
            if (!msgs) {
                return;
            }
            for (var i = 0; i < msgs.length; i++) {
                Mf.showMessage(msgs[i]);
            }
        });
    }
}
Mf.init();
