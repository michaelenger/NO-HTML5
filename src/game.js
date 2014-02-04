"use strict";
requirejs.config({
	baseUrl: 'src',
	paths: {
		lib: '../lib/'
	}
});

require(['lib/pixi', 'board', 'cell'], function(PIXI, Board, Cell) {

	/**
	 * NO - A game of numbers.
	 */
	var Game = function(element) {
		var width = element.clientWidth,
			height = element.clientHeight,
			gridSize = 6;

		// Set the stage
		this.stage = new PIXI.Stage(0xf0f3f7);
		this.renderer = PIXI.autoDetectRenderer(width, height);
		element.appendChild(this.renderer.view);

		// Setup the board
		this.board = new Board(width / 2, height * 0.6, height * 0.6, gridSize);
		this.stage.addChild(this.board);
		this.board.addEventListener("clicked", this.boardClicked.bind(this));

		// Setup the cells
		this.cells = [];
		for (var x = 0; x < gridSize; x++) {
			this.cells[x] = [];
			for (var y = 0; y < gridSize; y++) {
				this.cells[x][y] = undefined;
			}
		}

		// Generate the puzzle and show hints
		this.puzzle = this.generatePuzzle(gridSize);
		var hints = this.buildHints(this.puzzle);
		for (var x = 0; x < hints.vertical.length; x++) {
			var content = hints.vertical[x].join("\n"),
				text = new PIXI.Text(content, {
				font: "bold " + (this.board.cellSize * 0.5) + "px Arial",
				fill: "#444444",
				align: "center"
			});
			text.anchor.x = 0.5;
			text.anchor.y = 1;
			text.position.x = this.board.x - (this.board.width / 2) + ((x + 0.5) * this.board.cellSize);
			text.position.y = this.board.y - (this.board.height / 2) - (this.board.cellSize * 0.1);
			this.stage.addChild(text);
		}
		for (var y = 0; y < hints.horizontal.length; y++) {
			var content = hints.horizontal[y].join(" ") + " ",
				text = new PIXI.Text(content, {
				font: "bold " + (this.board.cellSize * 0.5) + "px Arial",
				fill: "#444444",
				align: "center"
			});
			text.anchor.x = 1;
			text.anchor.y = 0.5;
			text.position.x = this.board.x - (this.board.width / 2) - (this.board.cellSize * 0.1);
			text.position.y = this.board.y - (this.board.height / 2) + ((y + 0.5) * this.board.cellSize);
			this.stage.addChild(text);
		}

		// Begin the loop
		this.draw();
	};

	/**
	 * Board was clicked.
	 */
	Game.prototype.boardClicked = function(event) {
		var position, cell;

		if (this.cells[event.detail.x-1][event.detail.y-1]) {
			cell = this.cells[event.detail.x-1][event.detail.y-1];
			if (cell.type == Cell.FILLED) {
				cell.type = Cell.HINT;
				cell.redraw();
			} else {
				this.stage.removeChild(cell);
				this.cells[event.detail.x-1][event.detail.y-1] = undefined;
			}
		} else {
			position = this.board.translatePosition(event.detail);
			cell = new Cell(position.x, position.y, this.board.cellSize - 2, Cell.FILLED);
			this.stage.addChild(cell);
			this.cells[event.detail.x-1][event.detail.y-1] = cell;
		}
	};

	/**
	 * Build hints from a puzzle.
	 */
	Game.prototype.buildHints = function(puzzle) {
		var hints = {
			horizontal: [],
			vertical: []
		};
		var tempHorizontal = [];

		for (var x = 0; x < puzzle.length; x++) {
			var current = 0;
			hints.vertical[x] = [];
			for (var y = 0; y < puzzle[x].length; y++) {
				if (!tempHorizontal[y]) {
					tempHorizontal[y] = [];
				}

				tempHorizontal[y].push(puzzle[x][y]);

				if (puzzle[x][y]) {
					current++;
				} else if (current != 0) {
					hints.vertical[x].push(current);
					current = 0;
				}
			}
			if (current != 0) {
				hints.vertical[x].push(current);
			}
		}

		for (var y = 0; y < tempHorizontal.length; y++) {
			var current = 0;
			hints.horizontal[y] = [];
			for (var i = 0; i < tempHorizontal[y].length; i++) {
				if (tempHorizontal[y][i]) {
					current++;
				} else if (current != 0) {
					hints.horizontal[y].push(current);
					current = 0;
				}
			}
			if (current != 0) {
				hints.horizontal[y].push(current);
			}
		}

		return hints;
	};

	/**
	 * Generate a new puzzle.
	 */
	Game.prototype.generatePuzzle = function(size) {
		var cells = [];
		for (var x = 0; x < size; x++) {
			cells[x] = [];
			for (var y = 0; y < size; y++) {
				cells[x][y] = Math.floor(Math.random() * (10 - 2) + 1) < 5 ? true : false;
			}
		}

		// Debug display of the puzzle
		var lines = [];
		for (var x = 0; x < cells.length; x++) {
			for (var y = 0; y < cells[x].length; y++) {
				if (!lines[y]) {
					lines[y] = "";
				}
				lines[y] += cells[x][y] ? "X" : "O";
			}
		}
		console.log(lines.join("\n"));
		return cells;
	};

	/**
	 * Render the stage.
	 */
	Game.prototype.draw = function() {
		this.renderer.render(this.stage);
		requestAnimFrame(this.draw.bind(this));
	};

	// Let's go!
	var game = document.getElementById("game");
	new Game(game); // let's go

});
