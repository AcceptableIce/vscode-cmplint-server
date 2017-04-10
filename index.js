/*!
 * Based on stylelint-vscode | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/stylelint-vscode
*/
"use strict";

const inspect = require("util").inspect;

const isPlainObj = require("is-plain-obj");
const cmplint = require("cmplint");

module.exports = function cmplintServer(options) {
	if(!isPlainObj(options)) {
		return Promise.reject(new TypeError(
			"Expected an object containing cmplint API options, but got " +
			inspect(options) +
			"."
		));
	}

	if(options.files) {
		return Promise.reject(new TypeError(
			inspect(options.files) +
			" was passed to `file` option, but vscode-cmplint doesn't support `file` option because" +
			" it is specifically designed for Visual Studio Code API integration." +
			" Pass the file contents derived from `TextDocument#getText()` to `code` option instead." +
			" https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocument"
		));
	}

	if(!("code" in options)) {
		return Promise.reject(new TypeError("`code` option is required but not provided."));
	}

	if(typeof options.code !== "string") {
		return Promise.reject(new TypeError(
			"`code` option must be a string, but received a non-string value " +
			inspect(options.code) +
			"."
		));
	}

	return cmplint(Object.assign({}, options))
	.catch(error => Promise.reject(error))
	.then(report => {
		if(!report[options.filter]) return [];

		return report[options.filter].map(issue => {
			const position = {
				line: issue.line - 1,
				character: issue.column - 1
			};

			return {
				message: issue.message,
				severity: issue.severity === "warning" ? 2 : 1,
				source: "cmplint",
				range: {
					start: position,
					end: position
				}
			};
		});
	});
};