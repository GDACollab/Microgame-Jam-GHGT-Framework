var keysDown = new Set();

class MicrogameInput {
    bindings = {
        "ArrowUp": ["ArrowUp"],
        "ArrowDown": ["ArrowDown"],
        "ArrowRight": ["ArrowRight"],
        "ArrowLeft": ["ArrowLeft"],
        " ": [" "]
    };

    pressKey(key, isDown) {
        document.getElementById("game").contentWindow.dispatchEvent(new KeyboardEvent(`key${isDown}`, {
            key: key,
            code: (key === " ") ? "Space" : key
        }));
        
        document.body.dispatchEvent(new KeyboardEvent(`key${isDown}`, {
            key: key,
            code: (key === " ") ? "Space" : key
        }));
    }

    update() {

    }

    gameStartInputUpdate() {
        
    }
}

// Because the Keyboard API is still experimental, we're just going to use standard oninput stuff.
class MicrogameKeyboard extends MicrogameInput {
    #reverseBindings = {
        "ArrowUp": "ArrowUp",
        "ArrowDown": "ArrowDown",
        "ArrowRight": "ArrowRight",
        "ArrowLeft": "ArrowLeft",
        " ": " "
    };
    bindings;

    constructor() {
        super();
        document.body.addEventListener("keydown", this.#interruptInput.bind(this));
        document.getElementById("game").contentWindow.addEventListener("keydown", this.#interruptInput.bind(this));
    }

    // TODO: Fix to work so that you can send keys in place of the standard arrows.
    #interruptInput(ev) {
        if (!(ev.key in this.#reverseBindings)) {
            ev.preventDefault();
        }
    }

    gameStartInputUpdate() {
        document.getElementById("game").contentWindow.addEventListener("keydown", this.#interruptInput.bind(this));
    }
}

class MicrogameGamepad extends MicrogameInput {
    #gamepad;
    #sensitivity = 0.2;
    bindings = {
        "ArrowUp": ["-axes1"],
        "ArrowDown": ["axes1"],
        "ArrowLeft": ["-axes0"],
        "ArrowRight": ["axes0"],
        " ": ["buttons0"]
    };

    constructor(gamepad) {
        super();
        this.#gamepad = gamepad;
    }

    #inputMatch = /(-)?(axes|buttons)(\d)+/;

    getInput(control) {
        var inputVal = this.#inputMatch.exec(control);
        return this.#gamepad[inputVal[2]][inputVal[3]].value >= this.#sensitivity * ((inputVal[1] === "-") ? -1 : 1);
    }

    update() {
        for (var binding in this.bindings) {
            if (this.getInput(this.bindings[binding])) {
                this.pressKey(binding, "down");
                keysDown.add(binding);
            } else if (keysDown.has(binding)) {
                this.pressKey(binding, "up");
                keysDown.delete(binding);
            }
        }
    }
}

var microgameinputs = { "keyboard": new MicrogameKeyboard()};

function updateInput() {
    if (!!navigator.getGamepads) {
        for (var gamepad of navigator.getGamepads()) {
            if (gamepad === null) {
                continue;
            }
            if (!gamepad.id in microgameinputs) {
                microgameinputs[gamepad.id] = new MicrogameGamepad(gamepad);
            }
        }
    }
    for (var input in microgameinputs) {
        microgameinputs[input].update();
    }
}

function gameStartInputUpdate() {
    for (var input in microgameinputs) {
        microgameinputs[input].gameStartInputUpdate();
    }
}

export {updateInput, gameStartInputUpdate};