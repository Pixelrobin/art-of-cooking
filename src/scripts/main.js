import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';

// -- Nav menu --- //

window.addEventListener('DOMContentLoaded', function() {
	var toggle = document.getElementById('nav-toggle');
	var menu = document.getElementById('nav-ul');
	var body = document.body;

	toggle.addEventListener('click', function() {
		body.classList.toggle('menu-expanded');
	})
});

/*fetch('/../data.json')
	.then(res => res.json())
	.then(data => console.log(data));*/

