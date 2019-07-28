const socket = io();

// elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#location');
const $messages = document.querySelector('#messages');
const $users = document.querySelector('#users');

//templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationTemplate = document.querySelector('#locationTemplate').innerHTML;
const userListTemplate = document.querySelector('#userListTemplate').innerHTML;

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
	const visibleHeight = $messages.offsetHeight;
	const conatinerHeight = $messages.scrollHeight;

	if (visibleHeight <= conatinerHeight) {
		$messages.scrollTop = conatinerHeight;
	}
};

socket.on('message', (props) => {
	const { message, date, id, username = 'Admin' } = props;
	const className = id === socket.id ? 'is-mine' : '';
	const time = moment(date).format('MMM-DD-YYYY, hh:mm a');
	console.log(message);
	const html = Mustache.render(messageTemplate, { message, time, className, username });
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('locationMessage', (props) => {
	const { location, date, id, username } = props;
	const className = id === socket.id ? 'is-mine' : '';
	const time = moment(date).format('MMM-DD-YYYY, hh:mm a');
	const html = Mustache.render(locationTemplate, { location, time, className, username });
	$messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();

	$messageFormButton.setAttribute('disabled', 'disabled');

	const message = e.target.elements.message.value;
	socket.emit('sendMessage', message, (error) => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}
		console.log('delivered');
	});
});

$locationButton.addEventListener('click', () => {
	$locationButton.setAttribute('disabled', 'disabled');

	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}

	navigator.geolocation.getCurrentPosition((position) => {
		const longitude = position.coords.longitude;
		const latitude = position.coords.latitude;
		socket.emit('sendLocation', { longitude, latitude }, () => {
			$locationButton.removeAttribute('disabled');
			console.log('Location shared');
		});
	});
});

socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error);
		return (location.href = '/');
	}
});

socket.on('roomData', (props) => {
	const { room, users } = props;
	console.log(users);
	const html = Mustache.render(userListTemplate, { users, room });
	$users.innerHTML = html;
});
