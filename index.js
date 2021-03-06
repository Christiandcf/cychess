var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
users = []; // Constains Users for chat
connections = [];  // Number of sockets

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Cookie Set up
app.use(cookieParser());
app.use(session({secret:'somesecrettokenhere'}));


var url = 'room';

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/favicon.ico', function(req, res) {
	res.send('');
});


// Game & User constructor functions
function userList() {
	this.users = [];
}

function user(userName, socket) {
	this.socketId = socket;
	this.userName = userName;
}

userList.prototype.findUser = function(identifier, token) {


	return _.find(this.users, function(user) {
		if (token === 'un' && user.userName === identifier) return true;
		else if (token === 'id' && user.socketId === identifier) return true;
		else return false;
	});
}

userList.prototype.newUser = function(username, socket) {
	var newUser = new user(username, socket);
	this.users.push(newUser);
}

function gamesCollection() {
	this.games = [];
};

function game(id, player1, player2) {
	this.id = id;
	this.players = [];
	this.boardFEN = 'start';
	this.gameFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
	this.gameStarted = false;
}

game.prototype.addPlayer = function(user) {
	this.players.push(user);
}

game.prototype.isFull = function() {
	 return this.players.length > 1;
}

game.prototype.getPlayer = function(userName) {
	return _.find(this.players, {'userName': userName});
}

game.prototype.getPlayerColor = function(userName) {
	var player = _.find(this.players, {'userName': userName});
	return player.color;
}

gamesCollection.prototype.newGame = function(gameid, color, username) {

		var userObject = {
			userName: username,
			color: color
		};
		var newGame = new game(gameid);
		newGame.addPlayer(userObject);
		this.games.push(newGame);
}

gamesCollection.prototype.findGame = function(gameID) {
	return _.find(this.games, {'id': gameID});
};

gamesCollection.prototype.findGameFromUserName = function(userName) {
	return _.find(this.games, function(game) {
		return _.where(game.players, {userName: userName}).length;
	 });
}

gamesCollection.prototype.findGameFromUserId = function(id) {
	return _.find(this.games, function(game) {
		return _.where(game.players, {socketId: id}).length;
	 });
}

gamesCollection.prototype.joinGame = function(gameId, player2userName) {
	var currentGame = this.findGame(gameId);

	if (currentGame.players.length == 1) { //if you can join the game
		var color = currentGame.players[0].color;
		var newUserColor = color == 'white' ? 'black':'white';
		currentGame.addPlayer({userName: player2userName, color: newUserColor});
		// console.log(gamesCollection);
	}

	else if (currentGame.users.length == 0) { //if game does not exist

	}


}

var gamesCollection = new gamesCollection();
var userList = new userList();


var createID = function () {
	return Math.random().toString(36).substring(16);
}

app.post('/create', function(req, res) {

	if (userList.findUser(req.body.userName, 'un')) {
		res.send(false);
	}
	else {
		userList.newUser(req.body.userName); // add user to userList
		var randID = createID();
		gamesCollection.newGame(randID, 'white', req.body.userName);
		req.session.gameId = randID;
		res.redirect('/create');
	}
});

app.post('/join', function(req,res) {

	var response;

	if(userList.findUser(req.body.userName, 'un')) { //if username already exists
		res.status(409).send({error: 'userNameExists'});
	}

	else if (!gamesCollection.findGame(req.body.gameId)) { //if game does not exists
		res.status(404).send({error: 'gameDoesNotExist'});
	}

	else if (gamesCollection.findGame(req.body.gameId)) {
		var searchedGame = gamesCollection.findGame(req.body.gameId);
		// console.log(searchedGame);
		if (searchedGame.isFull()) { //if game is full
			res.status(409).send({error: 'gameIsFull'});
		}

		else {
			var searchedGame = gamesCollection.findGame(req.body.gameId);
			gamesCollection.joinGame(searchedGame.id, req.body.userName);
			userList.newUser(req.body.userName, undefined);
			// console.log('joined room');
			res.send();
		}
	}

	else {
		// console.log('could not join game -- check code'); //put better error here
	}
});


app.get('/create', function (req, res) {
	var newGameId = req.session.gameId;
	res.redirect('/game/' + newGameId);
});

app.get('/game/:gameID', function (req, res, next) {
	var gameID = req.params.gameID;
	res.sendFile(__dirname + '/game.html');

});


/*
* Socket IO Receiving!
*/
io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  // Disconnect
  socket.on('disconnect', function(data){
    users.splice(users.indexOf(socket.userN),1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s scokets connected', connections.length);
  });


	socket.emit('startSetup');
	socket.on('setup', function(username){

		var currentUser = userList.findUser(username, 'un');
		currentUser.socketId = socket.id;

		var currentGame = gamesCollection.findGameFromUserName(username);
		var player = currentGame.getPlayer(username);
		player.socketId = socket.id;
		var boardFEN = currentGame.boardFEN;
		var gameFEN = currentGame.gameFEN;
		var color = currentGame.getPlayerColor(username);
		socket.emit('endSetup', color, boardFEN);
	});

	socket.on('getColor', function() {

		var currentUser = userList.findUser(socket.id, 'id');
		var currentGame = gamesCollection.findGameFromUserName(currentUser.userName);
		var color = currentGame.getPlayerColor(currentUser.userName);
		socket.emit('getColor', color);
	});

	socket.on('chessMove', function(boardPosition, gamePosition) {

		var currentGame = gamesCollection.findGameFromUserId(socket.id);
		currentGame.boardFEN = boardPosition;
		currentGame.gameFEN = gamePosition;
		io.emit('chessMove', boardPosition, gamePosition);
	});


	socket.on('pieceDrop', function(pieceSource, pieceTarget) {
		io.emit('pieceDrop', pieceSource, pieceTarget);
	});

	socket.on('gameInCheck', function() {
		socket.emit('offensiveCheck'); // player puting opponent in check
		socket.broadcast.emit('defensiveCheck'); // player receiving
	});

	socket.on('gameInCheckmate', function() {
		socket.emit('offensiveCheckmate'); // player puting opponent in check
		socket.broadcast.emit('defensiveCheckmate'); // player receiving
	});

	socket.on('gameInDraw', function() {
		io.emit('drawGame');
	});

	socket.on('gameInStalemate', function() {
		socket.broadcast.emit('defensiveStalemate'); // defending player recieving stalemate
		socket.emit('offensiveStalemate'); // offensive player puting opponent into stalemate
	});

	socket.on('gameInThreefold', function() {
		io.emit('threeFoldDraw');
	});

  /*
  *  CHAT STUFF
  */

  // Send Message
  socket.on('send message', function(data){
    io.sockets.emit('new message', {msg: data, user: socket.userN});
  });

  // New user
  socket.on('new user', function(data, callback){
    callback(true);
    console.log(data);
    socket.userN = data;
    users.push(socket.userN);
    updateUsernames();
  });

  // updates Usernames in display
  function updateUsernames() {
    io.sockets.emit('get users', users);
  }


});


http.listen(3000, function(){
	console.log('listening on *:3000');
});
