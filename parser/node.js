'use strict';

module.exports = class Node {
	constructor() {
		this.name = "NODE";

		// description
		this.description = "";

		this.extra = "";
	}

	getName() {
		return this.name;
	}

	// return description, useful for AST tree
	getDescription() {
		return this.name + (this.description?": "+ this.extra + this.escapeString(this.description):"");
	}

	escapeString(str) {
		return str.replace(/\\/g, "\\\\").replace(/\n/g,"\\n").replace(/'/g, "\\'").replace(/^|$/g, "'");
	}
}
