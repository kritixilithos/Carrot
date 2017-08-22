'use strict';

let TokenType = require("./tokenType.js");
let Mode = require("./mode.js");

/*
 * TODO:
 * Maybe rename TokenType.OPERATOR to TokenType.COMMAND?
 * ---^-2 parsed as CARET:^, FLOAT:-2---
 * --- Add [] loops---
 * ---Add $,#,$_ as arguments (DONE in NORMAL mode, DONE in caret-mode)---
 * ---Add () subshells in both caret-mode and normal-mode as arguments---
 * ---Add v down-carets---
 * */

/*
 * TOKENS
 *
 * they are objects in the form:
 * {
 * 	type: TokenType.xxx
 * 	data: 'xxx'
 * }
 * */

module.exports = class Lexer {
	constructor(code, lexInput=false) {
		this.code = code;

		// mode tells us caret-mode/operator-mode/regex-mode/...
		this.mode = [Mode.CARET];

		// boolean that contains whether or not we are parsing input
		this.lexInput = lexInput;
		if(this.lexInput) {
			this.mode = [Mode.ARG];
		}

		// keep track of the last caret-mode
		this.lastCaret = ['^'];

		// boolean array that keeps track of whether an operator has been encountered in Mode.NORMAL
		this.opEncountered = [false];
	}

	nextToken() {
		//console.log(this.mode);
		// checking end of file
		if(this.empty()) return Token(TokenType.EOF, '');

		//
		if(this.lastMode() === Mode.CARET) {
			return this.parseCaret();

		} else if(this.lastMode() === Mode.CARET_END) {
			// parse the ending caret
			this.remove(1);
			this.popMode();
			this.pushMode(Mode.NORMAL);
			this.opEncountered.push(false);
			return Token(TokenType.CARET_END, this.lastCaret.pop());

		} else if(this.lastMode() === Mode.SUBSHELL) {
			// only encountered when ( is started from Mode.CARET
			this.remove(1);
			this.pushMode(Mode.CARET);
			return Token(TokenType.L_PAREN, '(');

		} else if(this.lastMode() === Mode.ARRAY) {
			// this has to be before if(this.lexInput)
			return this.parseArray();

		} else if(this.lexInput) {
			// parsing input
			if(/\s/.test(this.firstChar())) return this.parseWhitespace();
			else return this.parseArgument();

		} else if(this.lastMode() === /*Mode.OPERATOR || this.lastMode() === Mode.ARG*/ Mode.NORMAL) {
			//parsing NORMAL mode
			return this.parseNormal();

		} else if(this.lastMode() === Mode.INPUT_ARG) {
			this.popMode();
			return this.parseInputArg();
		}
	}

	// parse caret-mode
	parseCaret() {
		var data = "";
		var escaping = false;

		while(true) {
			if(escaping) {
				data = this.firstChar();
				escaping = false;
			} else {
				if(this.firstChar() === last(this.lastCaret) || this.empty()) {
					this.popMode();
					this.pushMode(Mode.CARET_END);
					return Token(TokenType.CARET_DATA, data);
				} else if (this.firstChar() === '\\') {
					escaping = true;
				} else if(/[#$]/.test(this.firstChar())) {
					this.pushMode(Mode.INPUT_ARG);
					return Token(TokenType.CARET_DATA, data);
				} else if(this.firstChar() === '(') {
					//subshell
					this.pushMode(Mode.SUBSHELL);
					// Mode.CARET is not pushed now, but later when we return '('
					this.lastCaret.push('^');
					return Token(TokenType.CARET_DATA, data);
				} else {
					data += this.firstChar();
				}
			}

			this.remove(1);
		}
	}

	// parse normal mode, the mode where you have operators and arguments
	parseNormal() {
		// NOTE: DO NOT do [^v] because that is a negated character set
		if(/[v^]/.test(this.firstChar())) {
			this.lastCaret.push(this.firstChar());
			this.popMode();
			//this.popMode();
			this.pushMode(Mode.CARET);
			this.remove(1);
			return Token(TokenType.CARET_START, last(this.lastCaret));
		}

		// whitespace
		if(/\s/.test(this.firstChar())) {
			return this.parseWhitespace();
		}

		// T-O-D-O: $, #, symbols as args
		// argument or operator?
		if(this.firstChar() === '-') {
			if(/[.\d]/.test(this.peek()) && last(this.opEncountered)) {
				// float
				return this.parseArgument();
			} else {
				// operator
				return this.parseOperator();
			}
		} else if(/['".\d{#$]/.test(this.firstChar())) {
			// string or regex or float
			return this.parseArgument();
		} else if(this.firstChar() === '(') {
			// beginning subshell
			this.remove(1);
			this.pushMode(Mode.SUBSHELL);
			this.pushMode(Mode.CARET);
			this.lastCaret.push('^');
			return Token(TokenType.L_PAREN, '(');
		} else if(this.firstChar() === ')') {
			// ending subshell
			this.remove(1);
			this.popMode();
			this.popMode();
			return Token(TokenType.R_PAREN, ')');
		} else if(this.firstChar() === '[') {
			// begin loop
			this.remove(1);
			this.pushMode(Mode.LOOP);
			this.pushMode(Mode.NORMAL);
			this.opEncountered.push(false);
			return Token(TokenType.L_BRACKET, '[');
		} else if(this.firstChar() === ']') {
			// end loop
			this.remove(1);
			this.popMode();
			this.popMode();
			return Token(TokenType.R_BRACKET, ']');
			//
		} else {
			return this.parseOperator();
		}
	}

	// parse an operator
	parseOperator() {
		var data = this.firstChar();
		this.remove(1);
		if(!last(this.opEncountered)) this.opEncountered[this.opEncountered.length-1]=true;
		return Token(charToTokenType(data), data);
	}

	// parse an argument, aka a data type
	parseArgument() {
		var startChar = this.firstChar();
		if(startChar === '"') {
			// string
			return this.parseString();
		} else if(/[-\d.]/.test(startChar)) {
			// float
			return this.parseFloat();
		} else if(startChar === "'") {
			//regex
			return this.parseRegex();
		} else if(startChar === '{') {
			// array
			this.remove(1);
			this.pushMode(Mode.ARRAY);
			return Token(TokenType.L_BRACE, '{');
		} else if(/[$#]/.test(startChar)) {
			// input arg
			return this.parseInputArg();
		}
	}

	// parse # (actually parsed separately), $, $_
	parseInputArg() {
		if(this.firstChar() === '#') {
			this.remove(1);
			return Token(TokenType.INPUT_ARG, '#');
		}

		// else this.firstChar() === '$'
		this.remove(1);

		if(/[\d-]/.test(this.firstChar())) {
			// $_
			return Token(TokenType.INPUT_ARG, '$'+this.parseFloat(true).data);
		} else {
			// $
			return Token(TokenType.INPUT_ARG, '$');
		}
	}

	// parse a float/int argument
	parseFloat(isInt=false) {
		var data = "";
		// parse the sign
		if(this.firstChar() === '-') {
			data = '-';
			this.remove(1);
		}

		// part before the decimal point
		while(/\d/.test(this.firstChar())) {
			data += this.firstChar();
			this.remove(1);
		}

		// ints don't have decimal points
		if(!isInt) {
			// decimal point
			if(this.firstChar() === '.') {
				data += this.firstChar();
				this.remove(1);
			}
			while(/\d/.test(this.firstChar())) {
				data += this.firstChar();
				this.remove(1);
			}
		}

		return Token(TokenType.FLOAT, data);
	}

	// parse a string argument
	parseString() {
		var data = '"';
		this.remove(1);
		// backslash escaping
		var escaping = false;

		while(true) {
			if(escaping) {
				data += this.firstChar();
				escaping = false;
			} else {
				if(this.firstChar() === '\\') {
					// escape using backslash
					escaping = true;
				} else if(this.firstChar() === '"') {
					// " finishes the string
					data += this.firstChar();
					this.remove(1);
					break;
				} else {
					data += this.firstChar();
				}
			}

			this.remove(1);
		}

		return Token(TokenType.STRING, data);
	}

	// parse regex
	parseRegex() {
		var data = "'";
		this.remove(1);
		var escaping = false;
		var charClass = false;

		while(true) {
			if(escaping) {
				data += this.firstChar();
				escaping = false;
			} else if(charClass) {
				data += this.firstChar();
				if(this.firstChar() === ']') {
					charClass = false;
				}
			} else {
				if(this.firstChar() === '\\') {
					data += this.firstChar();
					escaping = true;
				} else if(this.firstChar() === '[') {
					// character class, the place where ' can go unescaped
					data += this.firstChar();
					charClass = true;
				} else if(this.firstChar() === "'") {
					data += this.firstChar();
					this.remove(1);
					break;
				} else {
					data += this.firstChar();
				}
			}

			this.remove(1);
		}

		return Token(TokenType.REGEX, data);
	}

	// parse arrays TODO (I don't know why is it still todo)
	parseArray() {
		while(true) {
			if(this.firstChar() === '}') {
				this.popMode();
				this.remove(1);
				return Token(TokenType.R_BRACE, '}');
			} else if(/\s/.test(this.firstChar())){
				return this.parseWhitespace();
			} else {
				return this.parseArgument();
			}
		}
	}

	// parse whitespace
	parseWhitespace() {
		var data = "";
		while(/\s/.test(this.firstChar())) {
			data += this.firstChar();
			this.remove(1);
		}

		return Token(TokenType.WHITESPACE, data);
	}

	// several simple functions for ease of use
	lastMode() {
		return last(this.mode);
	}

	pushMode(_mode) {
		this.mode.push(_mode);
	}

	popMode() {
		this.mode.pop();
	}

	remove(n) {
		this.code = this.code.substr(n);
	}

	firstChar() {
		return this.code[0];
	}

	peek(n=1) {
		return n>this.code.length?"":this.code[n];
	}

	empty() {
		return this.code.length === 0;
	}

}

// utility functions

// convert a tokentype and data to a token
function Token(type, data) {
	return {
		'type': type,
		'data': data
	}
}

// return the token represented by character c
function charToTokenType(c) {
	return TokenType.OPERATOR;
	if(/[a-zA-Z]/.test(c)) {
		// alphabet character
		// is c uppercase
		var uppercase = true;
		if(/[a-z]/.test(c)) {
			uppercase = false;
		}

		return (uppercase?"UPPER":"LOWER")+"_"+c.toUpperCase();
	} else {
		// symbol
		return c;
	}
}

function last(arr) {
	return arr[arr.length-1];
}
