'use strict';

let Lexer = require("./lexer.js");

// enums
let TokenType = require("./tokenType.js");
let NodeType = require("./nodeType.js");

// Node imports
let ArrayNode = require("./arrayNode.js");
let Caret = require("./caret.js");
let Command = require("./command.js");
let FunctionCall = require("./functionCall.js");
let Literal = require("./literal.js");
let Loop = require("./loop.js");
let Normal = require("./normal.js");
let Program = require("./program.js");
let Subshell = require("./subshell.js");

/*
 * Difference between FunctionCall and Command
 *  The Command Node is a childNode and only contains the operator token
 *  The FunctionCall Node is a parentNode and contains a Command Node and 0 or more Literal Nodes
 * */

module.exports = class Parser {
	constructor(code, parseInput=false, debug) {
		// are we parsing the input?
		this.parseInput = parseInput;

		this.code = code;
		this.lexer = new Lexer(this.code, this.parseInput);

		this.AST = null;
		this.currIndex = null;

		if(!this.parseInput) {
			// the AST
			this.AST = new Program();
			// start with an  up-caret, hence the true
			this.AST.addChild(new Caret(true));

			// a variable that contains the indices of the current node
			// 0th index of Program.children
			this.currIndex = [0];
		} else {
			this.AST = new ArrayNode();
			this.currIndex = [];
		}

		// for console.log'ing the AST
		this.width = 1;

		// debug AST and tokenisation
		this.debug = debug;
	}

	// parse program
	parse() {
		// looping through tokens
		for(var token = this.lexer.nextToken(); token.type !== TokenType.EOF; token = this.lexer.nextToken()) {
			//console.log(">" + this.currIndex);
			//console.log(">" + token.type + " " + token.data);
			//this.visitNode(this.AST);

			// skip tokens with empty data or whitespace
			if(token.data.length<1 || token.type === TokenType.WHITESPACE) {
				continue;
			}

			// TODO: improve documentation and comments
			if(token.type === TokenType.CARET_START) {
				// add a Caret node
				this.goUpTo(NodeType.NORMAL);
				this.addNodeToParent(new Caret(token.data === '^'));

			} else if(token.type === TokenType.CARET_END) {
				// add a Normal mode node
				this.goUpTo(NodeType.CARET);
				this.addNodeToParent(new Normal());
			} else if(token.type === TokenType.CARET_DATA) {
				this.goUpTo(NodeType.CARET);
				this.addNodeToCurr(new Literal(token));

				// LOOPing
			} else if(token.type === TokenType.L_BRACKET) {
				this.goUpTo(NodeType.NORMAL);
				this.addNodeToCurr(new Loop());
				this.addNodeToCurr(new Normal());
			} else if(token.type === TokenType.R_BRACKET) {
				this.goUpTo(NodeType.LOOP);
				this.goUpBy(1);

				// subshell stuff
			} else if(token.type === TokenType.L_PAREN) {
				// add a subshell
				this.goUpTo([NodeType.CARET, NodeType.FUNCTION_CALL]);
				this.addNodeToCurr(new Subshell());
				this.addNodeToCurr(new Caret(true));
			} else if(token.type === TokenType.R_PAREN) {
				this.goUpTo(NodeType.SUBSHELL);
				this.goUpBy(1);

			} else if(token.type === TokenType.OPERATOR) {
				// add a FunctionCall node
				this.goUpTo(NodeType.NORMAL);
				this.addNodeToCurr(new FunctionCall(new Command(token)));

				// array stuff
			} else if(token.type === TokenType.L_BRACE) {
				// add an ArrayNode
				//this.goUpBy(1);
				this.goUpTo([NodeType.FUNCTION_CALL, NodeType.ARRAY]);
				this.addNodeToCurr(new ArrayNode());
			} else if(token.type === TokenType.R_BRACE) {
				this.goUpTo([NodeType.ARRAY]);
				this.goUpBy(1);
				this.goUpTo([NodeType.FUNCTION_CALL, NodeType.ARRAY]);
				//this.currIndex.pop();

			} else if(this.tokenIsLiteral(token)) {
				// add a Literal node to the FunctionCall node (assuming it already exists)
				this.goUpTo([NodeType.FUNCTION_CALL, NodeType.ARRAY, NodeType.CARET]);
				this.addNodeToCurr(new Literal(token));
			}

			if(this.debug) {
				console.log(token);
			}
		}

		if(this.debug) {
			console.log("");
			this.visitNode(this.AST);
		}
		return this.AST;
	}

	// [*] denotes the current node
	// start: Parent -> Parent [*]
	//
	// end:   Parent -> Parent
	//               -> Parent [*]
	addNodeToParent(_node) {
		var a = this.currIndex.pop();
		this.currNode().addChild(_node);
		this.currIndex.push(a+1);
	}

	// start: Parent -> Parent [*]
	// end  : Parent -> Parent -> Parent [*]
	//           or
	// end  : Parent -> Parent -> Child [*]
	addNodeToCurr(_node) {
		//console.log(this.currNode().getName());
		this.currNode().addChild(_node);
		this.currIndex.push(this.currNode().getChildren().length-1);
		//if(!_node.isChild())
	}

	// go up to a selected node type
	// start: Parent [type1]    -> Parent [type2] -> Child [type3][*]
	//  goUpTo(type1)
	// end:   Parent [type1][*] -> Parent [type2] -> Child [type3]
	goUpTo(_nodeType) {
		//console.log("GOTO");
		if(_nodeType[0].length === 1) _nodeType = [_nodeType];
		var flag = false;
		for(var a of _nodeType) {
			if(this.currNode().getName() === a) {
				flag = true;
			}
		}
		if(!flag) {
			this.currIndex.pop();
			this.goUpTo(_nodeType);
		}
	}

	goUpBy(n) {
		for(;n--;) this.currIndex.pop();
	}

	// return the current node
	currNode() {
		//console.log("CURRNODE");
		//console.log(this.currIndex);
		var temp = this.AST;
		for(var a of this.currIndex) {
			temp = temp.getChildren()[a];
		}
		//console.log(temp);
		//console.log("temp");
		return temp;
	}

	// return the node at indices
	nodeAt(inds) {
		var temp = this.AST;
		for(var a of inds) {
			temp = temp.children[a];
		}
		return temp;
	}

	// drop the last element of this.currIndex
	parentInds() {
		return this.currIndex.slice(0, this.currIndex.length-1);
	}

	// if this isn't useful, remove it
	depth() {
		return this.currIndex.length;
	}

	// display AST
	// TODO: improve comments
	visitNode(node, depth=0, inds=[], maxInds=[]) {
		var log = "";

		// print the box "ascii"-art (it's really Unicode)
		for(var q=0; q<inds.length; q++) {
			// ternary trickery
			log+=((inds[q]==maxInds[q]-1)?q==inds.length-1?"└"+"─".repeat(this.width):" "+" ".repeat(this.width):inds[q]!==maxInds[q]-1&&q==inds.length-1?"├"+"─".repeat(this.width):"│"+" ".repeat(this.width));
		}

		// print information about the node
		console.log(log + node.getDescription());

		// visit child nodes
		if(!node.isChild()) {
			var L = node.getChildren().length;
			var I = 0;
			for(var a of node.getChildren()) {
				this.visitNode(a, depth+1, inds.concat([I]), maxInds.concat([L]));
				I++;
			}
		}
	}

	// returns true for literals except for CARET_DATA
	tokenIsLiteral(_token) {
		var a = _token.type;
		return a === TokenType.FLOAT ||
			a === TokenType.REGEX ||
			a === TokenType.STRING ||
			a === TokenType.INPUT_ARG;
	}
}
