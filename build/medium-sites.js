/* global module */
"use strict";

/* Update this list of domains for Medium story sites
 * See this page for valid document rules:
 * https://github.com/stylish-userstyles/stylish/wiki/Valid-@-moz-document-rules
 * Examples:
 * - domain("example.com") => ["domain", "example.com"]
 * - url(http://www.example.com/page.html) => ["url", "http://www.example.com/page.html"]
 * - url-prefix(http://www.example.) => ["url-prefix", "http://www.example."]
 * - regexp("http://(www|blog)\\.example\\.com/.*") => ["regexp", "http://(www|blog)\\.example\\.com/.*"]
 */
module.exports = [
	["domain", "500ish.com"],
	["domain", "blog.framer.com"],
	["domain", "blog.hackster.io"],
	["domain", "blog.mindorks.com"],
	["domain", "blog.timescale.com"],
	["domain", "codeburst.io"],
	["domain", "hackernoon.com"],
	["domain", "journal.thriveglobal.com"],
	["domain", "medium.com"],
	["domain", "melmagazine.com"],
	["domain", "omgfacts.com"],
	["domain", "rantt.com"],
	["domain", "shift.newco.co"],
	["domain", "thinkgrowth.org"],
	["domain", "uxdesign.cc"],
	["domain", "uxplanet.org"],
	["domain", "writingcooperative.com"],
	/* A very general regular expression looking for a "medium" subdomain
	 * so far, it captures:
	 * - https://medium.muz.li
	 * - https://medium.freecodecamp.org
	 */
	["regexp", "https?://[^\\/]*medium\\.\\S*"]
];
