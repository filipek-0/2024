// variables holding the main properties of the grid, enable modular code
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
        // initialise grid cells on start and give them the correct location from indexes which come from the function create...
        this.#cells = createCellElements(gridElement).map((element,index) => {
            return new Cell(
                element,
                index % BOARD_SIZE,
                Math.floor(index / BOARD_SIZE)  // take the floor value, so round down (3.7 = 3)
            )
        })

    }
}

// Cell class that holds the location of the cells inside the grid
class Cell {
    #cellElement    // private variables
    #x
    #y

    constructor(cellElement, x, y) {
        this.#cellElement = cellElement;
        this.#x = x      // holds
        this.#y = y
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