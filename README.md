# CyChess
CyChess is a real time chess multiplayer game which include a chat as a form of communication.
The client and server was handled by the Node.js environment along with the Socket.io library to
handle the sockets connected to the server. The chess game was created importing the chessboard.js
library to create the board and pieces; and chess.js which contains the whole logic of a chess game.

# Instructions
This application is not hosted in any cloud web service provided.

## Kickstart
  - Open a bash terminal or the Node.js cmd
  - Go to the project directory
  - Type the following command: "node index.js", this will start the server
  - If there is an error starting the server make sure there are no tabs open with "localhost:300" as this can cause a crash in the server.
  - The port used was 3000, to log into the website open a browser and go to "localhost:3000"

## Chess
  - Create a game: Enter a username and you will be redirected to the chess game room
  - Join a game: The user that created the game will share the Game ID with his opponent
    so he can join in. He can do so by the chat next to the chessboard, as long as his
    opponent is already online

## Chat
  - Enter the desired username
  - Messages will only be displayed to the users already connected, this been said,
    once a user is connected he/she can only view the messages that were sent after
    he/she logged in

# Important Files
  - index.html: Contains both views for the log in to the chess and the fully functional chat
  - game.html: Contains the chessboard, this is where you will be playing with your opponent
  - index.js: Server side of the application, receives playable moves, messages, and all the information sent by the client
  - main.js: Navigation logic on the main page
  - chat.js: The main chat logic
  - chatGame.js: Chat tailored to meet specific specifications on the game.html (ex: not having to log in again)
  - chessboard.js: Contains the pieces and board for the chess game.
  - chess.js: Logic of the chess game.
