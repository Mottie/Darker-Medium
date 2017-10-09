/* global require */
"use strict";

const fs = require("fs"),
	archiver = require("archiver"),

	pkg = require("../package.json"),
	manifest = require("../manifest.json");

function convertToString(obj) {
	return JSON.stringify(obj, null, "\t") + "\n";
}

function writeManifest(obj) {
	return new Promise((resolve, reject) => {
		fs.writeFile("manifest.json", convertToString(obj), "utf8", err => {
			if (err) {
				console.log("Error writing manifest.json", err);
				reject();
			} else {
				resolve();
			}
		});
	});
}

function del(name) {
	return new Promise((resolve, reject) => {
		fs.unlink(name, err => {
			// ignore if file doesn't exist
			if (err && err.code !== "ENOENT") {
				reject();
			} else {
				resolve();
			}
		});
	});
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
		archive.append(json, {
			name: "manifest.json"
		});
		archive.finalize();
	});
}

manifest.version = pkg.version;

del("darker-medium.zip")
	.then(() => del("darker-medium.xpi"))
	.then(() => writeManifest(manifest))
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
