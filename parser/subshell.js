'use strict';

let ParentNode = require("./parentNode.js");

module.exports = class Subshell extends ParentNode {
	constructor() {
		super();
		this.name = "SUBSHELL";
	}
}
