'use strict';

let ChildNode = require("./childNode.js");

module.exports = class Literal extends ChildNode {
	constructor(_token) {
		super(_token);
		this.name = "LITERAL";

		this.extra = "(" + this.getToken().type + ") ";
		this.description += this.getToken().data;
	}
}
