'use strict';

/*
 * Carrot
 * the simplistic string-based esolang made for code-golfing
 * by Kritixi Lithos
*/

let fs = require("fs");
let Interpreter = require("./interpreter.js");
let Parser = require("./parser/parser.js");

let args = process.argv;
let usage = `Usage: node carrot.js [-d] <file> <input>

   -d, --debug
               output AST and tokenisation`;

let code;
let input;

var debugFlag = false;

if (args.length < 4) {
	console.log(usage);
} else {
	// remove first two arguments
	args.shift();
	args.shift();

	// keeping track of flags
	var flags = [];
	var currArg = "";
	while(/^-/.test(currArg=args.shift())) {
		flags.push(currArg);
	}

	// reading program and input files
	code = fs.readFileSync(currArg).toString();
	input = fs.readFileSync(args.shift()).toString();

	debugFlag = flags.includes("-d") || flags.includes("--debug");

	var interpreter = new Interpreter(new Parser(code, false, debugFlag).parse(), new Parser(input, true, debugFlag).parse());
	console.log(interpreter.run());
}
