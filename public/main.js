// var socket = io(),
var $chat = $('#chatForm'),
$userForm = $('#userForm'),
$gameForm = $('#gameForm'),
$user = $('#user'),
$userList = $('.userList'),
$content = $('#main');
var $createBox = $('#createBox');
var $joinBox = $('#joinBox');
var $chatBox = $('#chatBox');
var $menu = $('#menu');
var $logo = $('#logo');

var room = location.pathname.slice(1);;




// show Create
function showCreate() {
		$createBox.show();
		$joinBox.hide();
		$chatBox.hide();
		$logo.hide();
};

// Show Join
function showJoin() {
		$joinBox.show();
		$createBox.hide();
		$chatBox.hide();
		$logo.hide();

};

// Show Chat
function showChatBox() {
		$chatBox.show();
		$joinBox.hide();
		$createBox.hide();
		$logo.hide();
};

// Show Menu
function showMenu() {
		$logo.show();
		$joinBox.hide();
		$createBox.hide();
		$chatBox.hide();
}

$userForm.submit(function(e){
	e.preventDefault();
	var newUserData = {};
	newUserData.userName = $('#userName').val();

	newUserData.color = 'w';
	console.log(newUserData);

	$.post('/create', newUserData, function(userData) {
		// console.log(userData);
		if (!userData) {
			swal('Uh-oh', 'That username is already taken, try another one!', 'error');
		}
		else  {
			localStorage.setItem("username", newUserData.userName);
			console.log(localStorage.getItem('username'));
			window.location ='/create';
		}
	});

	$('#userName').val('');
});

$gameForm.submit(function(e) {
	e.preventDefault();
	var newUserData = {};
	newUserData.userName = $('#joinUserName').val();
	newUserData.color = 'b';
	newUserData.gameId = $('#gameCode').val();

	$.post('/join', newUserData, function(userData) {
		// if post is successful redirect
		localStorage.setItem("username", newUserData.userName);
		window.location = '/game/' + newUserData.gameId;

	}).fail(function(xhr) {
		var response = JSON.parse(xhr.responseText);
		switch(response.error) {
			case 'userNameExists':
				swal('Uh-oh', 'That username is already taken, try another one!', 'error');
				break;
			case 'gameDoesNotExist':
				swal('Sorry', 'That game code is invalid, make sure the code is correct!', 'error');
				break;
			case 'gameIsFull':
				swal('Sorry', 'That game is already full, try joining another game!', 'error');
				break;
			default:
				swal('SERVER ERROR', 'Something went wrong, try again', 'error');
				break;
		}
	});
})
