var user;
function showMessage(obj) {
    $('#messages').append($('<li>').text(obj.name + ': ' + obj.msg));
}
var socket = io();
$('form').submit(function () {
    var msg = $('#message-input').val();
    socket.emit('sendMessage', { username: user.username, name: user.name, msg: msg });
    $('#message-input').val('');
    return false;
});
socket.on('profile', function (obj) {
    user = obj;
})
socket.on('receiveMessage', showMessage);
