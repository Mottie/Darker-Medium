/* global chrome */
"use strict";

// Keyboard shortcut
function keyboardShortcut() {
	enableAllCurrentTabs("toggle");
}

if ("commands" in chrome) {
	chrome.commands.onCommand.removeListener(keyboardShortcut);
	chrome.commands.onCommand.addListener(keyboardShortcut);
}

/**
 * Modified from
 * https://github.com/bfred-it/webext-inject-on-install
 */
function showErrors() {
	if (chrome.runtime.lastError) {
		console.error(chrome.runtime.lastError);
	}
}

function loopTabs(callback) {
	chrome.runtime.getManifest().content_scripts.forEach(script => {
		const url = script.matches,
			validUrl = /^http/;
		chrome.tabs.query({url}, tabs => {
			tabs.forEach(tab => {
				// Don't mess with file://, chrome://, etc.
				if (validUrl.test(tab.url)) {
					callback(tab, script);
				}
			});
		});
	});
}

function enableAllCurrentTabs(mode) {
	loopTabs((tab, script) => {
		const allFrames = script.all_frames;
		(script.js || []).forEach(file => {
			chrome.tabs.executeScript(tab.id, {allFrames, file}, showErrors);
		});
		if (mode) {
			chrome.tabs.sendMessage(tab.id, {text: mode});
		}
	});
}

setTimeout(() => {
	enableAllCurrentTabs("update");
}, 500);

// Toggle all tabs
chrome.commands.onCommand.addListener(() => {
	loopTabs(tab => {
		chrome.tabs.sendMessage(tab.id, {text: "toggleAll"});
	});
});

// Only toggle current tab
chrome.browserAction.onClicked.addListener(tab => {
	chrome.tabs.sendMessage(tab.id, {text: "toggleTab"});
});
