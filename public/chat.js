    var socket = io.connect();
    var $message = $('#message');
    var $messageArea = $('#messageArea');
    var $userFormArea = $('#userFormArea');
    var $users = $('#users');
    var $userN = $('#userN');
    var $loginBtn = $('#loginBtn');
    var $msgBtn = $('#msgBtn')
    var $msgBox = $('#msgBox');

    $(function() {

        // LOG IN
        $loginBtn.click(function(e) {
            e.preventDefault();
            if ($userN.val() != '') {
                socket.emit('new user', $userN.val(), function(data) {
                    if (data) {
                        $userFormArea.hide();
                        $messageArea.show();
                    }
                });
            } else {
                document.getElementById("emptU").innerHTML = "<strong>Username is Empty...</strong>"
            }
            $userN.val('');
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
            $msgBox.append('<div align="left"><strong>' + data.user + '</strong>: ' + data.msg + '</div>');
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
