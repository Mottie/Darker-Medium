/* global require module */
"use strict";

const fs = require("fs"),
	archiver = require("archiver"),
	processTemplate = require("./usercss"),

	settings = require("./settings.json"),

	regex = new RegExp(`
			\\/\\*\\s*BUILD:SETTINGS_START\\s*\\*\\/
			[\\s\\S]+
			\\/\\*\\s*BUILD:SETTINGS_END\\s*\\*\\/
		`.replace(/\s/g, ""),
		"g"
	);

function readFile(name) {
	return new Promise((resolve, reject) => {
		fs.readFile(name, "utf8", (err, file) => {
			if (err) {
				return reject(err);
			}
			resolve(file);
		});
	});
}

function writeFile(name, obj) {
	return new Promise((resolve, reject) => {
		fs.writeFile(name, obj, "utf8", err => {
			if (err) {
				console.log(`Error writing ${name}`, err);
				return reject();
			}
			resolve();
		});
	});
}

function del(name) {
	return new Promise((resolve, reject) => {
		fs.unlink(name, err => {
			// ignore if file doesn't exist
			if (err && err.code !== "ENOENT") {
				return reject();
			}
			resolve();
		});
	});
}

function convertToString(obj, tabs = "\t") {
	return JSON.stringify(obj, null, tabs) + "\n";
}

// Replace defaults in content.js and settings.js
function replaceSettings(str, tabs) {
	const tabStr = "\t".repeat(tabs),
		result = convertToString(settings, tabStr);
	return str.replace(
		regex,
		"/* BUILD:SETTINGS_START */" +
			// Strip off curly brackets & "\n" at end
			`${result.substring(1, result.length - 2)}${tabStr}` +
			"/* BUILD:SETTINGS_END */"
	);
}

function updateSettings(name, tabs) {
	return readFile(name)
		.then(file => replaceSettings(file, tabs))
		.then(file => writeFile(name, file));
}

function copyPrettify() {
	readFile("node_modules/code-prettify/loader/run_prettify.js")
		.then(code => {
			// Don't load external CSS; remove `F.push("https://...prettify.css")`
			code = "/* eslint-disable */\n" + code.replace(
				/\w+\.push\(['"]https:\/\/cdn\.rawgit\.com[\w-/]+prettify\.css['"]\);/,
				""
			);
			writeFile("./js/run_prettify.js", code);
		});
}

// Build darker-medium.user.css from template and style.css
function buildUserCSS(version) {
	const files = [
		"./style.css",
		"./gist.css",
		"./build/template.user.css" // Must be last in this list
	];
	return Promise.all(files.map(name => readFile(name)))
		.then(files => writeFile(
			"darker-medium.user.css", processTemplate(files, version))
		);
}

function createZip(name, obj) {
	const file = fs.createWriteStream(name),
		archive = archiver("zip"),
		json = convertToString(obj);
	return new Promise((resolve, reject) => {
		archive.on("finish", () => {
			resolve();
		});
		archive.on("warning", err => {
			if (err.code === "ENOENT") {
				console.log("\x1b[33m%s\x1b[0m", "Warning", err.message);
			} else {
				throw err;
			}
		});
		archive.on("error", err => {
			reject();
			throw err;
		});

		archive.pipe(file);
		archive.glob("icons/*");
		archive.glob("js/*");
		archive.glob("options/*");
		archive.glob("style.css");
		archive.glob("gist.css");
		archive.append(json, {
			name: "manifest.json"
		});
		archive.finalize();
	});
}

module.exports = {
	del,
	updateSettings,
	copyPrettify,
	buildUserCSS,
	writeFile,
	convertToString,
	createZip
};
