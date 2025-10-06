export default class Tile {
    #tileElement    // stores the DOM element representing the tile
    #x
    #y
    #value

    constructor(gameBoard, value = Math.random() > 0.5 ? 2 : 4) {
        this.#tileElement = document.createElement("div")
        this.#tileElement.classList.add("tile")
        gameBoard.append(this.#tileElement)
        this.value = value  // when assigning a value to a property that has a setter, the method is automatically invoked
        this.#tileElement.textContent = value    // set the HTML text of the div tile element
    }

    get value() {
        return this.#value
    }

    get tileElement() {
        return this.#tileElement
    }

    set value(v) {
        this.#value = v
        const power = Math.log2(v)
        this.#tileElement.textContent = v   // update text of the html div element
        this.updateColor(power)     // update colour based on the power of tile number
    }

    set x(value) {
        this.#x = value
        // this is going to position it on the correct location on our screen from inside css
        this.#tileElement.style.setProperty("--x", value)
    }

    set y(value) {
        this.#y = value
        this.#tileElement.style.setProperty("--y", value)
    }

    remove() {
        this.#tileElement.remove()
    }

    waitForTransition(animation = false) {
        return new Promise(resolve => {
            this.#tileElement.addEventListener(animation ? "animationend" : "transitionend", resolve, {once: true})
        })  // wait for transition to end in order to continue moveTiles or animation end when checking for losing
    }

    updateColor(power) {
        switch (power) {
            case 1:
                this.#tileElement.style.setProperty("--background-color", '#FFC8C2')
                break;
            case 2:
                this.#tileElement.style.setProperty("--background-color", '#FFB6AD')
                break;
            case 3:
                this.#tileElement.style.setProperty("--background-color", '#FFA399')
                break;
            case 4:
                this.#tileElement.style.setProperty("--background-color", '#FF9185')
                break;
            case 5:
                this.#tileElement.style.setProperty("--background-color", '#FF7E70')
                break;
            case 6:
                this.#tileElement.style.setProperty("--background-color", '#FF6250')
                break;
            case 7:
                this.#tileElement.style.setProperty("--background-color", '#FF4733')
                break;
            case 8:
                this.#tileElement.style.setProperty("--background-color", '#FF3345')
                break;
            case 9:
                this.#tileElement.style.setProperty("--background-color", '#E3254A')
                break;
            case 10:
                this.#tileElement.style.setProperty("--background-color", '#D21C4A')
                break;
            case 11:
                this.#tileElement.style.setProperty("--background-color", '#BC1755')
                break;
            default:
                this.#tileElement.style.setProperty("--background-color", '#1C1B2D')
        }
        if (power > 6) {
            this.#tileElement.style.setProperty("--color", '#FFDCD8')
        } else {
            this.#tileElement.style.setProperty("--color", '#1C1B2D')
        }
    }
}