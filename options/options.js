/* global chrome darkerMediumSettings */
(() => {
	"use strict";

	let timerUpdate,
		busy = false;
	const STORAGE = chrome.storage[chrome.storage.sync ? "sync" : "local"];

	function getStyles() {
		const styles = {};
		Object.keys(darkerMediumSettings.styles).forEach(name => {
			if (name === "underline" || name === "footer") {
				styles[name] = $(name).checked;
			} else {
				styles[name] = $(name).value || darkerMediumSettings.styles[name];
			}
		});
		return styles;
	}

	function setStyles(styles) {
		if (styles && Object.keys(styles).length > 0) {
			busy = true;
			Object.keys(darkerMediumSettings.styles).forEach(name => {
				if (name === "underline" || name === "footer") {
					$(name).checked = styles[name];
				} else {
					$(name).value = styles[name] || darkerMediumSettings.styles[name];
				}
			});
			busy = false;
		}
	}

	function updateOptions(newSettings) {
		const styles = newSettings ? newSettings.styles : getStyles();
		setStorage({
			enabled: newSettings ? newSettings.enabled : $("enabled").checked,
			styles
		});
		return false;
	}

	function resetOptions() {
		updateOptions(darkerMediumSettings);
		setStyles(darkerMediumSettings.styles);
		$("enabled").checked = darkerMediumSettings.enabled;
		return false;
	}

	function $(id, el) {
		return (el || document).getElementById(id);
	}

	function changed() {
		clearTimeout(timerUpdate);
		// Debounce event
		timerUpdate = setTimeout(() => {
			if (!busy) {
				updateOptions();
			}
		}, 200);
	}

	function getStorage(options) {
		return new Promise(resolve => {
			STORAGE.get(options, data => resolve(data));
		});
	}

	function setStorage(data) {
		return new Promise(resolve => {
			STORAGE.set(data, () => resolve(data));
		});
	}

	function init() {
		// Use default values
		getStorage(darkerMediumSettings).then(values => {
			$("enabled").checked = values.enabled;
			setStyles(values.styles);
		});
		document.body.removeEventListener("change", changed);
		document.body.addEventListener("change", changed);
		$("reset").removeEventListener("click", resetOptions);
		$("reset").addEventListener("click", resetOptions);
	}

	init();
})();
