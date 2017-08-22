'use strict';

let Node = require("./node.js");

module.exports = class ChildNode extends Node {
	constructor(_token) {
		super();
		this.name = "CHILD_NODE";

		this.token = _token;
	}

	setToken(_token) {
		this.token = _token;
	}

	getToken() {
		return this.token;
	}

	isChild() {
		return true;
	}
}
