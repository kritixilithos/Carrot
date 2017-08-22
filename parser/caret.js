'use strict';

let ParentNode = require("./parentNode.js");

module.exports = class Caret extends ParentNode {
	constructor(_upCaret) {
		super();
		this.name = "CARET";

		// true if ^, false for v
		this.upCaret = _upCaret;

		this.description += (this.getCaretType());
	}

	getCaretType() {
		return this.upCaret?"^":"v";
	}
}
