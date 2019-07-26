const socket = io();

// elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#location');
const $messages = document.querySelector('#messages');

//templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationTemplate = document.querySelector('#locationTemplate').innerHTML;

socket.on('message', (props) => {
	const { message, date } = props;
	const time = moment(date).format('MMM-DD-YYYY, hh:mm a');
	const html = Mustache.render(messageTemplate, { message, time });
	$messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (props) => {
	const { location, date } = props;
	const time = moment(date).format('MMM-DD-YYYY, hh:mm a');
	const html = Mustache.render(locationTemplate, { location, time });
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
