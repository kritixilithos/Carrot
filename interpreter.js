'use strict';

let Garden = require("./garden.js");
let Lexer = require("./parser/lexer.js");
let NodeType = require("./parser/nodeType.js");
let Parser = require("./parser/parser.js");
let StackMode = require("./stackMode.js");
let TokenType = require("./parser/tokenType.js");

/*
 * T-O-D-O: combine parseArray() and parseLiteral() in the same function simply for ease
 * T-O-D-O: parseFloat(".") borks
 * */

module.exports = class Interpreter {
	// 1-indexed XXX: remember that inputIndex === 1
	constructor(_AST, _input, _inputIndex = 1, _garden = null) {
		// initialise AST
		this.AST = _AST;

		// initialise input
		this.input = _input;
		this.inputIndex = _inputIndex;

		// initialise 2D sheet
		this.garden = _garden?_garden:new Garden();

		// to avoid operator clutter in the constructor
		this.initOperators();
	}

	// run
	// dino
	run() {
		// interpret the nodes
		for(var node of this.AST.getChildren()) {
			this.interpretCaretOrNormal(node);
		}

		return this.getStack();
	}

	// interpret NoteType.${caret|normal}
	interpretCaretOrNormal(node) {
		if(node.getName() === NodeType.CARET) {
			this.interpretCaret(node);
		} else if(node.getName() === NodeType.NORMAL) {
			this.interpretNormal(node);
		}
	}

	// caret mode
	interpretCaret(caretNode) {
		var caretType = caretNode.getCaretType();
		var caretData = "";

		// going through every child of the caretNode
		for(var child of caretNode.getChildren()) {
			if(child.getName() === NodeType.LITERAL) {
				if(child.getToken().type === TokenType.INPUT_ARG) {
					// input arg
					var res = this.parseArg(child);
					caretData += res[0];
				} else {
					// caret data
					caretData += child.getToken().data;
				}
			} else {
				// XXX: subshells, but lexer doesn't alow that, feature-request or not?
			}
		}

		//console.log(caretType, Pascalify(this.stackMode()), caretData);
		this.operators[caretType][Pascalify(this.stackMode()) + "Caret"](caretData);
	}

	// normal mode
	interpretNormal(normalNode) {
		// going through every child of the normalNode
		for(var child of normalNode.getChildren()) {
			if(child.getName() === NodeType.FUNCTION_CALL) {
				// function_call node
				this.interpretFunctionCall(child);
			} else if(child.getName() === NodeType.LOOP) {
				// loop node
				this.interpretLoop(child);
			}
		}
	}

	// function call node
	interpretFunctionCall(functionCallNode) {
		var opNode = functionCallNode.getOpNode();
		var children = functionCallNode.getChildren();

		// to choose the right function
		var functionName = "";
		// and to get the functionArgs
		var functionArgs = [];

		for(var c of children) {
			if(c.getName() === NodeType.LITERAL || c.getName() === NodeType.ARRAY) {
				var res = this.parseArg(c);
				functionName += res[1];
				functionArgs.push(res[0]);
			} else if(c.getName() === NodeType.SUBSHELL) {
				//console.log(this.AST.children[1]);
				var res = this.interpretSubshell(c);
				functionName += res[1];
				functionArgs.push(res[0]);
			}
		}

		functionName += functionName?"":"Nil";

		functionName = Pascalify(this.stackMode()) + functionName;

		// call the operator function
		try {
			//console.log(opNode.getToken().data, functionName, functionArgs);
			this.operators[opNode.getToken().data][functionName](functionArgs);
		} catch(e) {
			console.log(e);
			throw new Error(`FunctionNotImplemented: functionName = $functionName; functionArgs = $functionArgs`);
		}
	}

	// loop node
	interpretLoop(loopNode) {
		// essentially a while loop
		// falsey: [], "", 0
		// truthy: everything else
		while(this.getStack()) {
			// evaluate stuff inside loop
			for(var c of loopNode.getChildren()) {
				this.interpretCaretOrNormal(c);
			}
		}
	}

	// TODO: subshell node
	interpretSubshell(subshellNode) {
		var _AST = subshellNode;
		var _input = this.input;
		var _inputIndex = this.inputIndex;
		var _garden = this.garden.clone();
		_garden.getCurrStack().clearAll(); // TODO: borky, object pointer the same; fixed?
		// T-O-D-O: make it start at the same position
		var res = new Interpreter(_AST, _input, _inputIndex, _garden).run();
		//console.log(res.run());
		return [res, typeOf(res)];
	}

	// from node to array/literal
	// returns [the JS array/literal from the node,
	//                the string that needs to be added to the function name];
	// TODO: make this.parseArg parse caretData as well
	parseArg(node) {
		if(node.getName() === NodeType.ARRAY) {
			// extract array
			var arr = [];

			// iterate through children
			for(var c of node.getChildren()) {
				// yay recursion
				arr.push(this.parseArg(c)[0]);
			}

			return [arr, "Array"];
		} else if(node.getName() === NodeType.LITERAL) {
			// token information
			var token = node.getToken();
			var type = token.type;
			var data = token.data;

			if(node.getToken().type === TokenType.INPUT_ARG) {
				// parse input arg
				if(data === '#') {
					return this.parseArg(this.input);
				} else if(data === '$') {
					return this.getInput();
				} else {
					// ASSUMPTION: data is in the form of $_
					var m = data.match(/^\$(\d+)$/); // is the regex too superfluous?
					return this.getInput(parseInt(m[1]), true);
				}
			} else {
				// parse standard literal
				if(type === TokenType.FLOAT) {
					// parse as float
					return [this.parseFloat(data), "Float"];
				} else if(type === TokenType.STRING) {
					// remove quotes
					return [data.slice(1, data.length-1), "String"];
				} else if(type === TokenType.REGEX) {
					// remove quotes
					data = data.slice(1, data.length-1);
					// extract regex and flags
					var m = data.match(/^\/(.*)\/(\w*)$/);
					return [RegExp(m[1], m[2]), "Regex"];
				}
			}
		}
	}

	// parse a float
	parseFloat(data) {
		// cases where the float is just a '.'
		return data==="."||!data?0.0:parseFloat(data);
	}

	// get the current input
	// if choose is true, we are getting input using $_,
	//  otherwise we are getting it from $
	getInput(index=this.inputIndex, choose=false) {
		// index-1 because $1 refers to the first input
		// TODO: $0
		if(index-1 < this.input.getChildren().length) {
			// input exists

			var selectedInput = this.input.getChildren()[index-1];

			// don't increment the inputIndex because we are not "using it up"
			if(!choose) {
				this.inputIndex++;
			}

			return this.parseArg(selectedInput);
		} else {
			// input does not exist
			return "";
		}
	}

	// TODO: give better names
	// get current stack object in the sheet
	stack() {
		return this.garden.getCurrStack();
	}

	// get current value of stack (string/float/array)
	getStack() {
		return this.garden.getCurrStack().getStack();
	}

	// get stack mode
	stackMode() {
		return this.garden.getCurrStack().getStackMode();
	}

	// contains functions for commands/operators (I got to choose a name quick)
	initOperators() {
		var context = this;
		var c = context; // golfiness

		// operator function naming:
		//   StackMode + Arg1Type + Arg2Type + ... + ArgNType
		//    [or]
		//   StackMode + Nil
		// TODO: add more ops
		//       add comments (description) to each of the functions
		//       maybe organisize (spelling intended, yes, even the "z" that does not belong there) it
		this.operators = {
			// (up/down)careting, basically caret-mode stuff
			// param: arg1 (a string)
			'^': {
				StringCaret(arg1) {c.stack().setString(c.stack().getString() + arg1);},

				FloatCaret(arg1) {c.stack().setFloat(c.stack().getFloat() + parseFloat(arg1));}
			},

			'v': {
				StringCaret(arg1) {c.stack().setString(arg1 + c.stack().getString());}
			},

			// "proper" commands/operators
			// param: args (an array)
			// PLUS
			'+': {
				StringString(args) {
					c.stack().setString(c.stack().getString() + args[0]);
				},
				StringFloat(args) {
					c.stack().setString(c.stack().getString() + args[0]);
				},

				FloatFloat(args) {
					c.stack().setFloat(c.stack().getFloat() + args[0]);
				},
				FloatString(args) {
					c.stack().setFloat(c.stack().getFloat() + parseFloat(args[0]));
				},

				ArrayNil() {
					c.stack().setFloat(c.stack().getArray().reduce((a,b) => a+b));
				}
			},

			// MINUS
			'-': {
				StringString(args) {
					c.stack().setString(c.stack().getString().split(args[0]).join(""));
				},
				StringFloat(args) {
					c.stack().setString(args[0]>=0?c.stack().getString().slice(args[0])
					:c.stack().getString().slice(0, args[0]));
				},

				FloatNil(args) {
					c.stack().setFloat(-c.stack().getFloat());
				},
				FloatFloat(args) {
					c.stack().setFloat(c.stack().getFloat() - args[0]);
				}
			},

			// ASTERISK
			'*': {
				StringFloat(args) {
					var str = c.stack().getString();
					var newStr = str;
					if(args[0] >= 0) {
						// non-fractional component
						while(args[0] >= 1) {
							newStr += str;
							args[0]--;
						}
						// fractional component
						newStr += str.slice(0, Math.floor(args[0] * str.length));
					} else {
						// TODO; reverse
					}
					c.stack().setString(newStr);
				},

				FloatNil() {
					var num = c.stack().getFloat();
					c.stack().setFloat(num?num>0?1:-1:0);
				},
				FloatFloat(args) {
					c.stack().setFloat(c.stack().getFloat() * args[0]);
				},

				ArrayNil() {
					c.stack().setFloat(c.stack().getArray().reduce((a,b) => a*b));
				}
			},

			// FOR_SLASH
			'/': {
				StringFloat(args) {
					var str = c.stack().getString();
					c.stack().setString(str.slice(0, args[0]) + str.slice(args[0]+1, str.length));
				},
				StringRegex(args) {
					c.stack().setArray(c.stack().getString().match(args[0]));
					c.stack().setStackMode(StackMode.ARRAY);
				},
				StringRegexString(args) {
					c.stack().setString(c.stack().getString().replace(args[0], args[1]));
				},

				FloatNil(args) {
					var frac = c.stack().getFloat().split(/./);
					c.stack().setFloat(parseFloat(frac?frac:"0"));
				},
				FloatFloat(args) {
					c.stack().setFloat(c.stack().getFloat() / args[0]);
				}
			},

			// PERCENT
			'%': {
				StringFloat(args) {
					var str = c.stack().getString();
					c.stack().setString(args[0]>0?str.slice(0,args[0]):str.slice(args[0]));
				},

				FloatFloat(args) {
					c.stack().setFloat(c.stack().getFloat() % args[0]);
				}
			},

			// UPPER_S
			'S': {
				StringNil() {
					//
				},

				FloatNil() {
					c.stack().setStackMode(StackMode.STRING);
					c.stack().setString(c.stack().getFloat() + "");
				},

				ArrayNil() {
					c.stack().setStackMode(StackMode.STRING);
					c.stack().setString(c.stack().getArray().join(""));
				},
				ArrayString(args) {
					c.stack().setStackMode(StackMode.STRING);
					c.stack().setString(c.stack().getArray().join(args[0]));
				},
				ArrayFloat(args) {
					c.stack().setStackMode(StackMode.STRING);
					c.stack().setString(c.stack().getArray().join(args[0]));
				}
			},

			// LOWER_S
			's': {
				StringNil() {
					c.stack().setStackMode(StackMode.STRING);
				},

				FloatNil() {
					c.stack().setStackMode(StackMode.STRING);
				},

				ArrayNil() {
					c.stack().setStackMode(StackMode.STRING);
				}
			},

			// UPPER_F
			'F': {
				StringNil() {
					c.stack().setStackMode(StackMode.FLOAT);
					c.stack().setFloat(c.parseFloat(c.stack().getString()));
				},

				FloatNil() {
					//
				},

				ArrayNil() {
					c.stack().setStackMode(StackMode.FLOAT);
					c.stack().setFloat(parseFloat(c.stack().getArray().join("")));
				}
			},

			// LOWER_F
			'f': {
				StringNil() {
					c.stack().setStackMode(StackMode.FLOAT);
				},

				FloatNil() {
					c.stack().setStackMode(StackMode.FLOAT);
				},

				ArrayNil() {
					c.stack().setStackMode(StackMode.FLOAT);
				}
			},

			// UPPER_A
			'A': {
				StringString(args) {
					c.stack().setStackMode(StackMode.ARRAY);
					c.stack().setArray(c.stack().getString().split(args[0]));
				}
			},

			// LOWER_A
			'a': {
				StringNil() {
					c.stack().setStackMode(StackMode.ARRAY);
				},

				FloatNil() {
					c.stack().setStackMode(StackMode.ARRAY);
				},

				ArrayNil() {
					c.stack().setStackMode(StackMode.ARRAY);
				}
			},

			// START: MOVEMENT COMMANDS
			// LOWER_H
			'h': {
				StringNil() {
					c.garden.moveLeft();
				},

				FloatNil() {
					c.garden.moveLeft();
				},

				ArrayNil() {
					c.garden.moveLeft();
				}
			},

			// LOWER_J
			'j': {
				StringNil() {
					c.garden.moveDown();
				},

				FloatNil() {
					c.garden.moveDown();
				},

				ArrayNil() {
					c.garden.moveDown();
				}
			},

			// LOWER_K
			'k': {
				StringNil() {
					c.garden.moveUp();
				},

				FloatNil() {
					c.garden.moveUp();
				},

				ArrayNil() {
					c.garden.moveUp();
				}
			},

			// LOWER_L
			'l': {
				StringNil() {
					c.garden.moveRight();
				},

				FloatNil() {
					c.garden.moveRight();
				},

				ArrayNil() {
					c.garden.moveRight();
				}
			}
			// END: MOVEMENT COMMANDS
		}
	}
}

// do I need this? yes
function Pascalify(str) {
	return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

// type of
function typeOf(data) {
	switch(typeof(data)) {
		case "number":
			return "Float";
		case "string":
			return "String";
		case "object":
			return "Array";
	}
}
