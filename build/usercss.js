/* global require module */
"use strict";

const sites = require("./medium-sites"),
	settings = require("./settings.json");

function buildMozDoc() {
	const list = sites.map(fxn => `${fxn[0]}("${fxn[1]}")`);
	return `@-moz-document ${list.join(",\n")} {\n`;
}

function replaceVar(str, name, replacement) {
	const regex = new RegExp(`\\/\\s*\\*\\s*BUILD:${name}\\s*\\*\\s*\\/`, "gi");
	return str.replace(regex, replacement);
}

// Parameter files > [ style.css, template.user.css ]
module.exports = function(files, version) {
	// / * BUILD:VERSION * /
	// @var color    acc_header    "Header background" / * BUILD:HEADER * /
	// @var color    acc_main      "Main Accent Color" / * BUILD:MAIN * /
	// @var color    acc_highlight "Highlight Color"   / * BUILD:HIGHLIGHT * /
	// @var color    acc_link      "Link Color"        / * BUILD:LINK * /
	// @var color    acc_hover     "Link Hover Color"  / * BUILD:HOVER * /
	// @var checkbox acc_underline "Link underline"    / * BUILD:UNDERLINE * /
	// @var checkbox hide_footer   "Hide Footer"       / * BUILD:FOOTER * /
	// /* BUILD:USER_CSS */
	let usercss = files.pop();

	usercss = replaceVar(usercss, "version", version);
	Object.keys(settings).forEach(key => {
		usercss = replaceVar(usercss, key, settings[key]);
	});
	usercss = replaceVar(usercss, "mozdoc", buildMozDoc());
	// Remove :root{} from gist.css; otherwise, it'll be duplicated in the
	// usercss, and is needed in the gist style injected by the extension into
	// the iframe
	files.forEach((file, index) => {
		const indx = file.indexOf("/* Gist Syntax");
		if (indx > -1) {
			files[index] = file.substring(indx, file.length);
		}
	});
	return replaceVar(usercss, "user_css", `${files.join("\n")}\n}`);
};
