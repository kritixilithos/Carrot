'use strict';

let Stack = require("./stack.js");

// the Garden, aka the sheet (2D tape, a tape of tapes)
// enter the zen
module.exports = class Garden {
	constructor(_sheet) {
		// remember, 2D array
		this.sheet = _sheet || [[new Stack()]];
		// PVector
		this.pos = {
			x: 0,
			y: 0
		};
	}

	// clone, TODO
	clone() {
		var size = this.getSize();
		var arr = [];

		// iterate through every cell in the garden
		for(var row = 0; row < size.height; row++) {
			var temp = [];
			for(var col = 0; col < size.width; col++) {
				temp.push(this.getStackAt({x: col, y: row}).clone());
			}
			arr.push(temp);
		}
		return new Garden(arr);
	}

	// returns object
	getPos() {
		return this.pos;
	}

	// return size of sheet
	getSize() {
		return {
			height: this.sheet.length,
			width: this.sheet[0].length
		};
	}

	// basically getStackAt(this.getPos())
	getCurrStack() {
		return this.sheet[this.pos.y][this.pos.x];
	}

	// self-explanatory
	getStackAt(position) {
		return this.sheet[position.y][position.x];
	}

	// move right
	moveRight(n = 1) {
		if(this.pos.x < this.getSize().width - 1) {
			// boundaries fine
			this.pos.x++;
		} else {
			// grid small, so generate column to right
			this.sheet.map(a=>a.push(new Stack()));
			this.pos.x++;
		}
		if(--n) {
			this.moveRight(n);
		}
	}

	// move left
	moveLeft(n = 1) {
		if(this.pos.x > 0) {
			// boundaries fine
			this.pos.x--;
		} else {
			// grid small, so generate column to left
			this.sheet.map(a=>[new Stack()].concat(a));
		}
		if(--n) {
			this.moveLeft(n);
		}
	}

	// move down
	moveDown(n = 1) {
		if(this.pos.y < this.getSize().height-1) {
			// boundaries fine
			this.pos.y++;
		} else {
			// grid small, so generate column to bottom
			this.sheet.push(this.sheet[0].map(a=>new Stack()));
			this.pos.y++;
		}
		if(--n) {
			this.moveDown(n);
		}
	}

	// move up
	moveUp(n = 1) {
		if(this.pos.y > 0) {
			// boundaries fine
			this.pos.y--;
		} else {
			// grid small, so generate column to top
			this.sheet = [this.sheet[0].map(a=>new Stack())].concat(this.sheet);
		}
		if(--n) {
			this.moveUp(n);
		}
	}
}
