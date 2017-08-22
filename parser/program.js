'use strict';

let ParentNode = require("./parentNode.js");

module.exports = class Program extends ParentNode {
	constructor() {
		super();
		this.name = "PROGRAM";
	}
}
