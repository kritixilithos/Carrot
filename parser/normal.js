'use strict';

let ParentNode = require("./parentNode.js");

// Normal mode
module.exports = class Normal extends ParentNode {
	constructor() {
		super();
		this.name = "NORMAL";
	}
}
