/* Darker Medium
 * Copyright © 2017 Rob Garrison
 * License: MIT
 */
/* global chrome */
(() => {
	"use strict";

	// Look for "medium-com" in the <head> prefix attribute
	const IS_MEDIUM = /medium-com/,
		// Stylesheet IDs
		THEME = "darker-medium-theme",
		VARS = THEME + "-variables",
		// Attribute added to stylesheet when moved after </body> on page load
		MOVED = "data-" + THEME + "-moved",
		// Attribute added to <head> after initialization
		INIT = "data-" + THEME + "-initialized",

		SETTINGS = {
			enabled: true,
			// Accent colors (comments show defaults)
			// styles added by build script (modify `build/settings.json`, not here)
			styles: {
				/* eslint-disable quote-props */
				/* BUILD:SETTINGS_START */
				"header": "#1d1d1d",
				"main": "#7AA8D6",
				"highlight": "#7AA8D6",
				"link": "#dddddd",
				"hover": "#dddddd",
				"underline": true
				/* BUILD:SETTINGS_END */
				/* eslint-enable quote-props */
			}
		},
		HEX_REGEX = /[^0-9A-F]/gi, // Remove non hex characters

		// Underline style alpha value copied from medium source css
		// See https://medium.design/crafting-link-underlines-on-medium-7c03a9274f9
		ALPHA = 0.68, // Magic underline alpha value

		// Opera doesn't support sync
		STORAGE = chrome.storage[chrome.storage.sync ? "sync" : "local"];

	let timerCheck,
		timerStorage;

	function checkPage(mode) {
		clearTimeout(timerCheck);
		// `document.head` may not be available at document-start
		if (!document.head) {
			timerCheck = setTimeout(() => {
				checkPage(mode);
			}, 10);
			return;
		}
		// Medium posts have a <head> that looks something like this:
		// <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# medium-com: http://ogp.me/ns/fb/medium-com#">
		if (IS_MEDIUM.test(document.head.getAttribute("prefix"))) {
			const hasInitialized = document.head.getAttribute(INIT) === "true";
			document.head.setAttribute(INIT, true);
			getStorage().then(values => {
				const isEnabled = values.enabled ? "enable" : "disable";
				if (
					hasInitialized &&
					$(THEME) &&
					mode.indexOf("toggle") > -1 // Check for toggleTab or toggleAll
				) {
					toggleStylesheet(mode);
				} else if (!hasInitialized) {
					addStylesheet(isEnabled);
				}
				// Inserts style before the link because it contains the css
				// variable definitions
				addVars(values.styles);
			});
		}
	}

	function processStyles(styles) {
		let accents = "\n";
		Object.keys(SETTINGS.styles).forEach(name => {
			let style = styles[name];

			if (name === "underline") {
				// If underline is disabled, set the alpha channel to zero to make it
				// transparent
				const alpha = style === true ? ALPHA : 0;
				style = hex2rgba(styles.link, alpha);
			} else if (name === "highlight" || name === "main") {
				// Add text contrast color to match the selected background color
				accents += `  --accent_${name}_text: ${calcContrast(style)};\n`;
			} else {
				style = cleanStyle(style, {hash: true});
			}
			accents += `  --accent_${name}: ${style};\n`;
		});
		return accents;
	}

	function cleanStyle(string, options = {}) {
		const hex = string.replace(HEX_REGEX, "");
		return options.hash ? "#" + hex : hex;
	}

	// Always expects a 6-digit hex value & alpha fractional value
	// Modified from https://github.com/sindresorhus/hex-rgb (MIT)
	function hex2rgba(hex, alpha = 1) {
		const num = parseInt(cleanStyle(hex), 16);
		return `rgba(${num >> 16}, ${num >> 8 & 255}, ${num & 255}, ${alpha})`;
	}

	// Calculate contrasting text color for the given background color
	// https://24ways.org/2010/calculating-color-contrast/
	function calcContrast(hex) {
		hex = cleanStyle(hex);
		const r = parseInt(hex.substr(0, 2), 16),
			g = parseInt(hex.substr(2, 2), 16),
			b = parseInt(hex.substr(4, 2), 16),
			yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
		return yiq >= 128 ? "black" : "white";
	}

	function addVars(styles) {
		let el = $(VARS);
		if (!el) {
			el = document.createElement("style");
			el.id = VARS;
			addToDOM(el);
		}
		el.textContent = `:root { ${processStyles(styles)} }`;
	}

	function addStylesheet(mode) {
		const el = $(THEME),
			$link = el ? el : document.createElement("link");
		$link.id = THEME;
		$link.disabled = mode === "disable";
		$link.rel = "stylesheet";
		$link.href = chrome.extension.getURL("style.css");
		// Add to DOM (after </head>)
		addToDOM($link);
		if (document.readyState !== "loading") {
			// Add to DOM (after </body>)
			addToDOM($link);
		} else {
			document.addEventListener("DOMContentLoaded", () => {
				// Add to DOM (after </body>)
				addToDOM($link);
			}, {
				once: true
			});
		}
	}

	// Mode is "enable", "disable" or undefined (toggles)
	function toggleStylesheet(mode) {
		// We only need to toggle the link, not the variables style
		const el = $(THEME),
			save = mode !== "toggleTab";
		if (el) {
			if (mode.indexOf("toggle") > -1) {
				mode = el.disabled ? "" : "disable";
			}
			el.disabled = mode === "disable";
			// Don't update storage if only a single tab is being toggled
			if (save) {
				getStorage().then(values => {
					values.enabled = mode !== "disable";
					setStorage(values);
				});
			}
		}
	}

	function addToDOM(el) {
		// Don't add to DOM if already attached;
		// Ensure that variables are *always* defined before the style
		if (!el.parentNode || el.id === VARS) {
			// Add after </head> tag
			document.head.parentNode.insertBefore(el, document.head.nextSibling);
		} else if (document.body && !el.getAttribute(MOVED)) {
			// Called on window load, move style after </body> tag
			document.body.parentNode.insertBefore(el, document.body.nextSibling);
			el.setAttribute(MOVED, "true");
		}
	}

	function onStorageChange(changes) {
		// Throttle storage change
		clearTimeout(timerStorage);
		timerStorage = setTimeout(() => {
			if (changes.enabled) {
				toggleStylesheet(changes.enabled.newValue ? "enable" : "disable");
			} else {
				addVars(changes.styles.newValue);
			}
		}, 250);
	}

	function onMsg(message) {
		checkPage(message.text);
	}

	function getStorage() {
		return new Promise(resolve => {
			STORAGE.get(SETTINGS, data => resolve(data));
		});
	}

	function setStorage(data) {
		return new Promise(resolve => {
			STORAGE.set(data, () => resolve(data));
		});
	}

	function $(selector) {
		return document.getElementById(selector);
	}

	chrome.runtime.onMessage.removeListener(onMsg);
	chrome.runtime.onMessage.addListener(onMsg);
	chrome.storage.onChanged.removeListener(onStorageChange);
	chrome.storage.onChanged.addListener(onStorageChange);

	checkPage("init");
})();
