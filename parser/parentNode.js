'use strict';

let Node = require("./node.js");

module.exports = class ParentNode extends Node {
	constructor() {
		super();
		this.name = "PARENT_NODE";

		this.children = [];
	}

	addChild(_node) {
		this.children.push(_node);
	}

	addChildren(_nodes) {
		this.children = this.children.concat(_nodes);
	}

	getChildren() {
		return this.children;
	}

	isChild() {
		return false;
	}
}
