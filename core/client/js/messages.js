var M = {};
var Mf = {
    init: function () {
        Mf.socket = io();
        Mf.socket.on('profile', function (obj) {
            M.user = obj;
        })
        Mf.socket.on('sendMsg', Mf.showMessage);

        $('form').submit(function () {
            var msg = $('#message-input').val();
            Mf.sendMsg('[channel_id]', msg);
            $('#message-input').val('');
            return false;
        });

        Mf.getChannels();
    },
    sendMsg: function (t_id, msg) {
        Mf.socket.emit('sendMsg', { username: M.user.username, name: M.user.name, msg: msg });
        return true;
    },
    showMessage: function (obj) {
        $('#messages').append($('<li>').text(obj.name + ': ' + obj.msg));
    },
    getChannels: function () {
        $.ajax({
            url: '/api/channels'
        }).done(function (data) {
            Mf.refreshChannels(data);
        });
    },
    refreshChannels: function (channels) {
        console.log(channels);
        var newList = $('<ul id="channels_list">');
        for (var i = 0; i < channels.length; i++) {
            newList.append($('<li class="channel">').append($('<a class="channel_name">').text(channels[i].name)));
        }
        $('#channels_list').replaceWith(newList);
    }
}
Mf.init();
