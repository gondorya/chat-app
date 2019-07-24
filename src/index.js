const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

let message = 'Hello';

io.on('connection', (socket) => {
	socket.emit('message', message);

	socket.on('sendMessage', (message) => {
		io.emit('message', message);
	});
});

server.listen(port, () => {
	console.log('Hello! Your app is up on port ' + port);
});
