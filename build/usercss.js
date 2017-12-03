/* global require module */
"use strict";

const sites = require("./medium-sites"),
	settings = require("./settings.json");

function buildMozDoc() {
	const list = [];
	sites.forEach(fxn => {
		list.push(`${fxn[0]}("${fxn[1]}")`);
	});
	return `@-moz-document ${list.join(", ")} {\n`;
}

function replaceVar(str, name, replacement) {
	const regex = new RegExp(`\\/\\s*\\*\\s*BUILD:\\s*${name}\\s*\\*\\s*\\/`, "gi");
	return str.replace(regex, replacement);
}

// Parameter files > [ style.css, template.user.css ]
module.exports = function(files, version) {
	// / * BUILD:VERSION * /
	// @var color    acc_header    'Header background' / * BUILD:HEADER * /
	// @var color    acc_main      'Main Accent Color' / * BUILD:MAIN * /
	// @var color    acc_highlight 'Highlight Color'   / * BUILD:HIGHLIGHT * /
	// @var color    acc_link      'Link Color'        / * BUILD:LINK * /
	// @var color    acc_hover     'Link Hover Color'  / * BUILD:HOVER * /
	// /* BUILD:USER_CSS */
	let usercss = files[1];

	usercss = replaceVar(usercss, "version", version);
	Object.keys(settings).forEach(key => {
		usercss = replaceVar(usercss, key, settings[key]);
	});
	usercss = replaceVar(usercss, "mozdoc", buildMozDoc());
	return replaceVar(usercss, "user_css", `${files[0]}\n}`);
};
