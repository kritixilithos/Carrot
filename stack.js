'use strict';

/*
 * Stack
 * - stackMode (enum)
 * - string
 * - float
 * - array
 * */

let StackMode = require("./stackMode.js");

module.exports = class Stack {
	constructor() {
		this.string = "";
		this.float = 0.0;
		this.array = [];
		this.stackMode = StackMode.STRING;
	}

	// clone
	clone() {
		var _stack = new Stack();
		_stack.setString(this.getString());
		_stack.setFloat(this.getFloat());
		_stack.setArray(this.getArray());
		return _stack;
	}

	// reset all data to falsey values
	clearAll() {
		this.setString("");
		this.setFloat(0.0);
		this.setArray([]);
	}

	getStack() {
		return this.stackMode === StackMode.STRING ? this.string
		: this.stackMode === StackMode.FLOAT ? this.float
		: this.array;
	}

	getStackMode() {
		return this.stackMode;
	}

	get(mode) {
		return mode === StackMode.STRING ? this.string
		: mode === StackMode.FLOAT ? this.float
		: this.array;
	}

	getString() {
		return this.string;
	}

	getFloat() {
		return this.float;
	}

	getArray() {
		return this.array;
	}

	setStackMode(arg) {
		this.stackMode = arg;
	}

	set(mode, arg) {
		if(mode === StackMode.STRING) this.string = arg;
		else if(mode === StackMode.FLOAT) this.float = arg;
		else this.array = arg;
	}

	setString(str) {
		this.string = str;
	}

	setFloat(f) {
		this.float = f;
	}

	setArray(arr) {
		this.array = arr;
	}
}
