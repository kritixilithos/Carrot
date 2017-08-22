'use strict';

let ParentNode = require("./parentNode.js");

module.exports = class Loop extends ParentNode {
	constructor() {
		super();
		this.name = "LOOP";
	}
}
