'use strict';

/*
 * TOKENS
 *
 * they are objects in the form:
 * {
 * 	type: TokenType.xxx
 * 	data: 'xxx'
 * }
 * */

module.exports = {

	// tokens
	CARET_END: "CARET_END", // starting caret   | For ease
	CARET_DATA: "CARET_DATA",                // |    of
	CARET_START: "CARET_START", // ending caret | the parser (such formatting; much wow)
	EOF: "EOF",
	FLOAT: "FLOAT",
	INPUT_ARG: "INPUT_ARG",
	OPERATOR: "OPERATOR",
	REGEX: "REGEX",
	STRING: "STRING",
	WHITESPACE: "WHITESPACE",

	// symbols/operators
	// TODO: d} maybe?
	AMPER: "&",
	ASTERISK: "*",
	AT: "@",
	BACK_SLASH: "\\",
	COLON: ":",
	COMMA: ",",
	EQUALS: "=",
	EX_MARK: "!",
	FOR_SLASH: "/",
	HASH: "#", // is this necessary?
	LOWER_A: "a",
	LOWER_B: "b",
	LOWER_C: "c",
	LOWER_D: "d",
	LOWER_E: "e",
	LOWER_F: "f",
	LOWER_G: "g",
	LOWER_H: "h",
	LOWER_I: "i",
	LOWER_J: "j",
	LOWER_K: "k",
	LOWER_L: "l",
	LOWER_M: "m",
	LOWER_N: "n",
	LOWER_O: "o",
	LOWER_P: "p",
	LOWER_Q: "q",
	LOWER_R: "r",
	LOWER_S: "s",
	LOWER_T: "t",
	LOWER_U: "u",
	LOWER_V: "v",
	LOWER_W: "w",
	LOWER_X: "x",
	LOWER_Y: "y",
	LOWER_Z: "z",
	L_ANGLE: "<",
	L_BRACE: "{",
	L_BRACKET: "[",
	L_PAREN: "(",
	MINUS: "-",
	PERCENT: "%",
	PLUS: "+",
	Q_MARK: "?",
	R_ANGLE: ">",
	R_BRACE: "}",
	R_BRACKET: "]",
	R_PAREN: ")",
	SEMICOLON: ":",
	TILDE: "~",
	UNDERSCORE: "_",
	UPPER_A: "A",
	UPPER_B: "B",
	UPPER_C: "C",
	UPPER_D: "D",
	UPPER_E: "E",
	UPPER_F: "F",
	UPPER_G: "G",
	UPPER_H: "H",
	UPPER_I: "I",
	UPPER_J: "J",
	UPPER_K: "K",
	UPPER_L: "L",
	UPPER_M: "M",
	UPPER_N: "N",
	UPPER_O: "O",
	UPPER_P: "P",
	UPPER_Q: "Q",
	UPPER_R: "R",
	UPPER_S: "S",
	UPPER_T: "T",
	UPPER_U: "U",
	UPPER_V: "V",
	UPPER_W: "W",
	UPPER_X: "X",
	UPPER_Y: "Y",
	UPPER_Z: "Z",
	V_BAR: "|"
};
