window.onload = function() {
  console.log("Started");
  var b = document.getElementById("b");
  //function called when Execute Program button is clicked
  b.onclick = function() {
    var program = document.getElementById("program");
    var output = document.getElementById("output");
    output.innerText = ""; //clearing output
    var input = document.getElementById("input");
    var programResult = Main(program.value, input.value + "");
    output.innerText = programResult;
    console.log("Output: " + programResult);
    console.log("---------------");
  }
  var program = document.getElementById("program");
  var input = document.getElementById("input");

  //console.log(getQueryVariable("code") +":"+ getQueryVariable("input"));

  //t.textContent = getQueryVariable("code");
  //n.textContent = getQueryVariable("input");
};

//IMPORTANT GLOBAL VARS
var stack = "";
var code = "";
var input = [];

var noCaretBuilding = true;
var stackI = 0;
var stackF = 0.0;
var stackA = [];
var stackMode = ""; //"" = String; I = int; F = float; A = array
var operationMode = "";
 
var buildMode = "";
var stringBuilding;
var stringBuilder;
var stringMode;
var intBuilding;
var intBuilder;
var floatBuilding;
var floatBuilder;
var regexBuilding;
var regexBuilder
var regexMode;

var caretFuncMode = "n"; //n for normal, e for escape
//parsing the c^rrot datetype
function caret(char, input, stack) {
  console.log(char);
  if (caretFuncMode == "e") {
    caretFuncMode = "n";
    return char;
  }
  if (char === "^") return null;
  if (char === "#") return input.join("\n");
	if (char === "$") {
		return input.shift(-1);
	}
  if (char === "\\") {
    caretFuncMode = "e";
    return "";
  }
  return char;
}

//applying monad operations
function applyOperation(arg) {
  //what to do for each op
  switch (operationMode) {
    //TODO: add support for other stack types
    case "+":
      if (stringBuilder !== "") {
				if(stackMode === "A") {
					stackMode = "";
					stack = stackA.join(stringBuilder);
				}else{
        	stackMode = "";
        	stack += stringBuilder;
				}
        stringBuilder = "";
				buildMode="";
      } else if (floatBuilder !== "") {
        //v for converting int to float if necessary
        if (stackMode === "I" && /\./.test(floatBuilder)) {
          stackMode = "F";
          stackF = stackI + 0.0;
        }
				if(stackMode === "A") {
					for(var i=0; i<stackA.length; i++) {
						stackA[i] = parseFloat(stackA[i]+"")+parseFloat(floatBuilder);
					}
				}else{
        	eval(`stack${stackMode} += parseFloat(${floatBuilder})`);
				}
        floatBuilder = "";
				buildMode="";
      } else if(arg === " ") {
				if(stackMode === "A") {
					stackMode = "F";
					stackF = 0.0;
					for(element of stackA) {
						stackF += parseFloat(element+"");
					}
				}
			}
      break;
    case "-":
      if (stringBuilder !== "") {
        stackMode = "";
        stack = stack.split(stringBuilder).join("");
        stringBuilder = "";
				buildMode="";
      } else if (floatBuilder !== "") {
        //v for converting int to float if necessary
        if (stackMode === "I" && /\./.test(floatBuilder)) {
          stackMode = "F";
          stackF = stackI + 0.0;
        }
				if(stackMode === "A") {
					for(var i=0; i<stackA.length; i++) {
						stackA[i] = parseFloat(stackA[i]+"")-parseFloat(floatBuilder);
					}
				}else{
					if(stackMode === "") {
						stack = stack.substring(parseInt(floatBuilder+""));
					}else {
  	      	eval(`stack${stackMode} -= parseFloat(${floatBuilder})`);
					}
				}
        floatBuilder = "";
				buildMode="";
      }
      break;
    case "*":
			//TODO: add support for string stack type
      if (stringBuilder !== "") {/*
        stackMode = "";
        stack = stack.split(stringBuilder).join("");
        stringBuilder = "";*/
				buildMode="";
      } else if (floatBuilder !== "") {
        //v for converting int to float if necessary
        if (stackMode === "I" && /\./.test(floatBuilder)) {
          stackMode = "F";
          stackF = stackI + 0.0;
        }
				if(stackMode === "A") {
					for(var i=0; i<stackA.length; i++) {
						stackA[i] = parseFloat(stackA[i]+"")*parseFloat(floatBuilder);
					}
					break;
				}else{
					if(stackMode === "") {
						//TODO: fractional number support
						var originalStack = stack;
						for(var i=0;i<parseInt(floatBuilder+"");i++) {
							stack+=originalStack;
						}
					}else {
  	      	eval(`stack${stackMode} *= parseFloat(${floatBuilder})`);
					}
				}
        floatBuilder = "";
				buildMode="";
      } else if(arg === " ") {
				if(stackMode === "A") {
					stackMode = "F";
					stackF = 1.0;
					for(element of stackA) {
						stackF *= parseFloat(element+"");
					}
				}
			}
      break;
	  case "\/":
			//TODO: add support for string stack type
      if (regexBuilder !== "") {
        regexMode = "n";
				stackMode = "A";
        eval(`stackA=stack.match(${regexBuilder})`);
        regexBuilder = "";
				buildMode="";
      } else if (floatBuilder !== "") {
        //v for converting int to float if necessary
        if (stackMode === "I" && /\./.test(floatBuilder)) {
          stackMode = "F";
          stackF = stackI + 0.0;
        }
				if(stackMode === "A") {
					for(var i=0; i<stackA.length; i++) {
						stackA[i] = parseFloat(stackA[i]+"")/parseFloat(floatBuilder);
					}
					break;
				}else{
					if(stackMode === "") {
          	var spliceIndex=parseInt(floatBuilder+"");
						stack=stack.slice(0,spliceIndex)+stack.slice(spliceIndex+1,stack.length);
					}else {
  	      	eval(`stack${stackMode} /= parseFloat(${floatBuilder})`);
					}
				}
        floatBuilder = "";
				buildMode="";
      }
      break;
  }
  operationMode = "";
}

//MAIN function
function Main(_input, _args) {
  stack = ""; //setting it to empty
  stackI = 0;
	stackF = 0.0;
	stackA = [];
  caretMode = true;
  stackMode = ""; //"" = string, I = int
  caretFuncMode = "n";
  operationMode = ""; //" for string building

	buildMode="";
  stringBuilding = false;
  stringBuilder  = "";
  stringMode     = "n"; //n is normal, e is escape
  intBuilding = false;
  intBuilder  = "";
  floatBuilding = false;
  floatBuilder  = "";
	regexBuilding = false;
	regexBuilder  = "";
	regexMode     = "n"; //n is normal, f is flag

  code = _input;
  input = _args.split("\n");
  for (var i = 0; i < code.length; i++) {
    var onChar = code[i]; //this is the char we are processing
    if (caretMode) {
      var caretResult = caret(onChar, input, stack);
      if (caretResult === null) caretMode = false;
      else stack += caretResult;
    } else {
      //building the string
      if (stringBuilding) {
				if(stringMode == "e") {
					stringBuilder += onChar;
					stringMode = "n";
					continue;
				}
        switch (onChar) {
          case "\"":
            stringBuilding = false;
            break;
          case "\\":
            stringMode = "e";
            continue;
					case "$":
						stringBuilder += (input.shift(-1));
						continue;
					case "#":
						stringBuilder += input.join("\n");
						continue;
          default:
            stringBuilder += onChar;
            console.log("stringBuilder=" + stringBuilder);
            continue;
        }
      }

      //for stringbuilding
      if (onChar == "\"" && stringBuilder == "" && buildMode === "") {
        stringBuilding = true;
				buildMode="s";
        continue;
      }
			
			//float arg using "$"
			if(operationMode !== "" && buildMode === "" && /[$#]/.test(onChar)) {
				if(stackMode === "F" && onChar === "$") {
					floatBuilder = parseFloat(input.shift(-1)+"");
					applyOperation();
				}else if(stackMode === "") {
					stringBuilder = onChar==="$"?input.shift(-1):input.join("\n");
				}
			}
			
      //floatbuilding
      if (floatBuilding) {
        if (/[0-9\.]/.test(onChar)) {
          floatBuilder += onChar;
          console.log("floatBuilder=" + floatBuilder);
          if (i === code.length - 1) {
            floatBuilding = false;
          } else {
            continue;
          }
        } else {
          floatBuilding = false;
					applyOperation();
        }
      }
      //floatbuilding
      if (/[0-9\.\-]/.test(onChar) && floatBuilder === "" && operationMode !== "" && buildMode === "") {
        floatBuilding = true;
				buildMode="f";
        floatBuilder += onChar;
        console.log("floatBuilder=" + floatBuilder);
        if (i !== code.length - 1) continue;
      }
			
			//regexBuilding
			if (regexBuilding) {
				if (regexMode === "n") {
          regexBuilder += onChar;
					
					if(onChar === "\/") {
						if(i !== code.length - 1) {
							regexMode = "f";
							continue;
						}else{
							applyOperation();
						}	
					}else {
						continue;
					}
				}else if(regexMode === "f") {
					regexBuilder += onChar;
					if(/gmif/.test(onChar)) {
						regexBuilder += onChar;
						if(i === code.length-1) {
							applyOperation();
						}else{
							continue;
						}
					}else{
						regexBuilding = false;
						applyOperation();
					}
				}
			}
			
			//regexBuilding
			if (onChar === "\/" && regexBuilder === "" && operationMode !== "" && buildMode === "") {
				regexBuilding = true;
				buildMode="r";
				regexBuilder += onChar;
				console.log("regexBuilder=" + regexBuilder);
				regexMode = "n";
				continue;
			}

      //normal operations
      if (operationMode == "") {
        switch (onChar) {
          case '^':
            caretMode = true;
            break;
          case 'I':
            //v for handling case of empty stack
            eval(`stackI = parseFloat((stack${stackMode}+"").length>0?stack${stackMode}+"":"0")`);
            stackMode = "I";
            break;
          case 'F':
            eval(`stackF = parseFloat((stack${stackMode}+"").length>0?stack${stackMode}+"":"0")`);
            stackMode = "F";
            break;
          case 'S':
            eval(`stack = stack${stackMode}+""`);
            stackMode = "";
            break;
					case 'A':
						//monad it takes the next char as arg
						eval(`stackA = (stack${stackMode}+"").split(\`${code[i+1]+""}\`)`);
						stackMode = "A";
						i++;
						break;
					default:
						operationMode = onChar;
        }
        continue;
      } else {
				console.log(operationMode);
				applyOperation(onChar);
        continue;
      }
    }
  }

  return eval(`stack${stackMode}`);
}

/**
 * TODO:
 * =====
 * 
 * intBuilder            [ ]
 * convert to string     [x]
 * fix bug with 1^I+4S+4 [x]
 * - for stack (string)  [x]
 * negative numbers      [x]
 * * op for fraction and negatives for stack [ ]
 * / op for stack with regex arg             [x]
 * / op for stack with int arg               [x]
 * operation support for arrays              [ ]
 * - stringMode string arg substitution      [ ]
 **/

/**
 * DOCS (will update as I complete commands)
 * =========================================
 *
 * stack^operations^... (goes on endlessly)
 *  - stack  = string
 *  - stackI = int (also float maybe)
 *
 *  (int is inaccurately used to describe any number)
 *
 * data types:
 *  there are 4 types of constants in carrot: c^rrot, string, number, array, regex
 *
 *  c^rrot: data
 *  string: "data" (has escape characters)
 *  num: 123.456
 *  regex: /^(\d)u+$/gmi
 *  space: ` `
 *
 * operators:
 *  ops are defined by their type (monad or nilad), the arguments they take
 *  (int or string or regex) and the stackMode (string, float, int, array, ...)
 *
 *  nilads (takes in 0 arguments):
 *   I F S
 *  monads:
 *   + - * / A
 *
 * list of operators
 *  I = converts to intMode
 *  F = converts to floatMode
 *  S = converts to stringMode
 *  A = converts to arrayMode by splitting at next char
 *  + = string concatenation/int addition
 *  - = string (remove_all_instancesOf/substring)/int subtraction 
 *  * = string (/multi-duplication)/int multiplication
 *  / = string (regex_match/remove_char_at_index)/int division
 **/
