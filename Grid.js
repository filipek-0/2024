// variables holding the main properties of the grid, enable modular code
import Tile from "./Tile.js";

const BOARD_SIZE = 4
const CELL_SIZE = 20
const CELL_GAP = 1.5

// default Grid class that holds all cells and grid properties
export default class Grid {
    #cells  // private variable, only accessible from Grid class

    constructor(gridElement) {
        // set the property of game-board on STYLESHEET, this sets the variables, only from here and not from css itself
        gridElement.style.setProperty("--board-size", `${BOARD_SIZE}`)
        gridElement.style.setProperty("--cell-size", `${CELL_SIZE}vmin`)
        gridElement.style.setProperty("--cell-gap", `${CELL_GAP}vmin`)
        gridElement.style.setProperty("--cell-bevel", `${CELL_GAP}vmin`)

        // initialise grid cells on start and give them the correct location from indexes which come from the function createCellElements
        this.#cells = createCellElements(gridElement).map((element,index) => {
            return new Cell(
                element,    // using map, the dom constructor is passed into the cell constructor
                index % BOARD_SIZE,
                Math.floor(index / BOARD_SIZE)  // take the floor value, so round down (3.7 = 3)
            )
        })
    }

    get cells() {
        return this.#cells
    }

    //  organizes an array of cell objects into a grid-like structure, grouping them by their x coordinate and mapping them to their y coordinate
    get cellsByColumn() {
        const columns = []    // Create an empty array of arrays to represent the grid
        for (let i = 0; i < 4; i++) {
            columns.push([])
        }
        for (const cell of this.#cells) {
            columns[cell.x].push(cell) // Group cells by x-coordinate, columns[cell.x] gives us the correct subarray to push the cell into
                                        // for cell with x=2, so third column, it is pushed into third column [][][here][]
        }
        return columns; // return the array of arrays
    }

    get cellsByRow() {
        const rows = []     // Create an empty array of arrays to represent the grid
        for (let i = 0; i < 4; i++) {
            rows.push([])
        }
        for (const cell of this.#cells) {
            rows[cell.y].push(cell)     // group cells by y-coordinate, so the row cells are together
        }
        return rows;
    }

    // return an array of all empty cells
    get #emptyCells() {
        return this.#cells.filter(cell => cell.tile == null)    // keep only cells that haven't got tile
    }

    // return a random cell that is empty
    randomEmptyCell() {
        const randomIndex = Math.floor(Math.random() * this.#emptyCells.length)
        return this.#emptyCells[randomIndex]
    }
}

// Cell class that holds the location of the cells inside the grid
class Cell {
    #cellElement    // holds the reference to the html DOM, the div element that visually represents cell
    #x
    #y
    #tile       // if not null, it holds a number which is the basic object in 2048
    #mergeTile  // for merging tiles together, a temporary object which is set back to null after merge is done

    constructor(cellElement, x, y) {
        this.#cellElement = cellElement;    // the DOM is assigned to cellElement variable here in the constructor
        this.#x = x      // holds the position
        this.#y = y
    }

    get tile() {
        return this.#tile
    }

    set tile(value) {
        this.#tile = value
        if (value == null) return   // if null, do nothing
        this.#tile.x = this.#x      // assign the x value of a Tile object to this tile property of cell
        this.#tile.y = this.#y      // same but with y value
    }

    get x() {
        return this.#x
    }

    get y() {
        return this.#y
    }

    get mergeTile() {
        return this.#mergeTile
    }

    set mergeTile(value) {
        this.#mergeTile = value
        if (value == null) return
        this.#mergeTile.x = this.#x
        this.#mergeTile.y = this.#y
    }

    canAccept(tile) {
        return (this.tile == null || (this.tile.value === tile.value && this.mergeTile == null))
    }

    mergeTiles() {
        if (this.tile == null || this.mergeTile == null) return     // if we do not have both tiles to be merged, do nothing
        this.tile.value = this.tile.value + this.mergeTile.value  // create new tile instance to use setter later
        this.mergeTile.remove()
        this.mergeTile = null
    }
}

// on start, create all cells for grid, depending on BOARD_SIZE
function createCellElements(gridElement) {
    const allCells = []     // array to hold all cells
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {     // iterate depending on board size
        const cell = document.createElement("div")  // create div element
        cell.classList.add("cell")  // give it a cell class
        allCells.push(cell)         // push onto array allCells
        gridElement.append(cell)    // make a child of game-board
    }
    return allCells
}
