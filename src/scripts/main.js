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
	const menuItems = [...nav.querySelectorAll('a, button')];

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
		if (toggle.getAttribute('aria-expanded') !== 'true') return;

		const { keyCode, shiftKey } = e;

		const KEYS = {
			ESC: 27,
			TAB: 9,
			UP: 38,
			DOWN: 40,
			LEFT: 37,
			RIGHT: 39,
			HOME: 36,
			END: 35
		}

		const tabUp = () => {
			const index = menuItems.indexOf(document.activeElement);

			if (index !== -1) {
				if (index === 0) {
					menuItems[menuItems.length - 1].focus();
				} else menuItems[index - 1].focus();
			}
		}

		const tabDown = () => {
			const index = menuItems.indexOf(document.activeElement);

			if (index !== -1) {
				if (index === menuItems.length - 1) {
					menuItems[0].focus();
				} else menuItems[index + 1].focus();
			}
		}

		switch (keyCode) {
			case KEYS.ESC:
				closeMenu();
			break;

			case KEYS.TAB:
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
			break;

			case KEYS.UP:
			case KEYS.LEFT:
				tabUp();
			break;

			case KEYS.DOWN:
			case KEYS.RIGHT:
				tabDown();
			break;

			case KEYS.HOME:
				menuItems[0].focus();
			break;

			case KEYS.END:
				menuItems[menuItems.length - 1].focus();
			break;

			default: break;
		}
	}

	toggle.addEventListener('click', function() {
		if (toggle.getAttribute('aria-expanded') === 'false') openMenu();
		else closeMenu();
	});
});