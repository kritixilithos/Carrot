'use strict';

let ParentNode = require("./parentNode.js");

module.exports = class ArrayNode extends ParentNode {
	constructor() {
		super();
		this.name = "ARRAY";
	}
}
