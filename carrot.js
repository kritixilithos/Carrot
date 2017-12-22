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
let usage =
`Usage: node carrot.js [-d] -f <file> [input]
       node carrot.js [-d] <code> [input]

   -d, --debug
               output AST and tokenisation
   -f, --file
               take code and input from files rather than from arguments`;

let code;
let input;

var debugFlag = false;
var fileFlag = false;

if (args.length < 3) {
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

	fileFlag = flags.includes("-f") || flags.includes("--file");
	debugFlag = flags.includes("-d") || flags.includes("--debug");

	// reading program and input files
	code = fileFlag?fs.readFileSync(currArg).toString():currArg;
	// optional input
	input = args.length?fileFlag?fs.readFileSync(args.shift()).toString():args.shift():"";

	var interpreter = new Interpreter(new Parser(code, false, debugFlag).parse(), new Parser(input, true, debugFlag).parse());
	console.log(interpreter.run());
}
