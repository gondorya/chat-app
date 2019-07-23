const path = require('path');
const http = require('http');
const express = require('express');
const port = process.env.PORT || 3000;
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));

io.on('connection', () => {
	console.log('hello');
});

server.listen(port, () => {
	console.log('Hello! Your app is up on port ' + port);
});
