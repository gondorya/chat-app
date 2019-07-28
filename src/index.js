const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
	socket.on('join', ({ username, room }, callback) => {
		socket.join(room);
		const { user, error } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.emit('message', { message: generateMessage(`Hi ${user.username}`).text });
		socket.broadcast
			.to(user.room)
			.emit('message', { message: generateMessage(`Say hello to new user - ${user.username}`).text });
		io.to(user.room).emit('roomData', {
			users: getUsersInRoom(user.room),
			room: user.room
		});
		callback();
	});

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();
		const user = getUser(socket.id);

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		io
			.to(user.room)
			.emit('message', { message, date: generateMessage().createdAt, id: socket.id, username: user.username });

		callback('Delivered!');
	});

	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id);
		const { longitude, latitude } = location;

		io.emit('locationMessage', {
			location: `https://google.com/maps?q=${latitude},${longitude}`,
			date: generateMessage().createdAt,
			id: socket.id,
			username: user.username
		});

		callback();
	});

	socket.on('disconnect', () => {
		const user = getUser(socket.id);
		removeUser(socket.id);
		if (user) {
			io.to(user.room).emit('message', { message: generateMessage(`A ${user.username} has left`).text });
			io.to(user.room).emit('roomData', {
				users: getUsersInRoom(user.room),
				room: user.room
			});
		}
	});
});

server.listen(port, () => {
	console.log('Hello! Your app is up on port ' + port);
});
