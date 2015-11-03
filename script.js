function getQueryVariable(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

//window.onload = function() {
  console.log("Started");
  var b = document.getElementById("b");
  var t = document.getElementById("t");
  var n = document.getElementById("n");
  
  t.textContent = getQueryVariable("code");
  console.log(getQueryVariable("code") +":"+ getQueryVariable("input"));
  n.textContent = getQueryVariable("input");
//};

var f = function() {
  var t = document.getElementById("t");
  var p = document.getElementById("p");
  var n = document.getElementById("n");
  p.textContent = Main(t.value, n.value + "") + "";
}

//code for prime number checker taken from https://github.com/vihanb/TeaScript/blob/master/teascript.js
var checkForPrime = function(number) {
  var start = 2;
  while (start <= Math.sqrt(number)) {
    if (number % start++ < 1) return false;
  }
  return number > 1;
}

var evaluate = function(match) {
  return eval(match);
}

var Main = function(_input, _args) {
  var stack = "";
  var typeMode = "string";
  if (_input.indexOf("^") == -1) {
    var stack = _input + "";
    var args = _args;
    if (stack.indexOf("#") != -1) {
      stack = stack.replace(/#/g, args);
    }
    if (stack.indexOf("$") != -1) {
      stack = stack.replace(/\$/g, parseInt(args));
    }
    stack = stack.replace(/\(([^\(\)]*)\)/g, evaluate);
  } else {
    //Variables
    var input = _input.split(/\^/);
    var args = _args;
    var stack = input[0] + "";
    var ops = input[1];
    var stackVar = stack; //TODO
    var stackInt = 0;
    var stackIntVar = stackInt; //TODO
    var stackBool = true;
    var stackBoolVar = stackBool;
    var isInt = false;
    var typeMode = "string";

    //Carrot variables: # and *
    if (ops.indexOf("#") != -1) {
      ops = ops.replace(/#/g, "\"" + args + "\"");
    }
    if (ops.indexOf("$") != -1) {
      ops = ops.replace(/\$/g, parseInt(args));
    }
    if (stack.indexOf("#") != -1) {
      stack = stack.replace(/#/g, args);
    }
    if (stack.indexOf("$") != -1) {
      stack = stack.replace(/\$/g, parseInt(args));
    }

    ops = ops.replace(/\(([^\(\)]*)\)/g, evaluate);

    //checking if caret is missing
    try {
      console.log(ops.length);
    } catch (e) {
      //alert("No code");
    }

    //Iterating through the operators.
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      try {
        var nextChar = ops[i + 1];
      } catch (e) {
        nextChar = 0;
      }
      //console.log(nextChar);
      switch (op) {
        case "i":
          //Convert to integer
          stackInt = parseInt(stack);
          stackIntVar = stackInt;
          typeMode = "int";
          break;
        case "P":
          if (stackInt !== 0) {
            stackBool = checkForPrime(stackInt);
          } else {
            stackBool = checkForPrime(parseInt(stack));
          }
          typeMode = "bool";
          break;
        case "*":
          //Multiply '*'
          switch (nextChar) {
            case "\"":
              break
            case "\'":
              break;
            default:
              //number
              var num = 0;
              var matched = false;
              var numRe = /\d+/;
              var match = numRe.exec(ops.substring(i, ops.length));
              num = parseInt(match);
              stackInt *= num;
              for (var j = 0; j++ < num;) {
                stack += stackVar;
              }
          }
          break;
        case "-":
          //Subtract '-'
          switch (nextChar) {
            case "\"":
              break
            case "\'":
              break;
            default:
              //number
              var num = 0;
              var matched = false;
              var numRe = /\d+/;
              var match = numRe.exec(ops.substring(i, ops.length));
              num = parseInt(match);
              stackInt -= num;
              stack = stack.substring(0, stack.length - num);
          }
          break;
        case "+":
          //Add '+'
          if (!(nextChar == "\"")) {
            //number
            var num = 0;
            var matched = false;
            var numRe = /\d+/;
            var match = numRe.exec(ops.substring(i, ops.length));
            i = i + match.length;
            num = parseInt(match);
            stackInt += num;
            stack += num;
          } else {
            //string
            var string = "";
            var matched = false;
            var stringRe = /\"([^\"]*)\"/;
            var match = stringRe.exec(ops.substring(i + 1, ops.length));
            string = match[1]; //getting the captured group
            i = i + 2 + string.length;
            if (typeMode == "int") {
              //converting to string
              typeMode = "string";
              stack = stackInt + string;
            } else if (typeMode == "string") {
              stack += string;
            }
          }

          break;
      }
    }
  }

  switch (typeMode) {
    case "string":
      return stack;
      break;
    case "int":
      return stackInt;
      break;
    case "bool":
      return stackBool;
      break;
  }
}
