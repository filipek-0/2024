import Grid from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")

// pass gameBoard element (a grid) into Grid class where we define it and give it parameters
const grid = new Grid(gameBoard)

function setInput() {
    setTouch()
    window.addEventListener("keydown", handleInput, {once:true})
}

function setTouch() {
    let touchStartX = 0;
    let touchStartY = 0;
    let direction = null;

    document.addEventListener("touchstart", e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, {once:true});

    document.addEventListener("touchmove", e => {
        e.preventDefault();
    }, {passive:false});

    document.addEventListener("touchend", e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const distX = touchEndX - touchStartX;
        const distY = touchEndY - touchStartY;

        direction = calculateDirection(distX, distY);

        handleInput({ key: direction }, { once: true });
    }, {once: true});
}

function calculateDirection(distX, distY) {
    if (Math.abs(distX) > Math.abs(distY)) {
        if (distX > 0) return "ArrowRight";
        else return "ArrowLeft";
    }
    else {
        if (distY > 0) return "ArrowDown";
        else return "ArrowUp";
    }
}

// listening for new game button click
document.querySelectorAll(".newgame-board").forEach(button => button.addEventListener("click", startNewGame));

// score functionality
let score = 0;
let bestScore = getBestScore();
let scoreDisplay = document.getElementById("current-score-num");
let bestScoreDisplay = document.getElementById("best-score-num");

// game over functionality
let isGameOver = false;
const gameOverScreen = document.getElementById("game-over-screen")

loadGameState();

scoreDisplay.innerHTML = score;
bestScoreDisplay.innerHTML = bestScore;

// async enables us to wait until all animations are finished before calling possible merging functions
// await pauses the execution of an async function until a Promise is resolved or rejected, in moveTiles
async function handleInput(e) {
    switch (e.key) {
        case "ArrowUp":
            if (!canMoveUp()){  // check whether a move is possible, if not, reject and wait for input
                setInput()
                triggerShakeVertical()
                return
            }
            await moveUp();
            break;
        case "ArrowDown":
            if (!canMoveDown()){
                setInput()
                triggerShakeVertical()
                return
            }
            await moveDown();
            break;
        case "ArrowLeft":
            if (!canMoveLeft()){
                setInput()
                triggerShakeHorizontal()
                return
            }
            await moveLeft();
            break;
        case "ArrowRight":
            if (!canMoveRight()){
                setInput()
                triggerShakeHorizontal()
                return
            }
            await moveRight();
            break;
        default:
            setInput()
            return
    }

    grid.cells.forEach(cell => cell.mergeTiles())   // iterate over all cells to try to merge tiles

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile   // generate a new tile after movement
    saveGameState()

    // check for a losing state
    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(() => { // by passing true, we aren't waiting for transition, but for animation end
            gameOver();
        })
        return  // exit handleInput function, no more input possible
    }

    setInput()
}

function startNewGame() {
    isGameOver = false;
    grid.clearCells();
    gameOverScreen.classList.remove("show")
    gameOverScreen.classList.add("hidden")
    score = 0;
    scoreDisplay.innerHTML = score;
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    setInput();
}

function gameOver() {
    isGameOver = true;
    saveGameState();
    gameOverScreen.classList.add("show");
    gameOverScreen.classList.remove("hidden");
    document.getElementById("final-score").textContent = score;
}

function saveGameState() {
    //variable for the tiles information
    const tileData = grid.cells
        .filter(cell => cell.tile)
        .map(cell => ({
            x: cell.x,
            y: cell.y,
            value: cell.tile.value
        }));

    // variable for the overall state
    const state = {
        tiles: tileData,
        score: score,
        bestScore: Math.max(score, getBestScore()),
        gameOver: isGameOver
    };
    localStorage.setItem("gameState", JSON.stringify(state));
}

function loadGameState() {
    const state = JSON.parse(localStorage.getItem("gameState"))
    if (!state || state.gameOver) {
        startNewGame()
        return
    }

    score = state.score
    scoreDisplay.innerHTML = score

    grid.clearCells()

    gameOverScreen.classList.remove("show")
    gameOverScreen.classList.add("hidden")

    state.tiles.forEach(({ x, y, value }) => {
        const cell = grid.cells.find(c => c.x === x && c.y === y);
        if (!cell) return;
        const tile = new Tile(gameBoard);
        tile.value = value;
        cell.tile = tile;
    });

    setInput()
}

function triggerShakeHorizontal() {
    gameBoard.classList.add("shake-h");

    gameBoard.addEventListener("animationend", () => {
        gameBoard.classList.remove("shake-h");
    }, { once: true });
}

function triggerShakeVertical() {
    gameBoard.classList.add("shake-v");

    gameBoard.addEventListener("animationend", () => {
        gameBoard.classList.remove("shake-v");
    }, { once: true });
}

function updateBestScore() {
    localStorage.setItem("bestScore", score)
    bestScore = score;
    bestScoreDisplay.innerHTML = bestScore;
}

function getBestScore() {
    return parseInt(localStorage.getItem("bestScore")) || 0;
}

function moveUp() {
    return moveTiles(grid.cellsByColumn)
}

function moveDown() {
    return moveTiles(grid.cellsByColumn.map(column => [...column].reverse()))   // [...column] creates a shallow column of the array to prevent modifying original// map goes over each element of the array, in this case another array, the columns
}

function moveLeft() {
    return moveTiles(grid.cellsByRow)
}

function moveRight() {
    return moveTiles(grid.cellsByRow.map(rows => [...rows].reverse()))
}

function moveTiles(cells) {
    return Promise.all(     // promises are placeholders for future values, either succeed or fail
    cells.flatMap(group => {
        const promises = []
        for (let i = 1; i < group.length; i++) {
            const cell = group [i]
            if (cell.tile == null) continue     // if there is no tile, skip the whole move implementation
            let lastValidCell = null
            for (let j = i - 1; j >= 0; j--) { // gets us the cell directly above (for moveUp)
                const moveToCell = group[j]
                if (!moveToCell.canAccept(cell.tile)) break    // if the cell above is not empty, impossible to move
                lastValidCell = moveToCell  // last cell possible to move to
            }
            if (lastValidCell != null) {    // if we can move it, do the following
                promises.push(cell.tile.waitForTransition())     // every time we have a tile that can move, wait for animation to finish
                if (lastValidCell.tile != null) {      // if it has a tile, we must try to merge
                    lastValidCell.mergeTile = cell.tile
                    score += cell.tile.value * 2;      // for every merge, increase score by the merged value
                    scoreDisplay.innerHTML = score;
                    if (score > getBestScore()) updateBestScore();
                } else {        // if it doesn't have a tile, just move the current to the last valid
                    lastValidCell.tile = cell.tile
                }
                cell.tile = null        // either way, current is not needed anymore
            }
        }
        return promises     // return final array of promises
    }))
}

function canMoveUp() {
    return canMove(grid.cellsByColumn)  // similar functionality to moveTiles, argument depends on direction
}

function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
    return canMove(grid.cellsByRow)
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

// check whether a move is possible
function canMove(cells) {
    return cells.some(group => {    // some iterates over the array until it finds an element that satisfies the condition, early exit
        return group.some((cell, index) => {    // the some() function takes three arguments, array itself, current element and index
            if (index === 0) return false           // if it's a border element, return false
            if (cell.tile == null) return false     // if the cell does not have a tile, cannot be moved, return false
            const cellNextTo = group[index - 1]     // check cell that we want to move to
            return cellNextTo.canAccept(cell.tile)  // true if it has the same value or if cellNextTo is empty
        })
    })
}