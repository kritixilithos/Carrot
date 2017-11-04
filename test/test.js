// test
let Interpreter = require("../interpreter.js");
let Parser = require("../parser/parser.js");

var tests = [
	{
		code: "5^Fl^3^Fj^1^Fk[-1j*(^hk)k]j",
		res: 125
	},{
		code: "$^Fl^3^Fj^1^Fk[-1j*(^hk)k]j",
		input: "-7.3",
		res: -389.017
	},{
		code: "5^+\"a0d\"+3/'/\\d/g'",
		res: ["5","0","3"]
	}
];

var correct = 0;
var total = 0;

var incorrect = [];

for(var test of tests) {
	var res = new Interpreter(new Parser(test.code, false).parse(), new Parser(test.input || "", true).parse()).run();
	if(equal(res, test.res)) {
		correct++;
	} else {
		incorrect.push(total);
	}

	total++;
}

console.log(`${correct} correct out of ${total}`);
console.log(`Indices of incorrect: ${incorrect}`);

// test equality between two vars
function equal(a, b) {
	if(typeof(a) !== typeof(b)) {
		// obvious
		return false;
	} else {
		if(typeof(a) !== "object") {
			// "number" or "string"
			return a === b;
		} else {
			// "object" (array)
			if(a.length !== b.length) {
				return false;
			} else {
				// recurse!
				for(var i=0; i<a.length; i++) {
					if(!equal(a[i], b[i])) {
						return false;
					}
				}

				return true;
			}
		}
	}
}
