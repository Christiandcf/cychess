var $chatBox = $('#chatBox');
var socket = io.connect();
var $message = $('#message');
var $messageArea = $('#messageArea');
var $users = $('#users');
var $msgBtn = $('#msgBtn')
var $msgBoxG = $('#msgBoxG');


function goHome() {
    window.location.href = 'http://localhost:3000';
};

function showChatBox1(){
  $chatBox.show();
  $messageArea.show();
}

$(function() {

    // Sets Username as soon as the page loads
    $(document).ready(function(e) {
          $user = localStorage.getItem('username');
            socket.emit('new user', $user, function(data) {

            });
        return false;
    });

    // SENDS MESSAGE
    $msgBtn.click(function(e) {
        e.preventDefault();
        if ($message.val() != '') {
            socket.emit('send message', $message.val());
        }
        $message.val('');
        return false;
    });

    socket.on('new message', function(data) {
        $msgBoxG.append('<div align="left" ><strong>' + data.user + '</strong>: ' + data.msg + '</div>');
    });



    // GETS USERS
    socket.on('get users', function(data) {
        var html = '';
        for (i = 0; i < data.length; i++) {
            html += '<li class="list-group-item">' + data[i] + '   </li>'
        }
        $users.html(html);
    });
});
