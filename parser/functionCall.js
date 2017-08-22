'use strict';

let ParentNode = require("./parentNode.js");

module.exports = class FunctionCall extends ParentNode {
	constructor(_opNode) {
		super();
		this.name = "FUNCTION_CALL";

		this.opNode = _opNode;

		// this.children are arguments

		this.description += this.opNode.getToken().data;
	}

	getOpNode() {
		return this.opNode;
	}
}
