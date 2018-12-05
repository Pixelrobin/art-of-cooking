import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
const throttle = require('lodash/throttle');

// -- Nav menu --- //

window.addEventListener('DOMContentLoaded', function() {
	const toggle = document.getElementById('nav-toggle');
	const nav = document.getElementById('nav');
	const body = document.body;
	const navSizeDiv = document.getElementById('nav-size');

	const mobileNavHeight = navSizeDiv.clientHeight;
	const menuItems = nav.querySelectorAll('a, button');

	let lastScrollPos = 0;

	const updateNav = e => {
		const currentScrollPos = window.pageYOffset;

		if (currentScrollPos > lastScrollPos) {
			if (currentScrollPos > mobileNavHeight) {
				body.classList.add('js-nav-hidden');
			}
		} else body.classList.remove('js-nav-hidden');

		lastScrollPos = currentScrollPos;
	}

	window.addEventListener('scroll', throttle(updateNav, 100));

	const openMenu = () => {
		toggle.setAttribute('aria-expanded', 'true');
		body.classList.add('js-nav-expanded');
		window.addEventListener('keydown', navKeyHandler);
	}

	const closeMenu = () => {
		toggle.setAttribute('aria-expanded', 'false');
		body.classList.remove('js-nav-expanded');
		window.removeEventListener('keydown', navKeyHandler);
		toggle.focus();
	}

	const navKeyHandler = e => {
		const { keyCode, shiftKey } = e;

		if (keyCode === 27) {
			closeMenu();
		} else if (keyCode === 9) {
			const firstItem = menuItems[0];
			const lastItem = menuItems[menuItems.length - 1];
			const active = document.activeElement;

			if (shiftKey) { // tab back
				if (active === firstItem) {
					e.preventDefault();
					lastItem.focus();
				}
			} else { // tab forwards
				if (active === lastItem) {
					e.preventDefault();
					firstItem.focus();
				}
			}
		}
	}

	toggle.addEventListener('click', function() {
		if (toggle.getAttribute('aria-expanded') === 'false') openMenu();
		else closeMenu();
	});
});