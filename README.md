# Carrot

Carrot is an esoteric string-based programming language (esolang) made for code-golfing. It's memory is based around a two-dimensional tape (called a garden). Each cell on the garden contains three variables, a string, float and an array.

## Recent Changes


22 August 2017,

Carrot v1.0 beta (node-only)

This is the biggest change to Carrot (after almost 2 years). The browser
port will happen shortly. Some changes include:

 - a parser that converts the source code to an AST, and then passes it to the interpreter
 - added () subshells
 - added [] loops
 - added {} arrays
 - Carrot's memory is now in a garden (2-dimensional tape)
 - operators can now take a variable number of arguments (allows for powerful operator overloading)
 - and Carrot is finally turing complete!

17 April 2017,

 - Added the `v` down-caret to prepend instead of append to the stack

14 April 2017,

 - Fixed bug with leading whitespace (but not trailing whitespace)

3 March 2017,

 - Added the `%` modulo operator for floatArg in floatMode

28 February 2017,

 - Fixed bug with `$` as a float arg in floatMode
