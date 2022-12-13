var keysDown = new Set();

class MicrogameInput {
    static bindings = {
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
    #sensitivity = 0.4;
    static bindings = {
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
        var val = this.#gamepad[inputVal[2]][inputVal[3]];
        if (val instanceof GamepadButton){
            val = val.value;
        }
        return ((inputVal[1] === "-") ? -1 : 1) * val >= this.#sensitivity;
    }

    update() {
        for (var binding in this.bindings) {
            var t = performance.now();
            var i = this.getInput(this.bindings[binding]);
            if (i && !keysDown.has(binding)) {
                this.pressKey(binding, "down");
                keysDown.add(binding);
            } else if (!i && keysDown.has(binding)) {
                this.pressKey(binding, "up");
                keysDown.delete(binding);
            }
        }
    }
}

class MicrogameInputManager {
    #microgameInputs = {};
    constructor() {
        this.#microgameInputs = { "keyboard": new MicrogameKeyboard()};
    }

    static get defaultBindingStrings() {
        var bindingsStrings = {};
        for (var dir in MicrogameKeyboard.bindings) {
            var dirStringName = dir.replace("Arrow", "").toLowerCase();
            if (dir === " ") {
                dirStringName = "space";
            }
            var stringToAdd = MicrogameKeyboard.bindings[dir][0];
            if (stringToAdd === " ") {
                stringToAdd = "Space";
            }
            bindingsStrings[dirStringName] = stringToAdd;
        }
        for (var dir in MicrogameGamepad.bindings) {
            var dirStringName = dir.replace("Arrow", "").toLowerCase();
            if (dir === " ") {
                dirStringName = "space";
            }
            bindingsStrings[dirStringName] += "," + MicrogameGamepad.bindings[dir];
        }
        return bindingsStrings;
    }

    updateInput() {
        if (!!navigator.getGamepads) {
            for (var gamepad of navigator.getGamepads()) {
                if (gamepad === null) {
                    continue;
                }
                if (!(gamepad.id in this.#microgameInputs)) {
                    this.#microgameInputs[gamepad.id] = new MicrogameGamepad(gamepad);
                }
            }
        }
        for (var input in this.#microgameInputs) {
            this.#microgameInputs[input].update();
        }
    }

    gameStartInputUpdate() {
        for (var input in this.#microgameInputs) {
            this.#microgameInputs[input].gameStartInputUpdate();
        }
    }
}

var GlobalInputManager = new MicrogameInputManager();

export default GlobalInputManager;