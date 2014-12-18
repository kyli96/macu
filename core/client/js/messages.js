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

        Mf.getChannels(function () { // should pre-populate
            if (M.channels.length > 0) {
                M.currentCid = M.channels[0]._id;
                Mf.refreshMsgs();
            }
        });
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
            Mf.refreshChannels(data, fn);
        });
    },
    refreshChannels: function (channels, fn) {
        M.channels = channels;
        var newList = $('<ul id="channels_list">');
        for (var i = 0; i < channels.length; i++) {
            newList.append($('<li class="channel">').append($('<a id="' + channels[i]._id + '" class="channel_name">').text('#' + channels[i].name)));
        }
        $('#channels_list').replaceWith(newList);
        $('#channels_list .channel_name').on('click', function () {
            var id = $(this).attr('id');
            if (M.currentCid == id) {
                return;
            }
            console.log('switching to channel ' + id);
            M.currentCid = id;
            Mf.refreshMsgs();
        });
        fn();
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
