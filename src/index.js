const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

let message = 'Hello!';

io.on('connection', (socket) => {
	socket.emit('message', message);
	socket.broadcast.emit('message', 'Say hello to new user');

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		io.emit('message', message);
		callback('Delivered!');
	});

	socket.on('sendLocation', (location, callback) => {
		const { longitude, latitude } = location;
		io.emit('message', `https://google.com/maps?q=${latitude},${longitude}`);
		callback();
	});

	socket.on('disconnect', () => {
		io.emit('message', 'A user has left');
	});
});

server.listen(port, () => {
	console.log('Hello! Your app is up on port ' + port);
});
