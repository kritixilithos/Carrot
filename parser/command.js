'use strict';

let ChildNode = require("./childNode.js");

module.exports = class Command extends ChildNode {
	constructor(_token) {
		super(_token);
		this.name = "COMMAND";

		this.description += this.getToken().data;
	}
}
