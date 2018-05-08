# Carrot

Carrot is an esoteric string-based programming language made for code-golfing. It's memory is based around a two-dimensional tape called a garden. Each cell on the garden contains three variables, a string, float and an array.

Carrot works on a 2D tape, called a garden. Each cell on the garden is made up of three stack modes, string, float, array. There is a value for each mode, called a "stack" (note: misnomer). These stacks begin empty. When a cell is at a particular mode, the following commands will affect the stack that corresponds to this mode, for example in float mode, the operations will affect the stack float. And of course, there are commands for switching between modes. The modes are important because each operator can be overloaded for each mode and each argument type.

In addition, there are two additional modes (these only affect the commands, not the stack directly), normal mode and caret mode. Normal mode works normally, where there are operators taking in arguments and affecting the stack directly. In caret mode, (almost) every character is interpreted literally as a string, and is later prepended/appended accordingly to the stack. Caret mode is started/ended with carets (append) or down-carets (prepend).

Carrot begins in a cell on the garden, in stack-string mode, and in caret mode.

## Usage

    carrot [-d] -f <file> [input]
    carrot [-d] <code> [input]

## Run tests

    node test/test.js
