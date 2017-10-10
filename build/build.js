/* global require */
"use strict";

const pkg = require("../package.json"),
	manifest = require("../manifest.json"),

	{
		del,
		updateSettings,
		buildUserCSS,
		writeFile,
		convertToString,
		createZip
	} = require("./files");

manifest.version = pkg.version;

del("darker-medium.zip")
	.then(() => del("darker-medium.xpi"))
	.then(() => del("darker-medium.user.css"))
	.then(() => updateSettings("js/settings.js", 2))
	.then(() => updateSettings("js/content.js", 4))
	.then(() => buildUserCSS(pkg.version))
	.then(() => writeFile("manifest.json", convertToString(manifest)))
	.then(() => createZip("darker-medium.zip", manifest))
	.then(() => {
		// Psuedo sign XPI for local testing
		manifest.applications = {
			gecko: {
				id: "darker-medium@example.com"
			}
		};
		return createZip("darker-medium.xpi", manifest);
	})
	.then(() => console.log("\x1b[32m%s\x1b[0m", "Darker-Medium build complete"))
	.catch(err => {
		throw err;
	});
